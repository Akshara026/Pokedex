const express = require('express');
const router = express.Router();
const Pokemon = require('../models/Pokemon');

// Get all favorite Pokémon
router.get('/', async (req, res) => {
    const favorites = await Pokemon.find();
    res.json(favorites);
});

// Add a Pokémon to favorites
router.post('/add', async (req, res) => {
    const { name, type, hp, attack, defense, image } = req.body;
    const newPokemon = new Pokemon({ name, type, hp, attack, defense, image });
    await newPokemon.save();
    res.json({ message: "Pokemon added to favorites!" });
});

// Delete a Pokémon from favorites
router.delete('/remove/:id', async (req, res) => {
    await Pokemon.findByIdAndDelete(req.params.id);
    res.json({ message: "Pokemon removed from favorites!" });
});

module.exports = router;
