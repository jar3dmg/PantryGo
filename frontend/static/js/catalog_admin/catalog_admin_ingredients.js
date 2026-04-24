// catalog_admin_ingredients.js
// Logica especifica del CRUD de ingredientes.

function loadIngredients(state, elements) {
    return requestApi("/ingredients").then((payload) => {
        state.ingredients = payload.data || [];

        renderIngredientList(state, elements);

        // Estas funciones viven en el archivo de recetas.
        if (typeof populateRecipeIngredientOptions === "function") {
            populateRecipeIngredientOptions(state, elements);
        }

        if (typeof rebuildRecipeIngredientRows === "function") {
            rebuildRecipeIngredientRows(state, elements);
        }
    });
}

function renderIngredientList(state, elements) {
    const ingredientList = elements.ingredient.list;
    const ingredientSearchInput = elements.ingredient.searchInput;

    if (!ingredientList) {
        return;
    }

    const searchTerm = (ingredientSearchInput?.value || "").trim().toLowerCase();

    const filteredItems = state.ingredients.filter((ingredient) => {
        return (
            !searchTerm
            || matchesSearchTerm(ingredient.name, searchTerm)
            || matchesSearchTerm(ingredient.slug, searchTerm)
            || matchesSearchTerm(ingredient.category_name, searchTerm)
            || matchesSearchTerm(ingredient.description, searchTerm)
        );
    });

    ingredientList.innerHTML = "";

    if (!filteredItems.length) {
        ingredientList.innerHTML = `
            <div class="rounded-[1.25rem] border border-dashed border-olive/20 bg-sand px-4 py-5 text-sm text-ink/65">
                No hay ingredientes que coincidan con la busqueda.
            </div>
        `;
        return;
    }

    filteredItems.forEach((ingredient) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className =
            "admin-list-item w-full rounded-[1.25rem] border border-herb/20 bg-sand px-4 py-4 text-left transition hover:translate-y-[-1px] hover:shadow-soft";

        const description = ingredient.description || "Sin descripcion registrada.";

        item.innerHTML = `
            <div class="flex flex-wrap items-start justify-between gap-4">
                <div class="min-w-0 flex-1">
                    <p class="text-lg font-extrabold text-ink">${escapeHtml(ingredient.name)}</p>
                    <div class="mt-2 flex flex-wrap gap-2">
                        <span class="admin-summary-chip">${escapeHtml(ingredient.category_name || "Sin categoria")}</span>
                        <span class="admin-summary-chip">Slug: ${escapeHtml(ingredient.slug || "")}</span>
                    </div>
                    <p class="mt-3 text-sm leading-6 text-ink/70">${escapeHtml(description)}</p>
                </div>
                <span class="rounded-full px-3 py-1 text-xs font-extrabold ${ingredient.is_active ? "bg-white text-emerald-700" : "bg-white text-rose-700"}">
                    ${ingredient.is_active ? "Activo" : "Inactivo"}
                </span>
            </div>
        `;

        item.addEventListener("click", () => {
            fillIngredientForm(elements, ingredient);
        });

        ingredientList.appendChild(item);
    });
}

function resetIngredientForm(elements) {
    const form = elements.ingredient.form;
    const idInput = elements.ingredient.idInput;
    const isActiveInput = elements.ingredient.isActiveInput;
    const categorySelect = elements.ingredient.categorySelect;

    if (form) {
        form.reset();
    }

    if (idInput) {
        idInput.value = "";
    }

    if (isActiveInput) {
        isActiveInput.checked = true;
    }

    if (categorySelect && categorySelect.options.length) {
        categorySelect.selectedIndex = 0;
    }
}

function fillIngredientForm(elements, ingredient) {
    elements.ingredient.idInput.value = ingredient.id || "";
    elements.ingredient.nameInput.value = ingredient.name || "";
    elements.ingredient.categorySelect.value = ingredient.ingredient_category_id || "";
    elements.ingredient.descriptionInput.value = ingredient.description || "";
    elements.ingredient.isActiveInput.checked = Boolean(ingredient.is_active);
}

function buildIngredientPayload(elements) {
    return {
        name: elements.ingredient.nameInput.value,
        ingredient_category_id: elements.ingredient.categorySelect.value,
        description: elements.ingredient.descriptionInput.value,
        is_active: elements.ingredient.isActiveInput.checked,
    };
}

async function handleIngredientSubmit(event, state, elements) {
    event.preventDefault();

    const payload = buildIngredientPayload(elements);
    const ingredientId = elements.ingredient.idInput.value;

    const path = ingredientId ? `/ingredients/${ingredientId}` : "/ingredients";
    const method = ingredientId ? "PUT" : "POST";

    const response = await requestApi(path, {
        method,
        body: JSON.stringify(payload),
    });

    await loadIngredients(state, elements);
    fillIngredientForm(elements, response.data);
    setStatusMessage(elements, response.message || "Ingrediente guardado correctamente.");
}

async function handleIngredientDelete(state, elements) {
    const ingredientId = elements.ingredient.idInput.value;

    if (!ingredientId) {
        setStatusMessage(
            elements,
            "Selecciona un ingrediente antes de intentar darlo de baja.",
            true
        );
        return;
    }

    const response = await requestApi(`/ingredients/${ingredientId}`, {
        method: "DELETE",
    });

    await loadIngredients(state, elements);
    resetIngredientForm(elements);
    setStatusMessage(elements, response.message || "Ingrediente dado de baja correctamente.");
}

function getActiveIngredients(state) {
    return state.ingredients.filter((item) => item.is_active);
}

function getIngredientById(state, ingredientId) {
    return state.ingredients.find((item) => String(item.id) === String(ingredientId)) || null;
}

function getIngredientByName(state, ingredientName) {
    const normalizedName = String(ingredientName || "").trim().toLowerCase();

    if (!normalizedName) {
        return null;
    }

    return (
        getActiveIngredients(state).find(
            (item) => item.name.toLowerCase() === normalizedName
        ) || null
    );
}