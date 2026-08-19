import asyncio
from app.core.database import async_session, engine, Base
from app.models.models import User, Post
from app.models.enums import UserRole, PostCategory, PostStatus
from app.core.security import get_password_hash


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        # Create super admin
        super_admin = User(
            username="admin",
            email="admin@diyarnoor.com",
            password_hash=get_password_hash("admin123"),
            role=UserRole.super_admin,
            display_name="DIYAR E NOOR Team",
            bio="The heart behind DIYAR E NOOR"
        )
        session.add(super_admin)
        await session.flush()

        # Sample posts
        sample_posts = [
            {
                "title": "The Essence of Ishq in Islam",
                "slug": "essence-of-ishq-islam",
                "content": """Ishq, in its purest form, is a reflection of divine love. The Quran speaks of the love between Prophet Muhammad (PBUH) and Khadijah (RA) as a testament to the beauty of sacred bonds.

When we speak of Ishq, we speak of a love that transcends the physical — it is a connection of souls, a meeting of hearts that find solace in the remembrance of Allah.

> "And among His signs is that He created for you mates from among yourselves, that you may dwell in tranquility with them, and He has put love and mercy between your hearts." — Quran 30:21

The beauty of Ishq lies in its purity. It is not merely an emotion but a state of being — one that elevates the soul and draws one closer to the Divine.

In today's world, where love has often been reduced to fleeting desires, we must return to understanding Ishq as it was meant to be: sacred, intentional, and deeply spiritual.""",
                "category": PostCategory.ishq,
                "status": PostStatus.published,
            },
            {
                "title": "Building a Halal Relationship: A Guide",
                "slug": "building-halal-relationship-guide",
                "content": """In the pursuit of love, the path of halal relationships offers a framework that honors both the heart and faith.

## Intentions First

Before anything else, examine your intentions. A halal relationship begins with the sincere desire to find a partner who will be the clothing to your other's body and the light to your soul.

## Communication with Respect

Open, honest communication is the cornerstone of any meaningful relationship. In Islam, this extends to:
- Speaking with kindness and wisdom
- Listening with patience and understanding
- Resolving conflicts through consultation (Shura)

## Boundaries as Protection

Boundaries in a halal relationship are not restrictions — they are protections for the heart. They ensure that the relationship remains pure and focused on building a future together.

## Involvement of Families

The involvement of families provides a support system and ensures that the relationship is built on a foundation of community and accountability.

## Patience and Trust in Allah's Plan

Perhaps the most beautiful aspect of a halal relationship is the trust in Allah's timing. When we surrender our desires to His wisdom, we find peace in the journey.""",
                "category": PostCategory.halal_relationships,
                "status": PostStatus.published,
            },
            {
                "title": "The Spirituality of Nikah",
                "slug": "spirituality-of-nikah",
                "content": """Nikah is more than a contract — it is an act of worship, a sacred covenant between two souls.

## A Sunnah of the Prophets

Marriage in Islam is not merely a social arrangement but a deeply spiritual undertaking. The Prophet Muhammad (PBUH) said: "Marriage is half of faith." (Muslim)

## The Mahr: A Symbol of Commitment

The mahr is not a price tag but a symbol of the groom's commitment and responsibility. It represents honor, respect, and the seriousness of the union.

## Building a Home of Peace

The Prophet (PBUH) described the best of people as those who are best to their wives. A home built on the principles of mercy (Rahma), tranquility (Sakinah), and love (Mawaddah) becomes a paradise on earth.

## Growing Together in Faith

Marriage in Islam is designed for mutual growth — spiritually, emotionally, and personally. Each partner becomes a mirror to the other, helping them grow closer to Allah and to each other.

## The Blessings of a Halal Union

A marriage rooted in faith brings barakah (blessings) in all aspects of life — in sustenance, in children, and in the peace of the heart.""",
                "category": PostCategory.nikah,
                "status": PostStatus.published,
            },
            {
                "title": "Pakeezgi: The Beauty of Purity",
                "slug": "pakeezgi-beauty-purity",
                "content": """Pakeezgi, or purity, is a concept that runs deep in Islamic culture. It is not merely about physical cleanliness but encompasses the purity of heart, intention, and action.

## Purity of Heart

The heart that is pure sees beauty in all of Allah's creation. It is free from envy, malice, and deceit. To achieve pakeezgi of the heart:
- Practice gratitude (Shukr)
- Remember death and the Hereafter
- Seek forgiveness regularly

## Purity in Relationships

A pure relationship is one built on trust, honesty, and mutual respect. It is free from deception and hidden agendas. When both partners approach each other with purity of intention, the relationship becomes a source of comfort and strength.

## The Connection Between Outer and Inner Purity

Islam teaches us that outer cleanliness reflects inner purity. When we take care of our physical appearance, our clothes, and our surroundings, we are also nurturing the soul within.

## A Daily Practice

Pakeezgi is not a destination but a daily practice. Each day offers new opportunities to purify our hearts, our words, and our actions.""",
                "category": PostCategory.pakeezgi,
                "status": PostStatus.published,
            },
        ]

        for post_data in sample_posts:
            post = Post(admin_id=super_admin.id, **post_data)
            session.add(post)

        await session.commit()
        print("Database seeded successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
