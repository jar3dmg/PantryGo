"""Comandos CLI para ejecutar Migrations y Seeders basados en archivos SQL."""

from pathlib import Path
from typing import Iterable

import click
from flask import current_app
from sqlalchemy import text

from .extensions import db

MIGRATIONS_TABLE = "app_migrations"
SEEDERS_TABLE = "app_seeders"


def register_database_commands(app):
    """Registra comandos Flask para migraciones y seeders basados en carpetas."""

    @app.cli.group("migrate")
    def migrate_group():
        """Comandos para ejecutar archivos dentro de `Migrations`."""

    @app.cli.group("seed")
    def seed_group():
        """Comandos para ejecutar archivos dentro de `Seeders`."""

    @migrate_group.command("up")
    def migrate_up():
        """Ejecuta todas las migraciones pendientes."""
        applied = _run_pending_scripts(
            directory=_migrations_dir(),
            tracking_table=MIGRATIONS_TABLE,
            label="migracion",
        )
        click.echo(f"Migraciones aplicadas: {applied}")

    @migrate_group.command("status")
    def migrate_status():
        """Muestra el estado actual de las migraciones."""
        _print_status(
            directory=_migrations_dir(),
            tracking_table=MIGRATIONS_TABLE,
            applied_label="Aplicada",
            pending_label="Pendiente",
        )

    @migrate_group.command("mark-all")
    def migrate_mark_all():
        """Marca las migraciones existentes como ya aplicadas sin ejecutarlas."""
        marked = _mark_all_scripts_as_applied(
            directory=_migrations_dir(),
            tracking_table=MIGRATIONS_TABLE,
        )
        click.echo(f"Migraciones marcadas como aplicadas: {marked}")

    @seed_group.command("run")
    @click.option("--file", "file_name", default=None, help="Ejecuta un seeder especifico.")
    @click.option("--force", is_flag=True, help="Permite reejecutar un seeder ya aplicado.")
    def seed_run(file_name: str | None, force: bool):
        """Ejecuta seeders pendientes o uno en particular."""
        applied = _run_pending_scripts(
            directory=_seeders_dir(),
            tracking_table=SEEDERS_TABLE,
            label="seeder",
            only_file=file_name,
            force=force,
        )
        click.echo(f"Seeders ejecutados: {applied}")

    @seed_group.command("status")
    def seed_status():
        """Muestra el estado actual de los seeders."""
        _print_status(
            directory=_seeders_dir(),
            tracking_table=SEEDERS_TABLE,
            applied_label="Ejecutado",
            pending_label="Pendiente",
        )


def _migrations_dir() -> Path:
    """Devuelve la carpeta principal de migraciones SQL."""
    return Path(current_app.root_path).parent / "database" / "Migrations"


def _seeders_dir() -> Path:
    """Devuelve la carpeta principal de seeders SQL."""
    return Path(current_app.root_path).parent / "database" / "Seeders"


def _run_pending_scripts(
    directory: Path,
    tracking_table: str,
    label: str,
    only_file: str | None = None,
    force: bool = False,
):
    """Ejecuta scripts SQL pendientes en orden alfabetico y registra su aplicacion."""
    scripts = _list_sql_files(directory)
    if only_file:
        scripts = [script for script in scripts if script.name == only_file]
        if not scripts:
            raise click.ClickException(f"No se encontro el archivo solicitado: {only_file}")

    _ensure_tracking_table(tracking_table)
    applied_files = _get_applied_files(tracking_table)
    executed_count = 0

    for script in scripts:
        if script.name in applied_files and not force:
            continue

        _execute_sql_file(script)
        _record_script_application(tracking_table, script.name, force=force)
        executed_count += 1
        click.echo(f"{label.capitalize()} aplicada: {script.name}")

    return executed_count


def _mark_all_scripts_as_applied(directory: Path, tracking_table: str):
    """Registra todos los scripts como aplicados sin ejecutarlos."""
    scripts = _list_sql_files(directory)
    _ensure_tracking_table(tracking_table)
    applied_files = _get_applied_files(tracking_table)
    marked_count = 0

    for script in scripts:
        if script.name in applied_files:
            continue
        _record_script_application(tracking_table, script.name)
        marked_count += 1

    return marked_count


def _print_status(directory: Path, tracking_table: str, applied_label: str, pending_label: str):
    """Imprime el estado de cada script encontrado en disco."""
    scripts = _list_sql_files(directory)
    _ensure_tracking_table(tracking_table)
    applied_files = _get_applied_files(tracking_table)

    if not scripts:
        click.echo("No hay archivos SQL registrados en esta carpeta.")
        return

    for script in scripts:
        status = applied_label if script.name in applied_files else pending_label
        click.echo(f"{status}: {script.name}")


def _list_sql_files(directory: Path) -> list[Path]:
    """Devuelve archivos `.sql` ordenados alfabeticamente."""
    if not directory.exists():
        return []
    return sorted(path for path in directory.iterdir() if path.is_file() and path.suffix.lower() == ".sql")


def _ensure_tracking_table(tracking_table: str):
    """Crea la tabla de control si aun no existe."""
    statement = f"""
        CREATE TABLE IF NOT EXISTS {tracking_table} (
            script_name VARCHAR(255) NOT NULL PRIMARY KEY,
            applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    """
    with db.engine.begin() as connection:
        connection.execute(text(statement))


def _get_applied_files(tracking_table: str) -> set[str]:
    """Lee los scripts ya registrados como aplicados."""
    statement = text(f"SELECT script_name FROM {tracking_table}")
    with db.engine.begin() as connection:
        rows = connection.execute(statement).fetchall()
    return {row[0] for row in rows}


def _record_script_application(tracking_table: str, script_name: str, force: bool = False):
    """Registra o refresca la marca de aplicacion de un script."""
    delete_statement = text(f"DELETE FROM {tracking_table} WHERE script_name = :script_name")
    insert_statement = text(
        f"INSERT INTO {tracking_table} (script_name) VALUES (:script_name)"
    )
    with db.engine.begin() as connection:
        if force:
            connection.execute(delete_statement, {"script_name": script_name})
        connection.execute(insert_statement, {"script_name": script_name})


def _execute_sql_file(script_path: Path):
    """Ejecuta un archivo SQL completo separando instrucciones por `;`."""
    raw_sql = script_path.read_text(encoding="utf-8")
    statements = [statement.strip() for statement in raw_sql.split(";") if statement.strip()]

    with db.engine.raw_connection() as connection:
        cursor = connection.cursor()
        try:
            for statement in statements:
                cursor.execute(statement)
            connection.commit()
        except Exception:
            connection.rollback()
            raise
        finally:
            cursor.close()

