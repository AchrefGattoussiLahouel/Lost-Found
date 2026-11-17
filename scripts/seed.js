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

// ── Realistic seed data ─────────────────────────────────────────

const CATEGORIES = [
    "téléphone", "clés", "portefeuille", "sac", "carte d'identité",
    "lunettes", "montre", "bijoux", "vêtement", "écouteurs",
    "ordinateur", "tablette", "parapluie", "livre", "autre"
];

const LOCATIONS = [
    { name: "Bibliothèque",    lat: 36.8065, lng: 10.1815 },
    { name: "Cafétéria",       lat: 36.8070, lng: 10.1820 },
    { name: "Amphithéâtre A",  lat: 36.8060, lng: 10.1810 },
    { name: "Parking",         lat: 36.8055, lng: 10.1825 },
    { name: "Hall principal",  lat: 36.8068, lng: 10.1808 },
    { name: "Laboratoire",     lat: 36.8072, lng: 10.1830 },
    { name: "Salle de sport",  lat: 36.8050, lng: 10.1800 },
    { name: "Entrée campus",   lat: 36.8075, lng: 10.1835 }
];

const TITLES_LOST = [
    "Téléphone perdu", "Clés perdues", "Portefeuille égaré",
    "Sac oublié", "Lunettes perdues", "Montre perdue",
    "Carte étudiante perdue", "Écouteurs perdus"
];

const TITLES_FOUND = [
    "Téléphone trouvé", "Clés trouvées", "Portefeuille trouvé",
    "Sac trouvé", "Lunettes trouvées", "Montre trouvée",
    "Carte étudiante trouvée", "Écouteurs trouvés"
];

const STATUSES = ["active", "active", "active", "active", "resolved", "expired"];

// ── Helpers ─────────────────────────────────────────────────────

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomDate = (daysBack = 90) => {
    const now = Date.now();
    return new Date(now - Math.random() * daysBack * 86_400_000);
};

const fakeObjectId = () => new mongoose.Types.ObjectId();

function generatePost() {
    const intent = Math.random() < 0.5 ? "lost" : "found";
    const loc = pick(LOCATIONS);
    const start = randomDate();
    const end = new Date(start.getTime() + Math.random() * 7 * 86_400_000);

    return {
        intent,
        category: pick(CATEGORIES),
        title: pick(intent === "lost" ? TITLES_LOST : TITLES_FOUND),
        description: `Objet ${intent === "lost" ? "perdu" : "trouvé"} près de ${loc.name}.`,
        lat: loc.lat + (Math.random() - 0.5) * 0.005,
        lng: loc.lng + (Math.random() - 0.5) * 0.005,
        start,
        end,
        secret_detail: "Détail secret de preuve de propriété.",
        status: pick(STATUSES),
        user: fakeObjectId()
    };
}

// ── Main ────────────────────────────────────────────────────────

const COUNT = parseInt(process.argv[2], 10) || 500;
const BATCH = 5000;

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected. Seeding ${COUNT} posts…`);

    // Drop existing posts
    await Post.deleteMany({});

    let inserted = 0;

    while (inserted < COUNT) {
        const size = Math.min(BATCH, COUNT - inserted);
        const batch = Array.from({ length: size }, generatePost);
        await Post.insertMany(batch, { ordered: false });
        inserted += size;
        process.stdout.write(`  ${inserted} / ${COUNT}\r`);
    }

    console.log(`\n✅  ${COUNT} posts inserted.`);
    await mongoose.disconnect();
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});

