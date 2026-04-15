"""Transformaciones del catalogo para facilitar su uso en el front."""

def group_ingredients_by_category(ingredients: list[dict]):
    """Agrupa ingredientes por categoria para mostrarlos por secciones."""
    grouped = []
    categories = {}

    for ingredient in ingredients:
        category_slug = ingredient["category_slug"]
        if category_slug not in categories:
            categories[category_slug] = {
                "slug": category_slug,
                "name": ingredient["category_name"],
                "ingredients": [],
            }
            grouped.append(categories[category_slug])

        categories[category_slug]["ingredients"].append(
            {
                "id": ingredient["id"],
                "name": ingredient["name"],
                "slug": ingredient["slug"],
            }
        )

    for category in grouped:
        category["ingredients"].sort(key=lambda item: item["name"])

    return grouped
