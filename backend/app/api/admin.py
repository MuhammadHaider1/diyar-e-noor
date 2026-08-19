from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.models import User, AdminSubscription, AdminRequest
from app.models.enums import UserRole, SubscriptionStatus, AdminRequestStatus
from app.schemas.schemas import SubscriptionCreate, SubscriptionResponse, AdminManage, AdminRequestCreate, AdminRequestResponse, AdminRequestReview
from app.api.deps import get_current_user, require_super_admin

router = APIRouter(tags=["admin"])


@router.post("/admin/subscribe", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_subscription(
    sub_data: SubscriptionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == UserRole.super_admin:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Super admins cannot subscribe")

    amount = 999.0
    transaction_id = f"TXN-{current_user.id}-{int(datetime.now(timezone.utc).timestamp())}"

    subscription = AdminSubscription(
        user_id=current_user.id,
        status=SubscriptionStatus.active,
        amount=amount,
        payment_method=sub_data.payment_method,
        transaction_id=transaction_id,
        started_at=datetime.now(timezone.utc),
        expires_at=datetime.now(timezone.utc) + timedelta(days=30)
    )
    db.add(subscription)

    current_user.role = UserRole.admin
    await db.flush()
    await db.refresh(subscription)
    return subscription


@router.get("/admin/subscription-status", response_model=SubscriptionResponse)
async def get_subscription_status(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(AdminSubscription)
        .where(AdminSubscription.user_id == current_user.id)
        .order_by(AdminSubscription.created_at.desc())
    )
    subscription = result.scalar_one_or_none()
    if not subscription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No subscription found")

    if subscription.status == SubscriptionStatus.active and subscription.expires_at:
        if subscription.expires_at < datetime.now(timezone.utc):
            subscription.status = SubscriptionStatus.expired
            current_user.role = UserRole.user
            await db.flush()

    return subscription


@router.get("/superadmin/admins")
async def list_admins(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    result = await db.execute(select(User).where(User.role == UserRole.admin))
    admins = result.scalars().all()
    return admins


@router.patch("/superadmin/admins/{user_id}")
async def manage_admin(
    user_id: int,
    admin_data: AdminManage,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.role = admin_data.role
    await db.flush()
    await db.refresh(user)
    return user


@router.get("/superadmin/payments")
async def list_payments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    result = await db.execute(select(AdminSubscription).order_by(AdminSubscription.started_at.desc()))
    payments = result.scalars().all()
    return payments


@router.post("/admin/request", response_model=AdminRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_admin_request(
    request_data: AdminRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role in [UserRole.admin, UserRole.super_admin]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You are already an admin")

    existing = await db.execute(
        select(AdminRequest).where(
            AdminRequest.user_id == current_user.id,
            AdminRequest.status == AdminRequestStatus.pending
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You already have a pending request")

    request = AdminRequest(
        user_id=current_user.id,
        categories=",".join(request_data.categories),
        experience=request_data.experience,
        statement=request_data.statement,
        status=AdminRequestStatus.pending
    )
    db.add(request)
    await db.flush()
    await db.refresh(request)
    return request


@router.get("/admin/request-status")
async def get_my_request_status(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(AdminRequest)
        .where(AdminRequest.user_id == current_user.id)
        .order_by(AdminRequest.created_at.desc())
    )
    requests = result.scalars().all()
    return requests


@router.get("/superadmin/admin-requests")
async def list_admin_requests(
    status: AdminRequestStatus = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    query = select(AdminRequest).options(selectinload(AdminRequest.user))
    if status:
        query = query.where(AdminRequest.status == status)
    query = query.order_by(AdminRequest.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.patch("/superadmin/admin-requests/{request_id}")
async def review_admin_request(
    request_id: int,
    review_data: AdminRequestReview,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    result = await db.execute(select(AdminRequest).where(AdminRequest.id == request_id))
    request = result.scalar_one_or_none()
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    request.status = review_data.status
    request.reviewed_by = current_user.id
    request.review_note = review_data.review_note
    request.reviewed_at = datetime.now(timezone.utc)

    if review_data.status == AdminRequestStatus.approved:
        user_result = await db.execute(select(User).where(User.id == request.user_id))
        user = user_result.scalar_one_or_none()
        if user:
            user.role = UserRole.admin

    await db.flush()
    await db.refresh(request)
    return request
