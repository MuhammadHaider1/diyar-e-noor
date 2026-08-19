import asyncio
from app.core.database import async_session
from app.models.models import Category

default_categories = [
    {
        "slug": "ishq",
        "title": "Ishq",
        "subtitle": "Divine Love",
        "description": "The sacred flame that burns beyond reason — where hearts surrender to a love greater than themselves. Explore the poetry of divine devotion.",
        "image_url": "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&q=80",
        "icon": "🔥",
        "color": "rose",
        "is_active": True,
        "sort_order": 0,
    },
    {
        "slug": "mohabbat",
        "title": "Mohabbat",
        "subtitle": "Affection & Devotion",
        "description": "Tenderness woven into every glance, every word, every silent prayer. Discover the beauty of selfless love in its purest form.",
        "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
        "icon": "💫",
        "color": "pink",
        "is_active": True,
        "sort_order": 1,
    },
    {
        "slug": "pakeezgi",
        "title": "Pakeezgi",
        "subtitle": "Purity & Grace",
        "description": "In a world of noise, purity is the quiet revolution. Embrace the elegance of modesty, the strength in restraint, the beauty in simplicity.",
        "image_url": "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
        "icon": "🕊️",
        "color": "emerald",
        "is_active": True,
        "sort_order": 2,
    },
    {
        "slug": "halal_relationships",
        "title": "Halal Relationships",
        "subtitle": "Sacred Bonds",
        "description": "Love within boundaries, joy within faith. Navigate the beauty of halal relationships — where commitment meets compassion and trust blooms eternally.",
        "image_url": "https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=800&q=80",
        "icon": "💍",
        "color": "gold",
        "is_active": True,
        "sort_order": 3,
    },
    {
        "slug": "nikah",
        "title": "Nikah",
        "subtitle": "Sacred Union",
        "description": "Where two souls unite under divine witness — the covenant of marriage as spiritual partnership. Stories of love, growth, and eternal companionship.",
        "image_url": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
        "icon": "🕌",
        "color": "purple",
        "is_active": True,
        "sort_order": 4,
    },
    {
        "slug": "advice",
        "title": "Advice",
        "subtitle": "Heart-to-Heart",
        "description": "Wise counsel for the journey of love. From navigating challenges to celebrating milestones — guidance rooted in faith and understanding.",
        "image_url": "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80",
        "icon": "💬",
        "color": "blue",
        "is_active": True,
        "sort_order": 5,
    },
]


async def seed():
    async with async_session() as session:
        from sqlalchemy import select
        result = await session.execute(select(Category))
        existing = result.scalars().all()
        if existing:
            print(f"Found {len(existing)} existing categories, skipping seed")
            return

        for cat_data in default_categories:
            category = Category(**cat_data)
            session.add(category)
        await session.commit()
        print(f"Seeded {len(default_categories)} categories")


if __name__ == "__main__":
    asyncio.run(seed())
