
let allPokemon = [];

// Load Pokémon list on page load
document.addEventListener('DOMContentLoaded', () => {
    loadPokemonList();
    fetchFavorites();
    setupTypeButtonListeners();

    // const audio = document.getElementById("myAudio");
    // audio.volume = Math.pow(10, -20 / 20); // ~0.1 volume
});

// Load all Pokémon names
async function loadPokemonList() {
    try {
        let response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1000");
        let data = await response.json();
        allPokemon = data.results.map(p => p.name);
    } catch (error) {
        console.error("Error fetching Pokémon list:", error);
    }
}

// Show suggestions under input
function showSuggestions() {
    const input = document.getElementById("pokemonSearch").value.toLowerCase();
    const suggestionsBox = document.getElementById("suggestions");

    suggestionsBox.innerHTML = "";
    suggestionsBox.classList.add("hidden");

    if (input.length === 0) return;

    const filtered = allPokemon.filter(name => name.startsWith(input)).slice(0, 5);

    if (filtered.length > 0) {
        suggestionsBox.classList.remove("hidden");
    }

    filtered.forEach(name => {
        const li = document.createElement("li");
        li.textContent = name;
        li.classList.add("px-3", "py-2", "cursor-pointer", "hover:bg-gray-200");
        li.onclick = () => selectPokemon(name);
        suggestionsBox.appendChild(li);
    });
}

// Select Pokémon from suggestion
function selectPokemon(name) {
    document.getElementById("pokemonSearch").value = name;
    document.getElementById("suggestions").innerHTML = "";
    document.getElementById("suggestions").classList.add("hidden");
    searchPokemon(); // Auto search on selection
}

// Search Pokémon and show its details
async function searchPokemon() {
    const name = document.getElementById('pokemonSearch').value.trim().toLowerCase();
    if (!name) return alert("Enter a Pokémon name!");

    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        if (!res.ok) return alert("Pokémon not found!");

        const data = await res.json();

        // Redirect to pokemonDetails.html with the Pokémon's name as a query parameter
        window.location.href = `pokemon.html?name=${data.name}`;
    } catch (error) {
        console.error("Error fetching Pokémon:", error);
    }
}


// Add Pokémon to favorites (MongoDB backend)
async function addToFavorites(name, image, hp, attack, defense, type) {
    try {
        const response = await fetch('http://localhost:5000/api/pokemon/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, type, hp, attack, defense, image })
        });

        const result = await response.json();
        alert(result.message);
        fetchFavorites();
    } catch (error) {
        console.error("Error adding to favorites:", error);
    }
}

// Fetch and display favorites
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

// Remove favorite Pokémon
async function removeFavorite(id) {
    try {
        await fetch(`http://localhost:5000/api/pokemon/remove/${id}`, { method: 'DELETE' });
        fetchFavorites();
    } catch (error) {
        console.error("Error removing favorite:", error);
    }
}

// Set up listeners for type filter buttons
function setupTypeButtonListeners() {
    const typeButtons = document.querySelectorAll("button");
    typeButtons.forEach(button => {
        button.addEventListener("click", () => {
            const type = button.innerText.toLowerCase().replace(" type", "");
            fetchPokemonByType(type);
        });
    });
}

// Fetch Pokémon by type and show them
async function fetchPokemonByType(type) {
    const url = `https://pokeapi.co/api/v2/type/${type}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const pokemons = data.pokemon.slice(0, 10);

        const pokemonDetails = await Promise.all(
            pokemons.map(async (p) => {
                const res = await fetch(p.pokemon.url);
                return await res.json();
            })
        );

        displayPokemon(pokemonDetails);
    } catch (error) {
        console.error("Error fetching Pokémon:", error);
    }
}

// Display a list of Pokémon in grid
function displayPokemon(pokemonList) {
    const pokemonGrid = document.querySelector(".grid");
    pokemonGrid.innerHTML = "";

    pokemonList.forEach(pokemon => {
        const imgSrc = pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default;

        const pokemonHTML = `
            <div class="border-2 border-white/30 p-3 rounded-lg bg-white/30 backdrop-blur-md h-72 flex flex-col items-center justify-center hover:shadow-lg">
                <img src="${imgSrc}" alt="${pokemon.name}" class="w-full h-52 object-contain">
                <p class="text-slate-900 text-lg font-semibold mt-2">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</p>
            </div>
        `;
        pokemonGrid.innerHTML += pokemonHTML;
    });
}

// Add search button listener
document.getElementById("searchButton")?.addEventListener("click", searchPokemon);
