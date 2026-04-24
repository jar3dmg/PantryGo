import { useState, useEffect } from "react";
import pantryGoLogo from "../static/pantrygo-main-logo.png";
import { getDataSourceStatus } from "../fetch/get";


export default function HomePage() {
    const [dataSource, setDataSource] = useState("");

    useEffect(() => {
        async function fetchDbSourceStatus(){
            const result = await getDataSourceStatus();
            setDataSource(result.message);
        }


        fetchDbSourceStatus();

    }, [])

    return (
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 pb-16 pt-4 lg:px-8">
            <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div className="hero-panel animate-rise overflow-hidden rounded-[2rem] border border-herb/25 bg-white/85 p-8 shadow-soft backdrop-blur sm:p-10">
                    <div className="mb-5 inline-flex rounded-full border border-olive/30 bg-herb/60 px-4 py-2 text-sm font-semibold text-ink">
                        Bienvenido a PantryGo
                    </div>
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="welcome-logo animate-float flex w-full max-w-[32rem] items-center justify-center rounded-[1.75rem] p-4 shadow-soft">
                            <img src={pantryGoLogo} alt="Logo PantryGo" className="h-auto w-full object-contain"/ >
                        </div>
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.18em] text-ink/50">Tu asistente de cocina</p>
                            <p className="mt-2 text-2xl font-extrabold text-ink">Despensa, recetas y decisiones rapidas en un solo lugar.</p>
                        </div>
                    </div>
                    <h1 className="max-w-3xl font-display text-5xl leading-tight text-ink sm:text-6xl">
                        Organiza tu despensa y descubre rapido que puedes cocinar hoy.
                    </h1>
                    <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/75">
                        PantryGo esta pensado para ayudarte a pasar de ingredientes sueltos a recetas posibles, con una navegacion clara entre inicio, inventario y catalogo completo.
                    </p>

                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                        <article className="feature-card animate-rise rounded-3xl border border-herb/20 bg-cream px-5 py-4">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/55">Vista 1</p>
                            <h2 className="mt-2 text-lg font-extrabold text-ink">Inicio rapido</h2>
                            <p className="mt-2 text-sm leading-6 text-ink/70">Acceso rapido a las secciones principales del sistema.</p>
                        </article>
                        <article className="feature-card animate-rise rounded-3xl border border-herb/20 bg-cream px-5 py-4">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/55">Vista 2</p>
                            <h2 className="mt-2 text-lg font-extrabold text-ink">Mi inventario</h2>
                            <p className="mt-2 text-sm leading-6 text-ink/70">Selecciona ingredientes disponibles y prohibidos desde el catalogo.</p>
                        </article>
                        <article className="feature-card animate-rise rounded-3xl border border-herb/20 bg-cream px-5 py-4">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/55">Vista 3</p>
                            <h2 className="mt-2 text-lg font-extrabold text-ink">Catalogo de recetas</h2>
                            <p className="mt-2 text-sm leading-6 text-ink/70">Consulta el catalogo completo y revisa detalles de preparacion.</p>
                        </article>
                    </div>
                </div>

                <aside className="animate-rise rounded-[2rem] border border-herb/25 bg-sand p-6 shadow-soft">
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-ink/55">Accesos directos</p>
                    <div className="mt-5 grid gap-4">
                        <a href="{{ url_for('web.inventory') }}" className="feature-card rounded-[1.5rem] border border-herb/20 bg-white p-5 transition hover:translate-y-[-2px] hover:shadow-soft">
                            <p className="text-sm font-bold uppercase tracking-[0.15em] text-ink/55">Inventario</p>
                            <h2 className="mt-2 font-display text-3xl text-ink">Ir a inventario personal</h2>
                            <p className="mt-2 text-sm leading-6 text-ink/70">Arma tu seleccion desde catalogo y encuentra recetas compatibles.</p>
                        </a>
                        <a href="{{ url_for('web.recipes') }}" className="feature-card rounded-[1.5rem] border border-herb/20 bg-white p-5 transition hover:translate-y-[-2px] hover:shadow-soft">
                            <p className="text-sm font-bold uppercase tracking-[0.15em] text-ink/55">Catalogo</p>
                            <h2 className="mt-2 font-display text-3xl text-ink">Ver todas las recetas</h2>
                            <p className="mt-2 text-sm leading-6 text-ink/70">Explora el recetario completo por categoria, tiempo y descripcion.</p>
                        </a>
                        <a href="{{ url_for('web.catalog_admin') }}" className="feature-card rounded-[1.5rem] border border-herb/20 bg-white p-5 transition hover:translate-y-[-2px] hover:shadow-soft">
                            <p className="text-sm font-bold uppercase tracking-[0.15em] text-ink/55">Administracion</p>
                            <h2 className="mt-2 font-display text-3xl text-ink">Editar catalogos</h2>
                            <p className="mt-2 text-sm leading-6 text-ink/70">Administra ingredientes y recetas desde una vista dedicada.</p>
                        </a>
                    </div>

                    <div className="glow-panel mt-6 rounded-[1.5rem] bg-white px-5 py-4">
                        <p className="text-sm font-semibold text-ink/55">PantryGo hoy</p>
                        <p className="mt-2 text-lg font-extrabold text-ink">Tu menu principal para entrar rapido a inventario o explorar recetas.</p>
                        <p className="mt-2 text-sm text-amber-800">{dataSource}</p>
                    </div>
                </aside>
            </section>
        </main>
    )
}