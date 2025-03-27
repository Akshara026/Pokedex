async function displayPokemonDetails(name) {
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
        if (!res.ok) return alert("Pokémon not found!");

        const data = await res.json();

        // Set Image and Name
        document.getElementById("pokemonImage").src = data.sprites.other["official-artwork"].front_default;
        document.getElementById("pokemonName").textContent = data.name.toUpperCase();
        document.getElementById("pokemonNumber").textContent = `#${data.id}`;
        document.getElementById("pokemonHP").textContent = data.stats[0].base_stat;
        document.getElementById("pokemonAttack").textContent = data.stats[1].base_stat;
        document.getElementById("pokemonHeight").textContent = (data.height / 10) + " m";  // Convert decimeters to meters
        document.getElementById("pokemonWeight").textContent = (data.weight / 10) + " kg";  // Convert hectograms to kg

        // Type Badges
        const typesContainer = document.getElementById("pokemonTypes");
        typesContainer.innerHTML = "";
        data.types.forEach(t => {
            const typeSpan = document.createElement("span");
            typeSpan.className = "type-badge";
            typeSpan.textContent = t.type.name;
            typeSpan.style.backgroundColor = getTypeColor(t.type.name);
            typesContainer.appendChild(typeSpan);
        });

        // Fetch Evolution Details
        fetchEvolution(data.id);

        // Fetch Weaknesses from Type API
        fetchWeaknesses(data.types[0].type.url);

    } catch (error) {
        console.error("Error fetching Pokémon:", error);
    }
}

// Fetch Evolution Details
async function fetchEvolution(pokemonId) {
    try {
        const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`);
        const speciesData = await speciesRes.json();
        const evolutionRes = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionRes.json();

        let evoChain = [];
        let evoStage = evolutionData.chain;

        // Loop through evolution chain properly
        do {
            evoChain.push(evoStage.species.name);
            evoStage = evoStage.evolves_to.length > 0 ? evoStage.evolves_to[0] : null;
        } while (evoStage);

        // Determine evolution text
        const currentPokemon = speciesData.name.toLowerCase();
        if (evoChain.length === 1) {
            document.getElementById("pokemonEvolution").textContent = "No Evolution";
        } else if (evoChain.includes(currentPokemon)) {
            let index = evoChain.indexOf(currentPokemon);
            if (index === 0) {
                document.getElementById("pokemonEvolution").textContent = `Evolves to ${evoChain[1].toUpperCase()}`;
            } else if (index === evoChain.length - 1) {
                document.getElementById("pokemonEvolution").textContent = "No Further Evolution";
            } else {
                document.getElementById("pokemonEvolution").textContent = `Evolves from ${evoChain[index - 1].toUpperCase()} → Evolves to ${evoChain[index + 1].toUpperCase()}`;
            }
        } else {
            document.getElementById("pokemonEvolution").textContent = "No Evolution";
        }

    } catch (error) {
        console.error("Error fetching evolution:", error);
        document.getElementById("pokemonEvolution").textContent = "Not Available";
    }
}
async function displayPokemonDetails(name) {
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
        if (!res.ok) return alert("Pokémon not found!");

        const data = await res.json();

        // Set Image and Name
        document.getElementById("pokemonImage").src = data.sprites.other["official-artwork"].front_default;
        document.getElementById("pokemonName").textContent = data.name.toUpperCase();
        document.getElementById("pokemonNumber").textContent = `#${data.id}`;
        document.getElementById("pokemonHP").textContent = data.stats[0].base_stat;
        document.getElementById("pokemonAttack").textContent = data.stats[1].base_stat;
        document.getElementById("pokemonHeight").textContent = (data.height / 10) + " m";  // Convert to meters
        document.getElementById("pokemonWeight").textContent = (data.weight / 10) + " kg";  // Convert to kg

        // Type Badges
        const typesContainer = document.getElementById("pokemonTypes");
        typesContainer.innerHTML = "";
        data.types.forEach(t => {
            const typeSpan = document.createElement("span");
            typeSpan.className = "type-badge";
            typeSpan.textContent = t.type.name;
            typeSpan.style.backgroundColor = getTypeColor(t.type.name);
            typesContainer.appendChild(typeSpan);
        });

        // Fetch and display abilities
        const abilitiesList = document.getElementById("pokemonAbilities");
        abilitiesList.innerHTML = ""; // Clear previous content
        data.abilities.forEach(a => {
            const li = document.createElement("li");
            li.textContent = a.ability.name.replace("-", " "); // Replace hyphens for readability
            abilitiesList.appendChild(li);
        });

        // Fetch Evolution Details
        fetchEvolution(data.id);

        // Fetch Weaknesses from Type API
        fetchWeaknesses(data.types[0].type.url);

    } catch (error) {
        console.error("Error fetching Pokémon:", error);
    }
}



// Fetch Weaknesses
async function fetchWeaknesses(typeUrl) {
    try {
        const typeRes = await fetch(typeUrl);
        const typeData = await typeRes.json();
        const weaknesses = typeData.damage_relations.double_damage_from.map(w => w.name);

        const weaknessesContainer = document.getElementById("pokemonWeaknesses");
        weaknessesContainer.innerHTML = "";
        weaknesses.forEach(weakness => {
            const badge = document.createElement("span");
            badge.textContent = weakness;
            badge.className = "px-3 py-1 rounded-full text-white text-sm font-semibold";
            badge.style.backgroundColor = getTypeColor(weakness); // Match Type Colors
            weaknessesContainer.appendChild(badge);
        });

    } catch (error) {
        console.error("Error fetching weaknesses:", error);
        document.getElementById("pokemonWeaknesses").textContent = "Not Available";
    }
}


// Helper function for type colors
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

// Load Pokémon from URL
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pokemonName = urlParams.get("name");
    if (pokemonName) displayPokemonDetails(pokemonName);
});
