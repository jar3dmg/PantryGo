"""Catalogos transversales del sistema."""

from ..extensions import db


class TimestampMixin:
    """Mixin con marcas de tiempo de creacion y actualizacion."""

    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.current_timestamp())
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.func.current_timestamp(),
        server_onupdate=db.func.current_timestamp(),
    )


class CatalogRole(TimestampMixin, db.Model):
    """Roles disponibles dentro del sistema."""

    __tablename__ = "catalog_roles"

    role_id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), nullable=False, unique=True)
    name = db.Column(db.String(100), nullable=False)
    is_active = db.Column(db.Boolean, nullable=False, default=True, server_default=db.text("1"))


class CatalogAuthProvider(TimestampMixin, db.Model):
    """Proveedores de autenticacion soportados."""

    __tablename__ = "catalog_auth_providers"

    auth_provider_id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), nullable=False, unique=True)
    name = db.Column(db.String(100), nullable=False)
    is_active = db.Column(db.Boolean, nullable=False, default=True, server_default=db.text("1"))


class CatalogMeasurementUnit(TimestampMixin, db.Model):
    """Unidades de medida para ingredientes y despensa."""

    __tablename__ = "catalog_measurement_units"

    measurement_unit_id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), nullable=False, unique=True)
    name = db.Column(db.String(100), nullable=False)
    symbol = db.Column(db.String(20))
    unit_type = db.Column(
        db.Enum("mass", "volume", "count", "length", "temperature", "other"),
        nullable=False,
        default="other",
        server_default="other",
    )
    allows_decimals = db.Column(db.Boolean, nullable=False, default=True, server_default=db.text("1"))
    is_active = db.Column(db.Boolean, nullable=False, default=True, server_default=db.text("1"))


class CatalogRecipeDifficulty(TimestampMixin, db.Model):
    """Niveles de dificultad para recetas."""

    __tablename__ = "catalog_recipe_difficulties"

    recipe_difficulty_id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), nullable=False, unique=True)
    name = db.Column(db.String(100), nullable=False)
    sort_order = db.Column(
        db.SmallInteger,
        nullable=False,
        default=1,
        server_default=db.text("1"),
    )
    is_active = db.Column(db.Boolean, nullable=False, default=True, server_default=db.text("1"))


class CatalogRecipeStatus(TimestampMixin, db.Model):
    """Estatus disponibles para el ciclo de vida de recetas."""

    __tablename__ = "catalog_recipe_statuses"

    recipe_status_id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), nullable=False, unique=True)
    name = db.Column(db.String(100), nullable=False)
    is_active = db.Column(db.Boolean, nullable=False, default=True, server_default=db.text("1"))
