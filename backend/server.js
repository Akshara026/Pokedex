require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const Favorite = require("./models/Favorite");

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB Connection Error:", err));


app.post("/add-favorite", async (req, res) => {
    try {
        const { id, name, hp, attack, type } = req.body;
        console.log(id, name, hp, attack,type);
        if (!id || !name) return res.status(400).json({ message: "ID and Name are required" });


        const updatedFavorite = await Favorite.findOneAndUpdate(
            { id }, // Search by ID
            { name, hp, attack, type },
            { upsert: true, new: true } 
        );

        res.status(201).json({ message: "Pokémon added or updated!", updatedFavorite });

    } catch (error) {
        console.error(" Error adding favorite:", error);
        res.status(500).json({ error: "Failed to add favorite" });
    }
});

// read
app.get("/favorites", async (req, res) => {
    try {
        const favorites = await Favorite.find();
        res.json(favorites);
    } catch (error) {
        console.error("Error fetching favorites:", error);
        res.status(500).json({ error: "Failed to fetch favorites" });
    }
});

// upadte
app.put("/update-favorite/:id", async (req, res) => {
    try {
        const { name, hp, attack, type } = req.body;
        const updatedPokemon = await Favorite.findOneAndUpdate(
            { id: req.params.id }, 
            { name, hp, attack, type }, // update fields
            { new: true } // retrn updated 
        );

        if (!updatedPokemon) return res.status(404).json({ message: "Pokémon not found" });

        res.json({ message: "Pokémon updated!", updatedPokemon });

    } catch (error) {
        console.error("Error updating favorite:", error);
        res.status(500).json({ error: "Update failed" });
    }
});

// delete
app.delete("/delete-favorite/:id", async (req, res) => {
    try {
        const deleted = await Favorite.findOneAndDelete({ id: req.params.id });
        if (!deleted) return res.status(404).json({ message: "Pokémon not found" });

        res.json({ message: "Pokémon removed from favorites" });

    } catch (error) {
        console.error("Error deleting favorite:", error);
        res.status(500).json({ error: "delete failed" });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
