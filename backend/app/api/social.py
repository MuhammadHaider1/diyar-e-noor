from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, Follow, Notification, Post
from app.models.enums import NotificationType
from app.schemas.schemas import FollowResponse, NotificationResponse, UserPublicProfile

router = APIRouter(prefix="/social", tags=["social"])


@router.post("/users/{user_id}/follow")
async def toggle_follow(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")

    target = await db.get(User, user_id)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    result = await db.execute(
        select(Follow).where(Follow.follower_id == current_user.id, Follow.following_id == user_id)
    )
    existing = result.scalar_one_or_none()

    if existing:
        await db.delete(existing)
        await db.flush()
        return {"following": False, "followers_count": await _get_followers_count(db, user_id)}
    else:
        follow = Follow(follower_id=current_user.id, following_id=user_id)
        db.add(follow)
        notification = Notification(
            recipient_id=user_id,
            sender_id=current_user.id,
            type=NotificationType.follow,
        )
        db.add(notification)
        await db.flush()
        return {"following": True, "followers_count": await _get_followers_count(db, user_id)}


@router.get("/users/{user_id}/followers")
async def get_followers(
    user_id: int,
    page: int = 1,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Follow)
        .where(Follow.following_id == user_id)
        .options(selectinload(Follow.follower))
        .order_by(Follow.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    result = await db.execute(query)
    follows = result.scalars().all()

    total_result = await db.execute(select(func.count(Follow.id)).where(Follow.following_id == user_id))
    total = total_result.scalar()

    return {
        "items": [FollowResponse.model_validate(f) for f in follows],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
    }


@router.get("/users/{user_id}/following")
async def get_following(
    user_id: int,
    page: int = 1,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Follow)
        .where(Follow.follower_id == user_id)
        .options(selectinload(Follow.following))
        .order_by(Follow.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    result = await db.execute(query)
    follows = result.scalars().all()

    total_result = await db.execute(select(func.count(Follow.id)).where(Follow.follower_id == user_id))
    total = total_result.scalar()

    return {
        "items": [FollowResponse.model_validate(f) for f in follows],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
    }


@router.get("/users/{user_id}/profile")
async def get_user_public_profile(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    followers_count = await _get_followers_count(db, user_id)
    following_count = await _get_following_count(db, user_id)
    posts_count = await _get_posts_count(db, user_id)

    is_following = False
    if current_user.id != user_id:
        result = await db.execute(
            select(Follow).where(Follow.follower_id == current_user.id, Follow.following_id == user_id)
        )
        is_following = result.scalar_one_or_none() is not None

    return UserPublicProfile(
        id=user.id,
        username=user.username,
        display_name=user.display_name,
        avatar_url=user.avatar_url,
        bio=user.bio,
        role=user.role,
        created_at=user.created_at,
        followers_count=followers_count,
        following_count=following_count,
        posts_count=posts_count,
        is_following=is_following,
    )


@router.get("/users/{user_id}/profile-public")
async def get_user_public_profile_no_auth(
    user_id: int,
    db: AsyncSession = Depends(get_db),
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    followers_count = await _get_followers_count(db, user_id)
    following_count = await _get_following_count(db, user_id)
    posts_count = await _get_posts_count(db, user_id)

    return UserPublicProfile(
        id=user.id,
        username=user.username,
        display_name=user.display_name,
        avatar_url=user.avatar_url,
        bio=user.bio,
        role=user.role,
        created_at=user.created_at,
        followers_count=followers_count,
        following_count=following_count,
        posts_count=posts_count,
        is_following=False,
    )


@router.get("/notifications")
async def get_notifications(
    page: int = 1,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(Notification)
        .where(Notification.recipient_id == current_user.id)
        .options(selectinload(Notification.sender), selectinload(Notification.post))
        .order_by(Notification.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    result = await db.execute(query)
    notifications = result.scalars().all()

    total_result = await db.execute(
        select(func.count(Notification.id)).where(Notification.recipient_id == current_user.id)
    )
    total = total_result.scalar()

    items = []
    for n in notifications:
        items.append(NotificationResponse(
            id=n.id,
            recipient_id=n.recipient_id,
            sender_id=n.sender_id,
            type=n.type,
            post_id=n.post_id,
            comment_id=n.comment_id,
            is_read=n.is_read,
            created_at=n.created_at,
            sender=UserPublicProfile(
                id=n.sender.id,
                username=n.sender.username,
                display_name=n.sender.display_name,
                avatar_url=n.sender.avatar_url,
                bio=n.sender.bio,
                role=n.sender.role,
                created_at=n.sender.created_at,
            ) if n.sender else None,
            post_title=n.post.title if n.post else None,
        ))

    return {
        "items": items,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
    }


@router.get("/notifications/unread-count")
async def get_unread_count(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(func.count(Notification.id)).where(
            Notification.recipient_id == current_user.id,
            Notification.is_read == False,
        )
    )
    count = result.scalar()
    return {"count": count}


@router.patch("/notifications/{notification_id}/read")
async def mark_as_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.recipient_id == current_user.id,
        )
    )
    notification = result.scalar_one_or_none()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.is_read = True
    await db.flush()
    return {"success": True}


@router.patch("/notifications/read-all")
async def mark_all_as_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Notification).where(
            Notification.recipient_id == current_user.id,
            Notification.is_read == False,
        )
    )
    notifications = result.scalars().all()
    for n in notifications:
        n.is_read = True
    await db.flush()
    return {"success": True, "count": len(notifications)}


@router.delete("/notifications/{notification_id}")
async def delete_notification(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.recipient_id == current_user.id,
        )
    )
    notification = result.scalar_one_or_none()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    await db.delete(notification)
    await db.flush()
    return {"success": True}


async def _get_followers_count(db: AsyncSession, user_id: int) -> int:
    result = await db.execute(select(func.count(Follow.id)).where(Follow.following_id == user_id))
    return result.scalar()


async def _get_following_count(db: AsyncSession, user_id: int) -> int:
    result = await db.execute(select(func.count(Follow.id)).where(Follow.follower_id == user_id))
    return result.scalar()


async def _get_posts_count(db: AsyncSession, user_id: int) -> int:
    result = await db.execute(select(func.count(Post.id)).where(Post.admin_id == user_id, Post.status == "published"))
    return result.scalar()
