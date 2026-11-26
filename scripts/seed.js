/**
 * seed.js — Populate the posts collection with realistic test data.
 *
 * Usage:  node scripts/seed.js [count]
 *   count = 20 | 500 | 10000 | 100000   (default 500)
 *
 * Requires MONGO_URI in .env or environment.
 */

import "dotenv/config";
import mongoose from "mongoose";
import Post from "../src/models/post.js";
import Category from "../src/models/category.js";
import Place from "../src/models/place.js";
import User from "../src/models/user.js";
import { POST_STATUS, INTENTS } from "../src/constants/post.js";

// ── Default catalog data if empty ───────────────────────────────

const DEFAULT_CATEGORIES = [
    "Sac", "Téléphone", "Clés", "Portefeuille", "Vêtement", "Bijou",
    "Lunettes", "Montre", "Écouteurs", "Ordinateur", "Autre"
];

const DEFAULT_PLACES = [
    { name: "Parking niveau -1", zone: "Parking", lat: 36.8055, lng: 10.1825 },
    { name: "Parking niveau -2", zone: "Parking", lat: 36.8050, lng: 10.1820 },
    { name: "Food court", zone: "Restauration", lat: 36.8070, lng: 10.1820 },
    { name: "Accueil", zone: "Rez-de-chaussée", lat: 36.8068, lng: 10.1808 },
    { name: "Entrée nord", zone: "Rez-de-chaussée", lat: 36.8075, lng: 10.1835 },
    { name: "Entrée sud", zone: "Rez-de-chaussée", lat: 36.8060, lng: 10.1810 },
    { name: "Cinéma", zone: "Étage 2", lat: 36.8072, lng: 10.1830 },
    { name: "Bibliothèque", zone: "Étage 1", lat: 36.8065, lng: 10.1815 }
];

const TITLES_LOST = [
    "Téléphone noir perdu", "Clés de maison perdues", "Portefeuille en cuir égaré",
    "Sac à dos oublié", "Lunettes de soleil perdues", "Montre connectée perdue",
    "Carte étudiante perdue", "Écouteurs sans fil perdus"
];

const TITLES_FOUND = [
    "Téléphone noir trouvé", "Trousseau de clés trouvé", "Portefeuille marron trouvé",
    "Sac à dos noir trouvé", "Lunettes trouvées", "Montre trouvée",
    "Carte d'identité trouvée", "Boîtier d'écouteurs trouvé"
];

const STATUSES = [
    POST_STATUS.ACTIVE,
    POST_STATUS.ACTIVE,
    POST_STATUS.ACTIVE,
    POST_STATUS.MATCHED,
    POST_STATUS.CLOSED
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomDate = (daysBack = 60) => {
    const now = Date.now();
    return new Date(now - Math.random() * daysBack * 86_400_000);
};

// ── Main ────────────────────────────────────────────────────────

const COUNT = parseInt(process.argv[2], 10) || 500;
const BATCH = 5000;

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to MongoDB. Preparing catalog & dependencies…`);

    // Ensure Categories exist
    for (const name of DEFAULT_CATEGORIES) {
        await Category.updateOne(
            { name },
            { $setOnInsert: { name, isActive: true } },
            { upsert: true }
        );
    }
    const categories = await Category.find().select("_id name").lean();

    // Ensure Places exist
    for (const p of DEFAULT_PLACES) {
        await Place.updateOne(
            { name: p.name },
            { $setOnInsert: { ...p, isActive: true } },
            { upsert: true }
        );
    }
    const places = await Place.find().select("_id name zone lat lng").lean();

    // Ensure at least one system user exists for createdBy
    let user = await User.findOne().select("_id").lean();
    if (!user) {
        user = await User.create({
            firstName: "Système",
            lastName: "Test",
            email: "system@lostfound.local",
            password: "Password123!",
            role: "membre",
            status: "active"
        });
    }

    console.log(`Seeding ${COUNT} posts…`);

    // Drop existing posts
    await Post.deleteMany({});

    function generatePost() {
        const intent = Math.random() < 0.5 ? INTENTS.LOST : INTENTS.FOUND;
        const place = pick(places);
        const cat = pick(categories);
        const start = randomDate();
        const end = new Date(start.getTime() + Math.random() * 5 * 86_400_000);

        return {
            intent,
            title: pick(intent === INTENTS.LOST ? TITLES_LOST : TITLES_FOUND),
            description: `Objet ${intent === INTENTS.LOST ? "perdu" : "trouvé"} à proximité de ${place.name}.`,
            category: cat._id,
            place: place._id,
            placeDetails: "Près de l'entrée principale",
            start,
            end,
            status: pick(STATUSES),
            isHidden: false,
            createdBy: user._id,
            user: user._id
        };
    }

    let inserted = 0;

    while (inserted < COUNT) {
        const size = Math.min(BATCH, COUNT - inserted);
        const batch = Array.from({ length: size }, generatePost);
        await Post.insertMany(batch, { ordered: false });
        inserted += size;
        process.stdout.write(`  ${inserted} / ${COUNT}\r`);
    }

    console.log(`\n✅  ${COUNT} posts inserted successfully.`);
    await mongoose.disconnect();
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
