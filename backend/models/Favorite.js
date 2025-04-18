const mongoose = require("mongoose");

const FavoriteSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    hp: { type: Number, required: true },
    attack: { type: Number, required: true },
    type: { type: String, required: true }
});

module.exports = mongoose.model("Favorite", FavoriteSchema);
