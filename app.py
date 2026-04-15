"""Punto de entrada principal para ejecutar la aplicacion Flask."""

from backend.app import create_app

app = create_app()


if __name__ == "__main__":
    app.run(debug=True)
