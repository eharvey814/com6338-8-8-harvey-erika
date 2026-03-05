document.addEventListener("DOMContentLoaded", function () {

    // ============================
    // API key
    // ============================
    var API_KEY = "1022b269dd6b49239442bd26a06c25f4";

    // ============================
    // DOM elements
    // ============================
    var searchBtn = document.getElementById("searchBtn");
    var searchInput = document.getElementById("searchInput");
    var resultsDiv = document.getElementById("results");
    var favoritesDiv = document.getElementById("favorites");

    // ============================
    // Local storage
    // ============================
    var favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    // ============================
    // Fetch recipes
    // ============================
    var fetchRecipes = async (query) => {
        try {
            var response = await fetch(
                `https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=12&addRecipeInformation=true&apiKey=${API_KEY}`
            );

            var data = await response.json();

            return data.results || [];

        } catch (error) {
            console.error("Error fetching recipes:", error);
            return [];
        }
    };

    // ============================
    // Display recipes
    // ============================
    var displayRecipes = (recipes, container) => {
        container.innerHTML = "";

        if (!recipes || recipes.length === 0) {
            container.innerHTML = "<p>No recipes found.</p>";
            return;
        }

        recipes.forEach((recipe) => {
            var { id, title, image } = recipe;

            var card = document.createElement("div");
            card.classList.add("card");

            card.innerHTML = `
                <img src="${image}" alt="${title}">
                <h3>${title}</h3>
                <button>
                    ${container.id === "results" ? "Add to Favorites" : "Remove Favorite"}
                </button>           
            `;

            card.querySelector("button").addEventListener("click", () => {
                container.id === "results"
                    ? addToFavorites(recipe)
                    : removeFromFavorites(id);
            });

            container.appendChild(card);
        });
    };

    // ============================
    // Favorites functions
    // ============================
    var saveFavorites = () => {
        localStorage.setItem("favorites", JSON.stringify(favorites));
    };

    var addToFavorites = (recipe) => {
        if (!favorites.find((fav) => fav.id === recipe.id)) {
            favorites.push(recipe);
            saveFavorites();
            displayRecipes(favorites, favoritesDiv);
        }
    };

    var removeFromFavorites = (id) => {
        favorites = favorites.filter((fav) => fav.id !== id);
        saveFavorites();
        displayRecipes(favorites, favoritesDiv);
    };

    // ============================
    // Search button event
    // ============================
    searchBtn.addEventListener("click", async () => {
        var query = searchInput.value.trim();
        if (!query) return;

        // Show loader while fetching
        resultsDiv.innerHTML = '<div class="loader"></div>';

        var recipes = await fetchRecipes(query);
        displayRecipes(recipes, resultsDiv);
    });

    // ============================
    // Load favorites on page load
    // ============================
    displayRecipes(favorites, favoritesDiv);

});