const mongoose = require('mongoose');

const PokemonSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: [String],
    hp: Number,
    attack: Number,
    sprite: String
});

module.exports = mongoose.model('Pokemon', PokemonSchema);
