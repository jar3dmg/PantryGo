// catalog_admin_recipes.js
// Logica especifica del CRUD de recetas y del builder de ingredientes/pasos.

function loadRecipes(state, elements) {
    return requestApi("/recipes").then((payload) => {
        state.recipes = payload.data || [];
        renderRecipeList(state, elements);
    });
}

function renderRecipeList(state, elements) {
    const recipeList = elements.recipe.list;
    const recipeSearchInput = elements.recipe.searchInput;

    if (!recipeList) {
        return;
    }

    const searchTerm = (recipeSearchInput?.value || "").trim().toLowerCase();

    const filteredItems = state.recipes.filter((recipe) => {
        return (
            !searchTerm
            || matchesSearchTerm(recipe.title, searchTerm)
            || matchesSearchTerm(recipe.slug, searchTerm)
            || matchesSearchTerm(recipe.category_name, searchTerm)
            || matchesSearchTerm(recipe.status_name, searchTerm)
            || matchesSearchTerm(recipe.short_description, searchTerm)
            || (recipe.ingredients || []).some((ingredient) =>
                matchesSearchTerm(ingredient.ingredient_name, searchTerm)
                || matchesSearchTerm(ingredient.preparation_note, searchTerm)
            )
        );
    });

    recipeList.innerHTML = "";

    if (!filteredItems.length) {
        recipeList.innerHTML = `
            <div class="rounded-[1.25rem] border border-dashed border-olive/20 bg-sand px-4 py-5 text-sm text-ink/65">
                No hay recetas que coincidan con la busqueda.
            </div>
        `;
        return;
    }

    filteredItems.forEach((recipe) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className =
            "admin-list-item w-full rounded-[1.25rem] border border-herb/20 bg-sand px-4 py-4 text-left transition hover:translate-y-[-1px] hover:shadow-soft";

        const recipeDescription =
            recipe.short_description || recipe.description || "Sin descripcion registrada.";

        const ingredientPreview = (recipe.ingredients || [])
            .slice(0, 4)
            .map((ingredient) => ingredient.ingredient_name)
            .filter(Boolean)
            .join(", ");

        item.innerHTML = `
            <div class="flex flex-wrap items-start justify-between gap-4">
                <div class="min-w-0 flex-1">
                    <p class="text-lg font-extrabold text-ink">${escapeHtml(recipe.title)}</p>
                    <div class="mt-2 flex flex-wrap gap-2">
                        <span class="admin-summary-chip">${escapeHtml(recipe.category_name || "Sin categoria")}</span>
                        <span class="admin-summary-chip">${escapeHtml(recipe.status_name || "Sin estatus")}</span>
                        ${recipe.difficulty_name ? `<span class="admin-summary-chip">${escapeHtml(recipe.difficulty_name)}</span>` : ""}
                    </div>
                    <p class="mt-3 text-sm leading-6 text-ink/70">${escapeHtml(recipeDescription)}</p>
                    <p class="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">Ingredientes cargados</p>
                    <p class="mt-1 text-sm leading-6 text-ink/70">${escapeHtml(ingredientPreview || "Sin ingredientes capturados aun.")}</p>
                </div>
                <div class="flex flex-wrap gap-2">
                    <span class="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-ink/70">
                        ${(recipe.ingredients || []).length} ingredientes
                    </span>
                    <span class="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-ink/70">
                        ${(recipe.steps || []).length} pasos
                    </span>
                </div>
            </div>
        `;

        item.addEventListener("click", () => {
            fillRecipeForm(state, elements, recipe);
        });

        recipeList.appendChild(item);
    });
}

function populateRecipeIngredientOptions(state, elements) {
    const ingredientOptions = elements.recipe.ingredientOptions;

    if (!ingredientOptions) {
        return;
    }

    ingredientOptions.innerHTML = "";

    getActiveIngredients(state).forEach((ingredient) => {
        const option = document.createElement("option");
        option.value = ingredient.name;
        option.label = ingredient.category_name
            ? `${ingredient.name} · ${ingredient.category_name}`
            : ingredient.name;
        ingredientOptions.appendChild(option);
    });
}

