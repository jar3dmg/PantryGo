"""Consultas del catalogo de ingredientes desde MySQL."""

import pymysql
from pymysql.cursors import DictCursor


def get_connection(db_config: dict):
    """Abre una conexion a MySQL usando cursores de tipo diccionario."""
    connection_config = db_config.copy()
    connection_config["cursorclass"] = DictCursor
    return pymysql.connect(**connection_config)


def fetch_ingredient_catalog(db_config: dict):
    """Devuelve ingredientes activos junto con su categoria."""
    query = """
        SELECT
            i.ingredient_id,
            i.name AS ingredient_name,
            i.slug AS ingredient_slug,
            ic.name AS category_name,
            ic.slug AS category_slug
        FROM ingredients AS i
        INNER JOIN ingredient_categories AS ic
            ON ic.ingredient_category_id = i.ingredient_category_id
        WHERE i.is_active = 1
          AND ic.is_active = 1
        ORDER BY ic.name, i.name
    """

    with get_connection(db_config) as connection:
        with connection.cursor() as cursor:
            cursor.execute(query)
            rows = cursor.fetchall()

    return [
        {
            "id": row["ingredient_id"],
            "name": row["ingredient_name"],
            "slug": row["ingredient_slug"],
            "category_name": row["category_name"],
            "category_slug": row["category_slug"],
        }
        for row in rows
    ]
