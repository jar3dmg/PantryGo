"""Modelos relacionados con ingredientes y sus catalogos."""

from ..extensions import db
from .catalogs import TimestampMixin


class IngredientCategory(TimestampMixin, db.Model):
    """Categoria jerarquica para ingredientes."""

    __tablename__ = "ingredient_categories"

    ingredient_category_id = db.Column(db.Integer, primary_key=True)
    parent_category_id = db.Column(
        db.Integer,
        db.ForeignKey("ingredient_categories.ingredient_category_id"),
    )
    name = db.Column(db.String(120), nullable=False)
    slug = db.Column(db.String(140), nullable=False, unique=True)
    description = db.Column(db.String(255))
    is_active = db.Column(db.Boolean, nullable=False, default=True, server_default=db.text("1"))

    parent = db.relationship("IngredientCategory", remote_side=[ingredient_category_id])
    ingredients = db.relationship("Ingredient", back_populates="category")


class Ingredient(TimestampMixin, db.Model):
    """Ingrediente canonico del sistema."""

    __tablename__ = "ingredients"
    __table_args__ = (db.Index("idx_ingredients_name", "name"),)

    ingredient_id = db.Column(db.BigInteger, primary_key=True)
    ingredient_category_id = db.Column(
        db.Integer,
        db.ForeignKey("ingredient_categories.ingredient_category_id"),
        nullable=False,
    )
    name = db.Column(db.String(150), nullable=False)
    slug = db.Column(db.String(180), nullable=False, unique=True)
    description = db.Column(db.Text)
    is_active = db.Column(db.Boolean, nullable=False, default=True, server_default=db.text("1"))

    category = db.relationship("IngredientCategory", back_populates="ingredients")
    aliases = db.relationship(
        "IngredientAlias",
        back_populates="ingredient",
        cascade="all, delete-orphan",
    )
    recipe_ingredients = db.relationship("RecipeIngredient", back_populates="ingredient")


class IngredientAlias(TimestampMixin, db.Model):
    """Alias para enriquecer captura y busqueda de ingredientes."""

    __tablename__ = "ingredient_aliases"
    __table_args__ = (db.Index("idx_ingredient_aliases_name", "alias_name"),)

    ingredient_alias_id = db.Column(db.BigInteger, primary_key=True)
    ingredient_id = db.Column(
        db.BigInteger,
        db.ForeignKey("ingredients.ingredient_id", ondelete="CASCADE"),
        nullable=False,
    )
    alias_name = db.Column(db.String(150), nullable=False)
    alias_slug = db.Column(db.String(180), nullable=False, unique=True)
    alias_type = db.Column(
        db.Enum("common_name", "regional_name", "plural_name", "search_keyword"),
        nullable=False,
        default="common_name",
        server_default="common_name",
    )

    ingredient = db.relationship("Ingredient", back_populates="aliases")