function syncRecipeIngredientSelection(state, row) {
    const searchInput = row.querySelector(".recipe-ingredient-search");
    const idInput = row.querySelector(".recipe-ingredient-id");
    const meta = row.querySelector(".recipe-ingredient-meta");

    const selectedIngredient = getIngredientByName(state, searchInput.value);

    if (selectedIngredient) {
        idInput.value = selectedIngredient.id;
        meta.textContent = selectedIngredient.category_name
            ? `Catalogado en ${selectedIngredient.category_name}.`
            : "Ingrediente disponible en el catalogo.";
        meta.classList.remove("text-rose-700");
        meta.classList.add("text-ink/60");
        return;
    }

    idInput.value = "";

    if (searchInput.value.trim()) {
        meta.textContent =
            "Selecciona un ingrediente sugerido del catalogo para vincularlo correctamente.";
        meta.classList.add("text-rose-700");
        meta.classList.remove("text-ink/60");
    } else {
        meta.textContent = "Empieza a escribir para ver coincidencias del catalogo.";
        meta.classList.remove("text-rose-700");
        meta.classList.add("text-ink/60");
    }
}

function createRecipeIngredientRow(state, elements, data = {}) {
    const row = document.createElement("div");
    row.className =
        "recipe-builder-row recipe-ingredient-card rounded-[1.15rem] border border-herb/20 bg-white p-4";

    const selectedIngredient = getIngredientById(state, data.ingredient_id);
    const selectedIngredientName = selectedIngredient?.name || "";
    const selectedIngredientMeta = selectedIngredient?.category_name
        ? `Catalogado en ${selectedIngredient.category_name}.`
        : "Empieza a escribir para ver coincidencias del catalogo.";

    row.innerHTML = `
        <div class="builder-section-title">
            <span class="builder-section-badge recipe-ingredient-index">1</span>
            <div class="min-w-0">
                <p class="m-0 text-base font-extrabold text-ink">Ingrediente de receta</p>
                <p class="builder-hint m-0 mt-1">
                    Busca un ingrediente existente, confirma la sugerencia y luego completa cantidad o nota si la receta lo necesita.
                </p>
            </div>
        </div>
        <div class="recipe-builder-stack mt-4">
            <div class="recipe-builder-main-field">
                <label class="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-ink/55">Ingrediente</label>
                <input
                    class="admin-input recipe-ingredient-search w-full rounded-[1rem] border border-olive/20 bg-sand px-4 py-3 text-sm text-ink"
                    type="text"
                    list="recipe-ingredient-options"
                    placeholder="Escribe para buscar ingredientes existentes"
                    value="${escapeHtml(selectedIngredientName)}"
                    autocomplete="off"
                >
                <input type="hidden" class="recipe-ingredient-id" value="${escapeHtml(data.ingredient_id ?? "")}">
                <p class="recipe-ingredient-meta mt-2 text-sm text-ink/60">
                    ${selectedIngredientName ? escapeHtml(selectedIngredientMeta) : "Empieza a escribir para ver coincidencias del catalogo."}
                </p>
            </div>
            <div class="recipe-builder-side-grid">
                <div>
                    <label class="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-ink/55">Cantidad</label>
                    <input
                        class="admin-input recipe-ingredient-quantity w-full rounded-[1rem] border border-olive/20 bg-sand px-4 py-3 text-sm text-ink"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Opcional"
                        value="${escapeHtml(data.quantity ?? "")}"
                    >
                </div>
                <label class="recipe-toggle-chip rounded-[1rem] border border-herb/20 bg-cream px-4 py-3 text-sm font-semibold text-ink/80">
                    <input type="checkbox" class="recipe-ingredient-optional mr-2" ${data.is_optional ? "checked" : ""}> Opcional
                </label>
            </div>
        </div>
        <div class="mt-3">
            <div>
                <label class="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-ink/55">Nota de preparacion</label>
                <input
                    class="admin-input recipe-ingredient-note w-full rounded-[1rem] border border-olive/20 bg-sand px-4 py-3 text-sm text-ink"
                    placeholder="Ej. picado fino, cocido, en cubos"
                    value="${escapeHtml(data.preparation_note || "")}"
                >
            </div>
        </div>
        <div class="recipe-builder-actions mt-4">
            <p class="builder-hint m-0">Si no necesitas cantidad o nota, puedes dejar esos campos vacios.</p>
            <button
                type="button"
                class="recipe-builder-remove rounded-full border border-rose-300 bg-white px-5 py-3 text-sm font-extrabold text-rose-700"
            >
                Quitar ingrediente
            </button>
        </div>
    `;

    row.querySelector(".recipe-builder-remove").addEventListener("click", () => {
        row.remove();
        refreshRecipeBuilders(elements);
    });

    row.querySelectorAll("input").forEach((element) => {
        element.addEventListener("input", () => refreshRecipeBuilders(elements));
        element.addEventListener("change", () => refreshRecipeBuilders(elements));
    });

    const searchInput = row.querySelector(".recipe-ingredient-search");
    searchInput.addEventListener("input", () => {
        syncRecipeIngredientSelection(state, row);
        refreshRecipeBuilders(elements);
    });

    searchInput.addEventListener("change", () => {
        syncRecipeIngredientSelection(state, row);
        refreshRecipeBuilders(elements);
    });

    syncRecipeIngredientSelection(state, row);

    return row;
}

