// Function to show suggestions while typing
async function showSuggestions() {
    const input = document.getElementById("pokemonSearch").value.toLowerCase();
    const suggestionsBox = document.getElementById("suggestions");

    // Clear previous suggestions
    suggestionsBox.innerHTML = "";
    suggestionsBox.classList.add("hidden");

    if (input.length === 0) return;

    try {
        // Fetch Pokémon list from PokéAPI
        let response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1000");
        let data = await response.json();
        let allPokemon = data.results.map(p => p.name);

        // Filter Pokémon names based on input
        const filtered = allPokemon.filter(name => name.startsWith(input)).slice(0, 5);

        if (filtered.length > 0) {
            suggestionsBox.classList.remove("hidden");
        }

        // Display suggestions
        filtered.forEach(name => {
            const li = document.createElement("li");
            li.textContent = name;
            li.classList.add("px-3", "py-2", "cursor-pointer", "hover:bg-gray-200");
            li.onclick = () => selectPokemon(name);
            suggestionsBox.appendChild(li);
        });

    } catch (error) {
        console.error("Error fetching Pokémon list:", error);
    }
}

// Select Pokémon from suggestions
function selectPokemon(name) {
    document.getElementById("pokemonSearch").value = name;
    document.getElementById("suggestions").innerHTML = "";
    document.getElementById("suggestions").classList.add("hidden");
}

// Function to search and display Pokémon details
async function searchPokemon() {
    const name = document.getElementById('pokemonSearch').value.trim().toLowerCase();
    if (!name) return alert("Enter a Pokémon name!");

    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        if (!res.ok) return alert("Pokémon not found!");

        const data = await res.json();

        document.getElementById('pokemonResult').innerHTML = `
            <div class="border p-5 rounded-lg shadow-lg bg-white/30">
                <img src="${data.sprites.front_default}" alt="${data.name}" class="mx-auto w-32">
                <p class="text-xl font-semibold">${data.name.toUpperCase()}</p>
                <p>Type: ${data.types.map(t => t.type.name).join(', ')}</p>
                <p>HP: ${data.stats[0].base_stat}, Attack: ${data.stats[1].base_stat}</p>
                <button onclick="addToFavorites('${data.name}', '${data.sprites.front_default}', '${data.stats[0].base_stat}', '${data.stats[1].base_stat}', '${data.stats[2].base_stat}', '${data.types.map(t => t.type.name)}')"
                    class="mt-3 bg-green-500 text-white px-4 py-2 rounded-md">+ Add to Favorites</button>
            </div>
        `;

    } catch (error) {
        console.error("Error fetching Pokémon:", error);
    }
}

// Function to add Pokémon to favorites (MongoDB)
async function addToFavorites(name, image, hp, attack, defense, type) {
    try {
        const response = await fetch('http://localhost:5000/api/pokemon/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                type: type.split(","),  // Convert type string to array
                hp: hp,
                attack: attack,
                defense: defense,
                image: image
            })
        });

        const result = await response.json();
        alert(result.message);
        fetchFavorites(); // Refresh favorites list
    } catch (error) {
        console.error("Error adding to favorites:", error);
    }
}

// Function to fetch and display favorites
async function fetchFavorites() {
    try {
        const res = await fetch('http://localhost:5000/api/pokemon');
        const favorites = await res.json();

        document.getElementById('favoritesList').innerHTML = favorites.map(pokemon => `
            <div class="border p-5 rounded-lg shadow-lg bg-white/30">
                <img src="${pokemon.image}" alt="${pokemon.name}" class="mx-auto w-32">
                <p class="text-xl font-semibold">${pokemon.name.toUpperCase()}</p>
                <p>Type: ${pokemon.type.join(', ')}</p>
                <p>HP: ${pokemon.hp}, Attack: ${pokemon.attack}</p>
                <button onclick="removeFavorite('${pokemon._id}')" 
                    class="mt-3 bg-red-500 text-white px-4 py-2 rounded-md">Remove</button>
            </div>
        `).join('');
    } catch (error) {
        console.error("Error fetching favorites:", error);
    }
}

// Function to remove a favorite Pokémon
async function removeFavorite(id) {
    try {
        await fetch(`http://localhost:5000/api/pokemon/remove/${id}`, {
            method: 'DELETE'
        });
        fetchFavorites(); // Refresh list after deletion
    } catch (error) {
        console.error("Error removing favorite:", error);
    }
}

// Call fetchFavorites() when the page loads
document.addEventListener('DOMContentLoaded', fetchFavorites);

// Ensure search works when clicking the button
document.getElementById("searchButton").addEventListener("click", searchPokemon);
