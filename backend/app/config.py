"""Configuracion centralizada para Flask y SQLAlchemy."""

import os


def get_database_uri():
    """Construye el URI de SQLAlchemy para MySQL usando variables de entorno."""
    host = os.getenv("DB_HOST", "127.0.0.1")
    port = int(os.getenv("DB_PORT", "3306"))
    user = os.getenv("DB_USER", "root")
    password = os.getenv("DB_PASSWORD", "")
    database = os.getenv("DB_NAME", "recetario_app")

    return (
        f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}"
        "?charset=utf8mb4"
    )
