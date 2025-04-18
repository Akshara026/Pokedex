document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pokemonName = urlParams.get("name");
    if (pokemonName) displayPokemonDetails(pokemonName);

    // Add event listener to correct button
    document.getElementById("favoritesContainer").addEventListener("click", addFavorite);
});

async function displayPokemonDetails(name) {
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
        console.log("helooo"+res);
        if (!res.ok) return alert("Pokémon not found!");

        const data = await res.json();
        const primaryType = data.types[0].type.name;
        console.log("dataaa"+data);
        document.getElementById("pokemonImage").src = data.sprites.other["official-artwork"].front_default;
        document.getElementById("pokemonName").textContent = data.name.toUpperCase();
        document.getElementById("pokemonNumber").textContent = `#${data.id}`;
        document.getElementById("pokemonHP").textContent = data.stats[0].base_stat;
        document.getElementById("pokemonAttack").textContent = data.stats[1].base_stat;
        document.getElementById("pokemonHeight").textContent = (data.height / 10) + " m";
        document.getElementById("pokemonWeight").textContent = (data.weight / 10) + " kg";

        const pokemonCard = document.getElementById("pokemonCard");
        pokemonCard.style.borderColor = getTypeColor(primaryType);
        pokemonCard.style.boxShadow = `0px 0px 15px ${getTypeColor(primaryType)}`;

        const typesContainer = document.getElementById("pokemonTypes");
        typesContainer.innerHTML = "";
        data.types.forEach(t => {
            const typeSpan = document.createElement("span");
            typeSpan.className = "type-badge px-3 py-1 rounded-full text-white font-semibold text-sm";
            typeSpan.textContent = t.type.name.toUpperCase();
            typeSpan.style.backgroundColor = getTypeColor(t.type.name);
            typesContainer.appendChild(typeSpan);
        });

        fetchEvolution(data.id);
        fetchWeaknesses(data.types[0].type.url);
        fetchAbilities(data.abilities);
        
    } catch (error) {
        console.error("Error fetching Pokémon:", error);
    }
}

// Function to add Pokémon to favorites
async function addFavorite() {
    const pokemonName = document.getElementById("pokemonName").textContent;
    const pokemonHP = document.getElementById("pokemonHP").textContent;
    const pokemonAttack = document.getElementById("pokemonAttack").textContent;
    const pokemonTypes = document.getElementById("pokemonTypes").querySelectorAll("span");
    const primaryType = pokemonTypes.length > 0 ? pokemonTypes[0].textContent.toLowerCase() : "unknown"; // Get first type if available

    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    // Check if Pokémon is already in localStorage
    if (favorites.some(pokemon => pokemon.name === pokemonName)) {
        alert(`${pokemonName} is already in favorites.`);
        return;
    }

    // Create the actual Pokémon data object
    const pokemonData = {
        id: `${pokemonName.toLowerCase()}-${Date.now()}`, // Unique ID
        name: pokemonName,
        hp: parseInt(pokemonHP),  // Real HP value from the page
        attack: parseInt(pokemonAttack),  // Real Attack value from the page
        type: primaryType,  // Real Type value from the first type (you could also loop through for multiple types)
    };

    // Add to localStorage
    favorites.push(pokemonData);
    localStorage.setItem("favorites", JSON.stringify(favorites));

    // Send only the new item to backend
    try {
        const response = await fetch("http://localhost:3000/add-favorite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pokemonData)
        });

        const textResponse = await response.text(); // Get raw response
        try {
            const data = JSON.parse(textResponse);
            console.log("Server Response:", data);

            if (response.ok) {
                alert(`${pokemonName} added to favorites and synced!`);
            } else {
                console.warn(`❌ Error adding ${pokemonName}:`, data.message);
            }
        } catch (error) {
            console.warn("Non-JSON Response:", textResponse);
        }

    } catch (error) {
        console.error(`❌ Failed to add ${pokemonName}:`, error);
    }
}




// Helper function to get type colors
function getTypeColor(type) {
    const colors = {
        grass: "#78C850", fire: "#F08030", water: "#6890F0",
        electric: "#F8D030", ice: "#98D8D8", fighting: "#C03028",
        poison: "#A040A0", ground: "#E0C068", flying: "#A890F0",
        psychic: "#F85888", bug: "#A8B820", rock: "#B8A038",
        ghost: "#705898", dragon: "#7038F8", dark: "#705848",
        steel: "#B8B8D0", fairy: "#EE99AC"
    };
    return colors[type] || "#777";
}
// Function to fetch Pokémon weaknesses based on type
async function fetchWeaknesses(typeUrl) {
    try {
        const res = await fetch(typeUrl);
        if (!res.ok) throw new Error("Type data not found!");

        const data = await res.json();
        const weaknesses = new Set();

        // Extract weaknesses from damage_relations
        data.damage_relations.double_damage_from.forEach(type => weaknesses.add(type.name));

        // Display weaknesses
        const weaknessesContainer = document.getElementById("pokemonWeaknesses");
        weaknessesContainer.innerHTML = "";

        if (weaknesses.size === 0) {
            weaknessesContainer.textContent = "No Major Weaknesses";
        } else {
            weaknesses.forEach(type => {
                const typeSpan = document.createElement("span");
                typeSpan.className = "type-badge px-3 py-1 rounded-full text-white font-semibold text-sm";
                typeSpan.textContent = type.toUpperCase();
                typeSpan.style.backgroundColor = getTypeColor(type);
                weaknessesContainer.appendChild(typeSpan);
            });
        }

    } catch (error) {
        console.error("Error fetching weaknesses:", error);
        document.getElementById("pokemonWeaknesses").textContent = "Not Available";
    }
}

async function fetchAbilities(abilities) {
    const abilitiesContainer = document.getElementById("pokemonAbilities");
    abilitiesContainer.innerHTML = ""; // Clear previous abilities

    abilities.forEach(ability => {
        const abilityItem = document.createElement("li");
        abilityItem.className = "bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-semibold";
        abilityItem.textContent = ability.ability.name.toUpperCase();  // Display ability name
        abilitiesContainer.appendChild(abilityItem);
    });
}



// Function to fetch evolution data
async function fetchEvolution(pokemonId) {
    try {
        const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`);
        const speciesData = await speciesRes.json();
        const evolutionRes = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionRes.json();

        let evoChain = [];
        let evoStage = evolutionData.chain;

        do {
            evoChain.push(evoStage.species.name);
            evoStage = evoStage.evolves_to.length > 0 ? evoStage.evolves_to[0] : null;
        } while (evoStage);

        document.getElementById("pokemonEvolution").textContent = evoChain.length > 1 ? `Evolves to ${evoChain[1].toUpperCase()}` : "No Evolution";

    } catch (error) {
        console.error("Error fetching evolution:", error);
        document.getElementById("pokemonEvolution").textContent = "Not Available";
    }
}