function createRecipeStepRow(elements, data = {}) {
    const row = document.createElement("div");
    row.className =
        "recipe-builder-row recipe-step-card rounded-[1.15rem] border border-herb/20 bg-white p-4";

    row.innerHTML = `
        <div class="builder-section-title">
            <span class="builder-section-badge recipe-step-index">1</span>
            <div class="min-w-0">
                <p class="m-0 text-base font-extrabold text-ink">Paso de preparacion</p>
                <p class="builder-hint m-0 mt-1">El orden visual define el numero final del paso.</p>
            </div>
        </div>
        <div class="recipe-builder-stack mt-4">
            <div>
                <label class="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-ink/55">Instruccion</label>
                <textarea
                    class="admin-input recipe-step-instruction w-full rounded-[1rem] border border-olive/20 bg-sand px-4 py-3 text-sm text-ink"
                    rows="4"
                    placeholder="Describe la accion principal de este paso"
                >${escapeHtml(data.instruction || "")}</textarea>
            </div>
            <div class="recipe-builder-side-grid">
                <div>
                    <label class="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-ink/55">Minutos</label>
                    <input
                        class="admin-input recipe-step-minutes w-full rounded-[1rem] border border-olive/20 bg-sand px-4 py-3 text-sm text-ink"
                        type="number"
                        min="0"
                        placeholder="Opcional"
                        value="${escapeHtml(data.estimated_minutes ?? "")}"
                    >
                </div>
                <button
                    type="button"
                    class="recipe-builder-remove rounded-full border border-rose-300 bg-white px-5 py-3 text-sm font-extrabold text-rose-700 self-end"
                >
                    Quitar paso
                </button>
            </div>
        </div>
    `;

    row.querySelector(".recipe-builder-remove").addEventListener("click", () => {
        row.remove();
        refreshRecipeBuilders(elements);
    });

    row.querySelectorAll("input, textarea").forEach((element) => {
        element.addEventListener("input", () => refreshRecipeBuilders(elements));
        element.addEventListener("change", () => refreshRecipeBuilders(elements));
    });

    return row;
}

function addRecipeIngredientRow(state, elements, data = {}) {
    elements.recipe.ingredientsBuilder.appendChild(
        createRecipeIngredientRow(state, elements, data)
    );
    refreshRecipeBuilders(elements);
}

function addRecipeStepRow(elements, data = {}) {
    elements.recipe.stepsBuilder.appendChild(
        createRecipeStepRow(elements, data)
    );
    refreshRecipeBuilders(elements);
}

