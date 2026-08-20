from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.models import Comment, Post, User, Like, Notification
from app.models.enums import NotificationType
from app.schemas.schemas import CommentCreate, CommentUpdate, CommentResponse, UserResponse
from app.api.deps import get_current_user, get_optional_user

router = APIRouter(tags=["comments"])


def _comment_to_response(comment: Comment, replies=None) -> dict:
    return {
        "id": comment.id,
        "post_id": comment.post_id,
        "user_id": comment.user_id,
        "content": comment.content,
        "parent_id": comment.parent_id,
        "created_at": comment.created_at,
        "user": comment.user,
        "replies": replies or [],
    }


@router.get("/posts/{post_id}/comments", response_model=list[CommentResponse])
async def get_comments(
    post_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Comment).where(Comment.post_id == post_id, Comment.parent_id == None)
        .options(selectinload(Comment.user))
    )
    comments = result.scalars().all()

    response = []
    for comment in comments:
        replies_result = await db.execute(
            select(Comment).where(Comment.parent_id == comment.id)
            .options(selectinload(Comment.user))
        )
        replies = replies_result.scalars().all()
        response.append(_comment_to_response(comment, replies))
    return response


@router.post("/posts/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    post_id: int,
    comment_data: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post_result = await db.execute(select(Post).where(Post.id == post_id))
    if not post_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    if comment_data.parent_id:
        parent_result = await db.execute(select(Comment).where(Comment.id == comment_data.parent_id))
        if not parent_result.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent comment not found")

    comment = Comment(
        post_id=post_id,
        user_id=current_user.id,
        content=comment_data.content,
        parent_id=comment_data.parent_id
    )
    db.add(comment)
    await db.flush()
    await db.refresh(comment)

    post_result = await db.execute(select(Post).where(Post.id == post_id))
    post = post_result.scalar_one()

    if comment_data.parent_id:
        parent_result = await db.execute(
            select(Comment).where(Comment.id == comment_data.parent_id)
        )
        parent_comment = parent_result.scalar_one()
        if parent_comment.user_id != current_user.id:
            db.add(Notification(
                recipient_id=parent_comment.user_id,
                sender_id=current_user.id,
                type=NotificationType.reply,
                post_id=post_id,
                comment_id=comment.id,
            ))
    else:
        if post.admin_id != current_user.id:
            db.add(Notification(
                recipient_id=post.admin_id,
                sender_id=current_user.id,
                type=NotificationType.comment,
                post_id=post_id,
                comment_id=comment.id,
            ))
    await db.flush()

    result = await db.execute(
        select(Comment).where(Comment.id == comment.id)
        .options(selectinload(Comment.user))
    )
    return _comment_to_response(result.scalar_one())


@router.put("/comments/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: int,
    comment_data: CommentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this comment")

    comment.content = comment_data.content
    await db.flush()

    result = await db.execute(
        select(Comment).where(Comment.id == comment.id)
        .options(selectinload(Comment.user))
    )
    return _comment_to_response(result.scalar_one())


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this comment")
    await db.delete(comment)


@router.post("/posts/{post_id}/like")
async def toggle_like(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post_result = await db.execute(select(Post).where(Post.id == post_id))
    if not post_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    result = await db.execute(select(Like).where(Like.post_id == post_id, Like.user_id == current_user.id))
    like = result.scalar_one_or_none()

    if like:
        await db.delete(like)
        return {"liked": False}
    else:
        like = Like(post_id=post_id, user_id=current_user.id)
        db.add(like)

        post_result = await db.execute(select(Post).where(Post.id == post_id))
        post = post_result.scalar_one()
        if post.admin_id != current_user.id:
            db.add(Notification(
                recipient_id=post.admin_id,
                sender_id=current_user.id,
                type=NotificationType.like,
                post_id=post_id,
            ))

        return {"liked": True}
