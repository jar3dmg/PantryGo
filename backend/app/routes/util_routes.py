from flask import Blueprint, current_app, jsonify

utils_bp = Blueprint("utils_bp", __name__)

@utils_bp.get("/api/data-source-status")
def data_source_status():
    data_source = current_app.config.get("DATA_SOURCE", "unknown")
    data_source_error = current_app.config.get("DATA_SOURCE_ERROR")

    if data_source_error:
        message = "No se pudo conectar a MySQL. Puedes seguir usando el inventario con el modo de respaldo."
    else:
        message = f"Fuente: {data_source.upper()}"

    return jsonify({"message": message})