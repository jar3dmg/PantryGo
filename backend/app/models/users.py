"""Modelos de usuarios e interacciones relacionadas."""

from ..extensions import db
from .catalogs import TimestampMixin


class User(TimestampMixin, db.Model):
    """Usuario registrado en PantryGo."""

    __tablename__ = "users"

    user_id = db.Column(db.BigInteger, primary_key=True)
    role_id = db.Column(db.Integer, db.ForeignKey("catalog_roles.role_id"), nullable=False)
    auth_provider_id = db.Column(
        db.Integer,
        db.ForeignKey("catalog_auth_providers.auth_provider_id"),
        nullable=False,
    )
    email = db.Column(db.String(180), nullable=False, unique=True)
    password_hash = db.Column(db.String(255))
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100))
    avatar_url = db.Column(db.String(255))
    timezone = db.Column(
        db.String(80),
        nullable=False,
        default="America/Mexico_City",
        server_default="America/Mexico_City",
    )
    is_verified = db.Column(db.Boolean, nullable=False, default=False, server_default=db.text("0"))
    is_active = db.Column(db.Boolean, nullable=False, default=True, server_default=db.text("1"))
    last_login_at = db.Column(db.DateTime)

    role = db.relationship("CatalogRole")
    auth_provider = db.relationship("CatalogAuthProvider")


class PantryItem(TimestampMixin, db.Model):
    """Ingrediente disponible dentro del inventario del usuario."""

    __tablename__ = "pantry_items"
    __table_args__ = (
        db.UniqueConstraint("user_id", "ingredient_id", name="uq_pantry_user_ingredient"),
        db.Index("idx_pantry_items_user", "user_id"),
        db.Index("idx_pantry_items_ingredient", "ingredient_id"),
    )

    pantry_item_id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(
        db.BigInteger,
        db.ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
    )
    ingredient_id = db.Column(db.BigInteger, db.ForeignKey("ingredients.ingredient_id"), nullable=False)
    measurement_unit_id = db.Column(db.Integer, db.ForeignKey("catalog_measurement_units.measurement_unit_id"))
    quantity = db.Column(db.Numeric(10, 2))
    notes = db.Column(db.String(255))
    expires_at = db.Column(db.Date)
    is_available = db.Column(db.Boolean, nullable=False, default=True, server_default=db.text("1"))


class UserFavoriteRecipe(db.Model):
    """Favoritos del usuario."""

    __tablename__ = "user_favorite_recipes"
    __table_args__ = (
        db.UniqueConstraint("user_id", "recipe_id", name="uq_user_favorite_recipe"),
    )

    user_favorite_recipe_id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(
        db.BigInteger,
        db.ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
    )
    recipe_id = db.Column(
        db.BigInteger,
        db.ForeignKey("recipes.recipe_id", ondelete="CASCADE"),
        nullable=False,
    )
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.current_timestamp())


class UserRecipeHistory(db.Model):
    """Historial de acciones del usuario sobre recetas."""

    __tablename__ = "user_recipe_history"

    user_recipe_history_id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(
        db.BigInteger,
        db.ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
    )
    recipe_id = db.Column(
        db.BigInteger,
        db.ForeignKey("recipes.recipe_id", ondelete="CASCADE"),
        nullable=False,
    )
    action_type = db.Column(
        db.Enum("viewed", "cooked", "saved"),
        nullable=False,
        default="viewed",
        server_default="viewed",
    )
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.current_timestamp())
