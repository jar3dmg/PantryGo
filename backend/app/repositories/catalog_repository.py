"""Consultas ORM del catalogo de ingredientes."""

from sqlalchemy.orm import joinedload

from ..models import Ingredient


def fetch_ingredient_catalog():
    """Devuelve ingredientes activos junto con su categoria."""
    ingredients = (
        Ingredient.query.options(
            joinedload(Ingredient.category),
        )
        .join(Ingredient.category)
        .filter(Ingredient.is_active.is_(True))
        .filter(Ingredient.category.has(is_active=True))
        .order_by(Ingredient.name.asc())
        .all()
    )

    return [
        {
            "id": ingredient.ingredient_id,
            "name": ingredient.name,
            "slug": ingredient.slug,
            "category_name": ingredient.category.name,
            "category_slug": ingredient.category.slug,
        }
        for ingredient in ingredients
    ]
