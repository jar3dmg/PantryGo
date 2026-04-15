// Controla desplegables, filtros y paginacion de la vista de resultados.

function toggleRecipeDetails(event) {
    const button = event.currentTarget;
    const detailsPanel = button.nextElementSibling;
    const icon = button.querySelector(".recipe-toggle-icon");

    if (!detailsPanel) {
        return;
    }

    const isHidden = detailsPanel.classList.contains("hidden");
    detailsPanel.classList.toggle("hidden", !isHidden);

    if (icon) {
        icon.style.transform = isHidden ? "rotate(180deg)" : "rotate(0deg)";
    }
}

function setupRecipeToggles() {
    // Conecta cada boton con su panel de detalle.
    const allToggleButtons = document.querySelectorAll(".recipe-toggle-button");
    allToggleButtons.forEach((button) => {
        button.addEventListener("click", toggleRecipeDetails);
    });
}

function setupSuggestionsPagination() {
    // Pagina las sugerencias para hacer mas ligera la lectura.
    const ITEMS_PER_PAGE = 5;
    const listContainer = document.getElementById("suggestions-list");
    const paginationContainer = document.getElementById("pagination-controls");

    if (!listContainer || !paginationContainer) {
        return;
    }

    const allItems = Array.from(listContainer.children).filter(
        (item) => !item.classList.contains("hidden-by-filter")
    );
    const filteredOutItems = Array.from(listContainer.children).filter((item) =>
        item.classList.contains("hidden-by-filter")
    );
    const totalItems = allItems.length;

    if (totalItems <= ITEMS_PER_PAGE) {
        filteredOutItems.forEach((item) => item.classList.add("hidden"));
        allItems.forEach((item) => item.classList.remove("hidden"));
        return;
    }

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    let currentPage = 1;

    paginationContainer.innerHTML = `
        <button id="prev-page" class="rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50">
            Anterior
        </button>
        <span id="page-indicator" class="font-semibold text-gray-700">
            Pagina 1 de ${totalPages}
        </span>
        <button id="next-page" class="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
            Siguiente
        </button>
    `;

    const prevButton = document.getElementById("prev-page");
    const nextButton = document.getElementById("next-page");
    const pageIndicator = document.getElementById("page-indicator");

    function showPage(page) {
        currentPage = page;
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = page * ITEMS_PER_PAGE;

        allItems.forEach((item, index) => {
            const isVisible = index >= startIndex && index < endIndex;
            item.classList.toggle("hidden", !isVisible);
        });
        filteredOutItems.forEach((item) => item.classList.add("hidden"));

        pageIndicator.textContent = `Pagina ${currentPage} de ${totalPages}`;
        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;
    }

    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            showPage(currentPage - 1);
        }
    });

    nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
            showPage(currentPage + 1);
        }
    });

    showPage(1);
}

function setupBlockedPagination() {
    // Pagina las recetas descartadas por ingredientes prohibidos.
    const ITEMS_PER_PAGE = 6;
    const listContainer = document.getElementById("blocked-list");
    const paginationContainer = document.getElementById("blocked-pagination-controls");

    if (!listContainer || !paginationContainer) {
        return;
    }

    const allItems = Array.from(listContainer.children);
    const totalItems = allItems.length;

    if (totalItems <= ITEMS_PER_PAGE) {
        allItems.forEach((item) => item.classList.remove("hidden"));
        return;
    }

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    let currentPage = 1;

    paginationContainer.innerHTML = `
        <button id="blocked-prev-page" class="rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50">
            Anterior
        </button>
        <span id="blocked-page-indicator" class="font-semibold text-gray-700">
            Pagina 1 de ${totalPages}
        </span>
        <button id="blocked-next-page" class="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
            Siguiente
        </button>
    `;

    const prevButton = document.getElementById("blocked-prev-page");
    const nextButton = document.getElementById("blocked-next-page");
    const pageIndicator = document.getElementById("blocked-page-indicator");

    function showPage(page) {
        currentPage = page;
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = page * ITEMS_PER_PAGE;

        allItems.forEach((item, index) => {
            const isVisible = index >= startIndex && index < endIndex;
            item.classList.toggle("hidden", !isVisible);
        });

        pageIndicator.textContent = `Pagina ${currentPage} de ${totalPages}`;
        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;
    }

    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            showPage(currentPage - 1);
        }
    });

    nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
            showPage(currentPage + 1);
        }
    });

    showPage(1);
}

function setupCategoryFilters() {
    // Reutiliza el filtro por categoria en resultados y catalogo completo.
    const filterSelects = document.querySelectorAll(".results-category-filter");

    filterSelects.forEach((select) => {
        select.addEventListener("change", () => {
            const selectedCategory = select.value;
            const targetListId = select.dataset.targetList;
            const targetList = document.getElementById(targetListId);

            if (!targetList) {
                return;
            }

            const items = Array.from(targetList.querySelectorAll(".recipe-filter-item"));
            items.forEach((item) => {
                const itemCategory = item.dataset.category || "";
                const shouldShow = !selectedCategory || itemCategory === selectedCategory;
                item.classList.toggle("hidden-by-filter", !shouldShow);
                item.classList.toggle("hidden", !shouldShow && targetListId !== "suggestions-list");
            });

            if (targetListId === "suggestions-list") {
                const paginationContainer = document.getElementById("pagination-controls");
                if (paginationContainer) {
                    paginationContainer.innerHTML = "";
                }

                items.forEach((item) => item.classList.remove("hidden"));
                const visibleItems = items.filter((item) => !item.classList.contains("hidden-by-filter"));
                items.forEach((item) => {
                    if (item.classList.contains("hidden-by-filter")) {
                        item.classList.add("hidden");
                    }
                });

                setupSuggestionsPagination();
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setupRecipeToggles();
    setupSuggestionsPagination();
    setupBlockedPagination();
    setupCategoryFilters();
});
