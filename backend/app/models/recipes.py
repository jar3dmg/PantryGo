"""Modelos relacionados con recetas, pasos, ingredientes y etiquetas."""

from ..extensions import db
from .catalogs import TimestampMixin


class RecipeCategory(TimestampMixin, db.Model):
    """Categoria jerarquica para recetas."""

    __tablename__ = "recipe_categories"

    recipe_category_id = db.Column(db.Integer, primary_key=True)
    parent_category_id = db.Column(db.Integer, db.ForeignKey("recipe_categories.recipe_category_id"))
    name = db.Column(db.String(120), nullable=False)
    slug = db.Column(db.String(140), nullable=False, unique=True)
    description = db.Column(db.String(255))
    is_active = db.Column(db.Boolean, nullable=False, default=True, server_default=db.text("1"))

    parent = db.relationship("RecipeCategory", remote_side=[recipe_category_id])
    recipes = db.relationship("Recipe", back_populates="category")


class Recipe(TimestampMixin, db.Model):
    """Receta principal publicada o editable."""

    __tablename__ = "recipes"
    __table_args__ = (db.Index("idx_recipes_title", "title"),)

    recipe_id = db.Column(db.BigInteger, primary_key=True)
    recipe_status_id = db.Column(
        db.Integer,
        db.ForeignKey("catalog_recipe_statuses.recipe_status_id"),
        nullable=False,
    )
    recipe_difficulty_id = db.Column(
        db.Integer,
        db.ForeignKey("catalog_recipe_difficulties.recipe_difficulty_id"),
    )
    recipe_category_id = db.Column(db.Integer, db.ForeignKey("recipe_categories.recipe_category_id"))
    title = db.Column(db.String(180), nullable=False)
    slug = db.Column(db.String(200), nullable=False, unique=True)
    short_description = db.Column(db.String(255))
    description = db.Column(db.Text)
    servings = db.Column(db.SmallInteger)
    prep_time_minutes = db.Column(db.SmallInteger)
    cook_time_minutes = db.Column(db.SmallInteger)
    total_time_minutes = db.Column(db.SmallInteger)

    status = db.relationship("CatalogRecipeStatus")
    difficulty = db.relationship("CatalogRecipeDifficulty")
    category = db.relationship("RecipeCategory", back_populates="recipes")
    ingredients = db.relationship(
        "RecipeIngredient",
        back_populates="recipe",
        cascade="all, delete-orphan",
        order_by="RecipeIngredient.recipe_ingredient_id",
    )
    steps = db.relationship(
        "RecipeStep",
        back_populates="recipe",
        cascade="all, delete-orphan",
        order_by="RecipeStep.step_number",
    )
    tag_assignments = db.relationship(
        "RecipeTagAssignment",
        back_populates="recipe",
        cascade="all, delete-orphan",
    )


class RecipeStep(TimestampMixin, db.Model):
    """Paso ordenado dentro de una receta."""

    __tablename__ = "recipe_steps"
    __table_args__ = (
        db.UniqueConstraint("recipe_id", "step_number", name="uq_recipe_steps"),
    )

    recipe_step_id = db.Column(db.BigInteger, primary_key=True)
    recipe_id = db.Column(
        db.BigInteger,
        db.ForeignKey("recipes.recipe_id", ondelete="CASCADE"),
        nullable=False,
    )
    step_number = db.Column(db.SmallInteger, nullable=False)
    instruction = db.Column(db.Text, nullable=False)
    estimated_minutes = db.Column(db.SmallInteger)

    recipe = db.relationship("Recipe", back_populates="steps")


class RecipeIngredient(TimestampMixin, db.Model):
    """Relacion N:M entre receta e ingrediente con detalle de cantidad."""

    __tablename__ = "recipe_ingredients"
    __table_args__ = (
        db.UniqueConstraint(
            "recipe_id",
            "ingredient_id",
            "preparation_note",
            name="uq_recipe_ingredient",
        ),
        db.Index("idx_recipe_ingredients_recipe", "recipe_id"),
        db.Index("idx_recipe_ingredients_ingredient", "ingredient_id"),
    )

    recipe_ingredient_id = db.Column(db.BigInteger, primary_key=True)
    recipe_id = db.Column(
        db.BigInteger,
        db.ForeignKey("recipes.recipe_id", ondelete="CASCADE"),
        nullable=False,
    )
    ingredient_id = db.Column(
        db.BigInteger,
        db.ForeignKey("ingredients.ingredient_id"),
        nullable=False,
    )
    quantity = db.Column(db.Numeric(10, 2))
    preparation_note = db.Column(db.String(255))
    is_optional = db.Column(db.Boolean, nullable=False, default=False, server_default=db.text("0"))

    recipe = db.relationship("Recipe", back_populates="ingredients")
    ingredient = db.relationship("Ingredient", back_populates="recipe_ingredients")


class RecipeTag(TimestampMixin, db.Model):
    """Etiqueta reusable para filtros de recetas."""

    __tablename__ = "recipe_tags"

    recipe_tag_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    slug = db.Column(db.String(100), nullable=False, unique=True)


class RecipeTagAssignment(db.Model):
    """Asignacion N:M entre receta y etiqueta."""

    __tablename__ = "recipe_tag_assignments"
    __table_args__ = (
        db.UniqueConstraint("recipe_id", "recipe_tag_id", name="uq_recipe_tag_assignment"),
    )

    recipe_tag_assignment_id = db.Column(db.BigInteger, primary_key=True)
    recipe_id = db.Column(
        db.BigInteger,
        db.ForeignKey("recipes.recipe_id", ondelete="CASCADE"),
        nullable=False,
    )
    recipe_tag_id = db.Column(
        db.Integer,
        db.ForeignKey("recipe_tags.recipe_tag_id", ondelete="CASCADE"),
        nullable=False,
    )
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.current_timestamp())

    recipe = db.relationship("Recipe", back_populates="tag_assignments")
    tag = db.relationship("RecipeTag")