function renderBuilderEmptyState(container, message) {
    const rowCount = container.querySelectorAll(".recipe-builder-row").length;
    const existingEmptyState = container.querySelector(".builder-empty-state");

    if (rowCount) {
        if (existingEmptyState) {
            existingEmptyState.remove();
        }
        return;
    }

    if (!existingEmptyState) {
        container.innerHTML = `<div class="builder-empty-state">${escapeHtml(message)}</div>`;
    } else {
        existingEmptyState.textContent = message;
    }
}

function refreshRecipeBuilders(elements) {
    const ingredientRows = Array.from(
        elements.recipe.ingredientsBuilder.querySelectorAll(".recipe-builder-row")
    );

    ingredientRows.forEach((row, index) => {
        const badge = row.querySelector(".recipe-ingredient-index");
        if (badge) {
            badge.textContent = String(index + 1);
        }
    });

    const stepRows = Array.from(
        elements.recipe.stepsBuilder.querySelectorAll(".recipe-builder-row")
    );

    stepRows.forEach((row, index) => {
        const badge = row.querySelector(".recipe-step-index");
        if (badge) {
            badge.textContent = String(index + 1);
        }
    });

    if (elements.recipe.ingredientsSummary) {
        elements.recipe.ingredientsSummary.textContent = ingredientRows.length
            ? `${ingredientRows.length} ingrediente(s) listos para esta receta.`
            : "Aun no has agregado ingredientes.";
    }

    if (elements.recipe.stepsSummary) {
        elements.recipe.stepsSummary.textContent = stepRows.length
            ? `${stepRows.length} paso(s) definidos en orden de preparacion.`
            : "Aun no has agregado pasos.";
    }

    renderBuilderEmptyState(
        elements.recipe.ingredientsBuilder,
        "Agrega al menos un ingrediente para poder guardar la receta."
    );

    renderBuilderEmptyState(
        elements.recipe.stepsBuilder,
        "Agrega los pasos de preparacion para dejar clara la receta."
    );
}

function validateRecipeIngredientRows(elements) {
    const invalidRow = Array.from(
        elements.recipe.ingredientsBuilder.querySelectorAll(".recipe-builder-row")
    ).find((row) => {
        const searchValue = row.querySelector(".recipe-ingredient-search")?.value.trim();
        const ingredientId = row.querySelector(".recipe-ingredient-id")?.value.trim();
        return searchValue && !ingredientId;
    });

    if (!invalidRow) {
        return;
    }

    invalidRow.scrollIntoView({ behavior: "smooth", block: "center" });
    invalidRow.querySelector(".recipe-ingredient-search")?.focus();

    throw new Error(
        "Selecciona un ingrediente valido desde las sugerencias del catalogo antes de guardar."
    );
}

function collectRecipeIngredients(elements) {
    validateRecipeIngredientRows(elements);

    return Array.from(
        elements.recipe.ingredientsBuilder.querySelectorAll(".recipe-builder-row")
    )
        .map((row) => ({
            ingredient_id: row.querySelector(".recipe-ingredient-id").value,
            quantity: row.querySelector(".recipe-ingredient-quantity").value || null,
            preparation_note: row.querySelector(".recipe-ingredient-note").value,
            is_optional: row.querySelector(".recipe-ingredient-optional").checked,
        }))
        .filter((item) => item.ingredient_id);
}

function collectRecipeSteps(elements) {
    return Array.from(
        elements.recipe.stepsBuilder.querySelectorAll(".recipe-builder-row")
    )
        .map((row) => ({
            instruction: row.querySelector(".recipe-step-instruction").value,
            estimated_minutes: row.querySelector(".recipe-step-minutes").value || null,
        }))
        .filter((item) => item.instruction.trim());
}

