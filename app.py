"""Punto de entrada principal para ejecutar la aplicacion Flask."""

import os
import sys

os.environ["PYTHONDONTWRITEBYTECODE"] = "1"
sys.dont_write_bytecode = True

from backend.app import create_app

app = create_app()


if __name__ == "__main__":
    app.run(debug=True)
