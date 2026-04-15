import os


def get_database_config():
    """Devuelve la configuracion de MySQL usando variables de entorno."""
    return {
        "host": os.getenv("DB_HOST", "127.0.0.1"),
        "port": int(os.getenv("DB_PORT", "3306")),
        "user": os.getenv("DB_USER", "root"),
        "password": os.getenv("DB_PASSWORD", ""),
        "database": os.getenv("DB_NAME", "recetario_app"),
        "charset": "utf8mb4",
        "cursorclass": None,
    }
