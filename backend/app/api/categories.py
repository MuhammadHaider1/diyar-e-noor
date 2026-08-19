from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import Category, User
from app.schemas.schemas import CategoryCreate, CategoryUpdate, CategoryResponse
from app.api.deps import get_current_user, require_super_admin, get_optional_user

router = APIRouter(tags=["categories"])


@router.get("/categories", response_model=list[CategoryResponse])
async def list_categories(
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Category).where(Category.is_active == True).order_by(Category.sort_order, Category.id)
    )
    return result.scalars().all()


@router.get("/categories/all", response_model=list[CategoryResponse])
async def list_all_categories(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    result = await db.execute(
        select(Category).order_by(Category.sort_order, Category.id)
    )
    return result.scalars().all()


@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    existing = await db.execute(select(Category).where(Category.slug == category_data.slug))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category with this slug already exists")

    category = Category(**category_data.model_dump())
    db.add(category)
    await db.flush()
    await db.refresh(category)
    return category


@router.put("/categories/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    update_data = category_data.model_dump(exclude_unset=True)
    if "slug" in update_data and update_data["slug"] != category.slug:
        existing = await db.execute(select(Category).where(Category.slug == update_data["slug"]))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category with this slug already exists")

    for key, value in update_data.items():
        setattr(category, key, value)

    await db.flush()
    await db.refresh(category)
    return category


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    await db.delete(category)


@router.patch("/categories/{category_id}/toggle", response_model=CategoryResponse)
async def toggle_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    category.is_active = not category.is_active
    await db.flush()
    await db.refresh(category)
    return category


@router.patch("/categories/reorder")
async def reorder_categories(
    order: list[int],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_super_admin)
):
    for index, cat_id in enumerate(order):
        result = await db.execute(select(Category).where(Category.id == cat_id))
        category = result.scalar_one_or_none()
        if category:
            category.sort_order = index
    await db.flush()
    return {"success": True}
