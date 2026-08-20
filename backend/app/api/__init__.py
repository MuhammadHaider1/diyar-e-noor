from fastapi import APIRouter
from app.api import auth, users, posts, comments, admin, categories, upload, social

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(posts.router)
api_router.include_router(comments.router)
api_router.include_router(admin.router)
api_router.include_router(categories.router)
api_router.include_router(upload.router)
api_router.include_router(social.router)