function resetRecipeForm(state, elements) {
    const form = elements.recipe.form;

    if (form) {
        form.reset();
    }

    elements.recipe.idInput.value = "";
    elements.recipe.ingredientsBuilder.innerHTML = "";
    elements.recipe.stepsBuilder.innerHTML = "";

    if (elements.recipe.statusSelect.options.length) {
        elements.recipe.statusSelect.selectedIndex = 0;
    }

    addRecipeIngredientRow(state, elements);
    addRecipeStepRow(elements);
}

function fillRecipeForm(state, elements, recipe) {
    elements.recipe.idInput.value = recipe.id || "";
    elements.recipe.titleInput.value = recipe.title || "";
    elements.recipe.statusSelect.value = recipe.recipe_status_id || "";
    elements.recipe.categorySelect.value = recipe.recipe_category_id || "";
    elements.recipe.difficultySelect.value = recipe.recipe_difficulty_id || "";
    elements.recipe.shortDescriptionInput.value = recipe.short_description || "";
    elements.recipe.descriptionInput.value = recipe.description || "";
    elements.recipe.servingsInput.value = recipe.servings || "";
    elements.recipe.prepTimeInput.value = recipe.prep_time_minutes || "";
    elements.recipe.cookTimeInput.value = recipe.cook_time_minutes || "";
    elements.recipe.totalTimeInput.value = recipe.total_time_minutes || "";

    elements.recipe.ingredientsBuilder.innerHTML = "";
    elements.recipe.stepsBuilder.innerHTML = "";

    (recipe.ingredients || []).forEach((ingredient) => {
        addRecipeIngredientRow(state, elements, ingredient);
    });

    (recipe.steps || []).forEach((step) => {
        addRecipeStepRow(elements, step);
    });

    if (!(recipe.ingredients || []).length) {
        addRecipeIngredientRow(state, elements);
    }

    if (!(recipe.steps || []).length) {
        addRecipeStepRow(elements);
    }
}

function rebuildRecipeIngredientRows(state, elements) {
    const currentRows = collectRecipeIngredients(elements);
    elements.recipe.ingredientsBuilder.innerHTML = "";

    if (!currentRows.length) {
        addRecipeIngredientRow(state, elements);
        return;
    }

    currentRows.forEach((item) => addRecipeIngredientRow(state, elements, item));
}

async function handleRecipeSubmit(event, state, elements) {
    event.preventDefault();

    const payload = {
        title: elements.recipe.titleInput.value,
        recipe_status_id: elements.recipe.statusSelect.value,
        recipe_category_id: elements.recipe.categorySelect.value || null,
        recipe_difficulty_id: elements.recipe.difficultySelect.value || null,
        short_description: elements.recipe.shortDescriptionInput.value,
        description: elements.recipe.descriptionInput.value,
        servings: elements.recipe.servingsInput.value || null,
        prep_time_minutes: elements.recipe.prepTimeInput.value || null,
        cook_time_minutes: elements.recipe.cookTimeInput.value || null,
        total_time_minutes: elements.recipe.totalTimeInput.value || null,
        ingredients: collectRecipeIngredients(elements),
        steps: collectRecipeSteps(elements),
    };

    const recipeId = elements.recipe.idInput.value;
    const path = recipeId ? `/recipes/${recipeId}` : "/recipes";
    const method = recipeId ? "PUT" : "POST";

    const response = await requestApi(path, {
        method,
        body: JSON.stringify(payload),
    });

    await Promise.all([
        loadRecipes(state, elements),
        loadIngredients(state, elements),
    ]);

    fillRecipeForm(state, elements, response.data);
    setStatusMessage(elements, response.message || "Receta guardada correctamente.");
}

async function handleRecipeDelete(state, elements) {
    const recipeId = elements.recipe.idInput.value;

    if (!recipeId) {
        setStatusMessage(
            elements,
            "Selecciona una receta antes de intentar archivarla.",
            true
        );
        return;
    }

    const response = await requestApi(`/recipes/${recipeId}`, {
        method: "DELETE",
    });

    await loadRecipes(state, elements);
    resetRecipeForm(elements);
    setStatusMessage(elements, response.message || "Receta archivada correctamente.");
}