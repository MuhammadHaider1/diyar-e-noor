from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from slugify import slugify
from app.core.database import get_db
from app.models.models import Post, User, Like, Comment, Follow, Notification
from app.models.enums import PostStatus, PostCategory, NotificationType
from app.schemas.schemas import PostCreate, PostUpdate, PostResponse, PaginatedResponse
from app.api.deps import get_current_user, require_admin, get_optional_user

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("", response_model=PaginatedResponse)
async def list_posts(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    category: PostCategory = None,
    status: PostStatus = PostStatus.published,
    search: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_optional_user)
):
    query = select(Post).options(selectinload(Post.admin))
    count_query = select(func.count(Post.id))

    if status:
        query = query.where(Post.status == status)
        count_query = count_query.where(Post.status == status)
    if category:
        query = query.where(Post.category == category)
        count_query = count_query.where(Post.category == category)
    if search:
        query = query.where(Post.title.ilike(f"%{search}%"))
        count_query = count_query.where(Post.title.ilike(f"%{search}%"))

    total_result = await db.execute(count_query)
    total = total_result.scalar()

    query = query.order_by(Post.created_at.desc())
    query = query.offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    posts = result.scalars().all()

    post_responses = []
    for post in posts:
        likes_count_result = await db.execute(select(func.count(Like.id)).where(Like.post_id == post.id))
        likes_count = likes_count_result.scalar()
        comments_count_result = await db.execute(select(func.count(Comment.id)).where(Comment.post_id == post.id))
        comments_count = comments_count_result.scalar()

        is_liked = False
        is_following_author = False
        if current_user:
            like_result = await db.execute(select(Like).where(Like.post_id == post.id, Like.user_id == current_user.id))
            is_liked = like_result.scalar_one_or_none() is not None
            if post.admin_id != current_user.id:
                follow_result = await db.execute(
                    select(Follow).where(Follow.follower_id == current_user.id, Follow.following_id == post.admin_id)
                )
                is_following_author = follow_result.scalar_one_or_none() is not None

        post_response = PostResponse.model_validate(post)
        post_response.likes_count = likes_count
        post_response.comments_count = comments_count
        post_response.is_liked = is_liked
        post_response.is_following_author = is_following_author
        post_responses.append(post_response)

    return PaginatedResponse(
        items=post_responses,
        total=total,
        page=page,
        pages=(total + limit - 1) // limit
    )


@router.get("/{slug}", response_model=PostResponse)
async def get_post(
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_optional_user)
):
    result = await db.execute(select(Post).options(selectinload(Post.admin)).where(Post.slug == slug))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    post.views_count += 1
    await db.flush()

    likes_count_result = await db.execute(select(func.count(Like.id)).where(Like.post_id == post.id))
    likes_count = likes_count_result.scalar()
    comments_count_result = await db.execute(select(func.count(Comment.id)).where(Comment.post_id == post.id))
    comments_count = comments_count_result.scalar()

    is_liked = False
    is_following_author = False
    if current_user:
        like_result = await db.execute(select(Like).where(Like.post_id == post.id, Like.user_id == current_user.id))
        is_liked = like_result.scalar_one_or_none() is not None
        if post.admin_id != current_user.id:
            follow_result = await db.execute(
                select(Follow).where(Follow.follower_id == current_user.id, Follow.following_id == post.admin_id)
            )
            is_following_author = follow_result.scalar_one_or_none() is not None

    post_response = PostResponse.model_validate(post)
    post_response.likes_count = likes_count
    post_response.comments_count = comments_count
    post_response.is_liked = is_liked
    post_response.is_following_author = is_following_author
    return post_response


@router.post("", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_data: PostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    base_slug = slugify(post_data.title)
    slug = base_slug
    counter = 1
    while True:
        result = await db.execute(select(Post).where(Post.slug == slug))
        if not result.scalar_one_or_none():
            break
        slug = f"{base_slug}-{counter}"
        counter += 1

    post = Post(
        admin_id=current_user.id,
        title=post_data.title,
        slug=slug,
        content=post_data.content,
        cover_image_url=post_data.cover_image_url,
        category=post_data.category,
        status=post_data.status
    )
    db.add(post)
    await db.flush()
    await db.refresh(post)

    if post.status == PostStatus.published:
        followers_result = await db.execute(
            select(Follow.follower_id).where(Follow.following_id == current_user.id)
        )
        follower_ids = [row[0] for row in followers_result.fetchall()]
        for fid in follower_ids:
            if fid != current_user.id:
                db.add(Notification(
                    recipient_id=fid,
                    sender_id=current_user.id,
                    type=NotificationType.new_post,
                    post_id=post.id,
                ))
        await db.flush()

    post_response = PostResponse.model_validate(post)
    post_response.likes_count = 0
    post_response.comments_count = 0
    return post_response


@router.put("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: int,
    post_data: PostUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    result = await db.execute(select(Post).options(selectinload(Post.admin)).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    if post.admin_id != current_user.id and current_user.role != "super_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this post")

    if post_data.title is not None:
        post.title = post_data.title
        post.slug = slugify(post_data.title)
    if post_data.content is not None:
        post.content = post_data.content
    if post_data.cover_image_url is not None:
        post.cover_image_url = post_data.cover_image_url
    if post_data.category is not None:
        post.category = post_data.category
    if post_data.status is not None:
        post.status = post_data.status

    await db.flush()
    await db.refresh(post)

    likes_count_result = await db.execute(select(func.count(Like.id)).where(Like.post_id == post.id))
    likes_count = likes_count_result.scalar()
    comments_count_result = await db.execute(select(func.count(Comment.id)).where(Comment.post_id == post.id))
    comments_count = comments_count_result.scalar()

    post_response = PostResponse.model_validate(post)
    post_response.likes_count = likes_count
    post_response.comments_count = comments_count
    return post_response


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    result = await db.execute(select(Post).options(selectinload(Post.admin)).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    if post.admin_id != current_user.id and current_user.role != "super_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this post")
    await db.delete(post)
