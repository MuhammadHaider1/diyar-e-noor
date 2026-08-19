import enum


class UserRole(str, enum.Enum):
    super_admin = "super_admin"
    admin = "admin"
    user = "user"


class PostCategory(str, enum.Enum):
    ishq = "ishq"
    mohabbat = "mohabbat"
    pakeezgi = "pakeezgi"
    halal_relationships = "halal_relationships"
    nikah = "nikah"
    advice = "advice"


class PostStatus(str, enum.Enum):
    draft = "draft"
    published = "published"


class SubscriptionStatus(str, enum.Enum):
    active = "active"
    expired = "expired"
    pending = "pending"
    cancelled = "cancelled"


class PaymentMethod(str, enum.Enum):
    jazzcash = "jazzcash"
    easypaisa = "easypaisa"


class AdminRequestStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
