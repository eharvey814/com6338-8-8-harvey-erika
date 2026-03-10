document.addEventListener("DOMContentLoaded", function () {
    // API key
    const API_KEY = "1022b269dd6b49239442bd26a06c25f4";

    // DOM elements
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("searchInput");
    const resultsDiv = document.getElementById("results");
    const favoritesDiv = document.getElementById("favorites");
    const loadmoreBtn = document.getElementById("loadmoreBtn");

    // Local storage
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    let offset = 0; // for pagination (if needed in future)
    const resultsPerPage = 12; // number of recipes to show per search

    //Fetch recipes from API
    const fetchRecipes = async (query, offset = 0) => {
        try {
            const response = await fetch(
                `https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=${resultsPerPage}&offset=${offset}&addRecipeInformation=true&apiKey=${API_KEY}`
            );

            const data = await response.json();
            return data.results || [];

        } catch (error) {
            console.error("Error fetching recipes:", error);
            return [];
        }
    };

    // Favorites functions
    const saveFavorites = () => {
        localStorage.setItem("favorites", JSON.stringify(favorites));
    };

    const addToFavorites = (recipe) => {
        if (!favorites.find((fav) => fav.id === recipe.id)) {
            favorites.push(recipe);
            saveFavorites();
            displayRecipes(favorites, favoritesDiv);
        }
    };

    const removeFromFavorites = (id) => {
        favorites = favorites.filter((fav) => fav.id !== id);
        saveFavorites();
        displayRecipes(favorites, favoritesDiv);
    };

    // Display recipes
    const displayRecipes = (recipes, container) => {
        container.innerHTML = "";

        if (!recipes || recipes.length === 0) {
            container.innerHTML = "<p>No recipes found.</p>";
            return;
        }

        recipes.forEach((recipe) => {
            const { id, title, image, sourceUrl } = recipe;

            // Create card
            const card = document.createElement("div");
            card.classList.add("card");

            // Card content
            card.innerHTML = `
            <a href="${sourceUrl}" target="_blank" class="recipe-link">
                <img src="${image}" alt="${title}">
                <h3>${title}</h3>
            </a>
            <button class="${container.id === "results" ? "add-favorite" : "remove-favorite"}">
            ${container.id === "results" ? "Add to Favorites" : "Remove Favorite"}
            </button>
            `;

            // Button functionality
            card.querySelector("button").addEventListener("click", (e) => {
                e.stopPropagation(); // prevent link click when pressing button
                container.id === "results"
                    ? addToFavorites(recipe)
                    : removeFromFavorites(id);
            });

            container.appendChild(card);
        });
    };

    // Search button event
    searchBtn.addEventListener("click", async () => {
        const query = searchInput.value.trim();
        if (!query) return;

        offset = 0; // reset pagination
        resultsDiv.innerHTML = '<div class="loader"></div>';

        const recipes = await fetchRecipes(query, offset);
        displayRecipes(recipes, resultsDiv);

        // Show button only if results exist
        loadmoreBtn.style.display = recipes.length > 0 ? "block" : "none";
    });

    // Load more button event
    loadmoreBtn.addEventListener("click", async () => {
        const query = searchInput.value.trim();
        offset += resultsPerPage;

        const moreRecipes = await fetchRecipes(query, offset);

        moreRecipes.forEach((recipe) => {
            const { id, title, image, sourceUrl } = recipe;

            const card = document.createElement("div");
            card.classList.add("card");

            card.innerHTML = `
            <a href="${sourceUrl}" target="_blank" class="recipe-link">
                <img src="${image}" alt="${title}">
                <h3>${title}</h3>
            </a>
            <button class="add-favorite">Add to Favorites</button>
        `;

            card.querySelector("button").addEventListener("click", (e) => {
                e.stopPropagation();
                addToFavorites(recipe);
            });

            resultsDiv.appendChild(card);
        });

        // Hide button if no more results
        if (moreRecipes.length < resultsPerPage) {
            loadmoreBtn.style.display = "none";
        }
    });

    // Allow pressing Enter to search
    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            searchBtn.click();
        }
    });

    // Load favorites on page load
    displayRecipes(favorites, favoritesDiv);

});