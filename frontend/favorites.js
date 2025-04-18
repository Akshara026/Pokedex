document.addEventListener("DOMContentLoaded", () => {
    displayFavorites();
});

function displayFavorites() {
    const favoritesList = document.getElementById("favoritesList");
    favoritesList.innerHTML = ""; // Clear previous content

    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (favorites.length === 0) {
        favoritesList.innerHTML = "<p class='text-xl text-gray-300'>No favorites added yet.</p>";
        return;
    }

    favorites.forEach(pokemon => {
        const card = document.createElement("div");
        card.className = "bg-white/20 backdrop-blur-lg shadow-md p-4 rounded-lg text-center border border-white/30 transition-all duration-300 w-48";

        card.innerHTML = `
            <p class="text-lg font-bold text-white">${pokemon.name}</p>
            <p class="text-sm text-gray-300">HP: ${pokemon.hp} | ATK: ${pokemon.attack}</p>
            <p class="text-xs text-gray-300">Type: ${pokemon.type}</p>
            <button class="mt-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition remove-btn" data-name="${pokemon.name}">Remove</button>
        `;

        favoritesList.appendChild(card);
    });


    document.querySelectorAll(".remove-btn").forEach(button => {
        button.addEventListener("click", removeFavorite);
    });
}


// function removeFavorite(event) {
//     const pokemonName = event.target.getAttribute("data-name");
//     let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

//     favorites = favorites.filter(pokemon => pokemon.name !== pokemonName);
//     localStorage.setItem("favorites", JSON.stringify(favorites));

//     displayFavorites();
// }

async function removeFavorite(event) {
    const pokemonName = event.target.getAttribute("data-name");

    // Get current favorites from localStorage
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    // Find the correct Pokémon (to get the `_id` stored from MongoDB)
    const targetPokemon = favorites.find(p => p.name === pokemonName);
    if (!targetPokemon || !targetPokemon._id) {
        console.error("Couldn't find Pokémon ID for deletion.");
        return;
    }

    // DELETE request to backend
    try {
        const response = await fetch(`http://localhost:3000/favorites/remove/${targetPokemon._id}`, {
            method: 'DELETE',
        });

        const result = await response.json();
        console.log(result.message);

        // Remove from localStorage
        favorites = favorites.filter(pokemon => pokemon._id !== targetPokemon._id);
        localStorage.setItem("favorites", JSON.stringify(favorites));

        // Update UI
        displayFavorites();
    } catch (error) {
        console.error("Error deleting favorite:", error);
    }
}

