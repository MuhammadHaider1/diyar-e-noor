from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.enums import UserRole, PostCategory, PostStatus, SubscriptionStatus, PaymentMethod, AdminRequestStatus


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    display_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: UserRole
    display_name: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    refresh_token: str


class PostCreate(BaseModel):
    title: str
    content: str
    cover_image_url: Optional[str] = None
    category: PostCategory
    status: PostStatus = PostStatus.draft


class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    cover_image_url: Optional[str] = None
    category: Optional[PostCategory] = None
    status: Optional[PostStatus] = None


class PostResponse(BaseModel):
    id: int
    admin_id: int
    title: str
    slug: str
    content: str
    cover_image_url: Optional[str]
    category: PostCategory
    status: PostStatus
    views_count: int
    created_at: datetime
    updated_at: datetime
    admin: Optional[UserResponse] = None
    likes_count: int = 0
    comments_count: int = 0
    is_liked: bool = False

    class Config:
        from_attributes = True


class CommentCreate(BaseModel):
    content: str
    parent_id: Optional[int] = None


class CommentUpdate(BaseModel):
    content: str


class CommentResponse(BaseModel):
    id: int
    post_id: int
    user_id: int
    content: str
    parent_id: Optional[int]
    created_at: datetime
    user: Optional[UserResponse] = None
    replies: list["CommentResponse"] = []

    class Config:
        from_attributes = True


class SubscriptionCreate(BaseModel):
    payment_method: PaymentMethod
    phone_number: str


class SubscriptionResponse(BaseModel):
    id: int
    user_id: int
    status: SubscriptionStatus
    amount: float
    payment_method: PaymentMethod
    transaction_id: Optional[str]
    started_at: Optional[datetime]
    expires_at: Optional[datetime]

    class Config:
        from_attributes = True


class AdminManage(BaseModel):
    role: UserRole


class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    pages: int


class AdminRequestCreate(BaseModel):
    categories: list[str]
    experience: str
    statement: str


class AdminRequestResponse(BaseModel):
    id: int
    user_id: int
    categories: str
    experience: str
    statement: str
    status: AdminRequestStatus
    reviewed_by: Optional[int]
    review_note: Optional[str]
    created_at: datetime
    reviewed_at: Optional[datetime]
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True


class AdminRequestReview(BaseModel):
    status: AdminRequestStatus
    review_note: Optional[str] = None


class CategoryCreate(BaseModel):
    slug: str
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0


class CategoryUpdate(BaseModel):
    slug: Optional[str] = None
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class CategoryResponse(BaseModel):
    id: int
    slug: str
    title: str
    subtitle: Optional[str]
    description: Optional[str]
    image_url: Optional[str]
    icon: Optional[str]
    color: Optional[str]
    is_active: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
