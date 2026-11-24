/**
 * benchmark.js — Measure query performance before and after indexes.
 *
 * Usage:  node scripts/benchmark.js
 *
 * Requires MONGO_URI in .env and a seeded collection (run seed.js first).
 * Shows execution times + explain('executionStats') to prove IXSCAN.
 */

import "dotenv/config";
import mongoose from "mongoose";
import Post from "../src/models/post.js";
import Category from "../src/models/category.js";
import Place from "../src/models/place.js";

async function runQuery(q) {
    let cursor = Post.find(q.filter);

    if (q.sort) cursor = cursor.sort(q.sort);
    if (q.limit) cursor = cursor.limit(q.limit);

    const start = performance.now();
    await cursor.lean();
    const ms = (performance.now() - start).toFixed(2);

    return ms;
}

async function explainQuery(q) {
    let cursor = Post.find(q.filter);

    if (q.sort) cursor = cursor.sort(q.sort);
    if (q.limit) cursor = cursor.limit(q.limit);

    const stats = await cursor.explain("executionStats");
    const exec = stats.executionStats || stats;

    return {
        executionTimeMs: exec.executionTimeMillis,
        totalDocsExamined: exec.totalDocsExamined,
        totalKeysExamined: exec.totalKeysExamined,
        stage:
            exec.executionStages?.stage ||
            exec.winningPlan?.stage ||
            "N/A"
    };
}

async function benchmark() {
    await mongoose.connect(process.env.MONGO_URI);

    const count = await Post.countDocuments();
    console.log(`\n📊  Benchmark sur ${count} déclarations (Post)\n`);
    console.log("=".repeat(70));

    const sampleCategory = await Category.findOne().select("_id").lean();
    const samplePlace = await Place.findOne().select("_id").lean();

    const QUERIES = [
        {
            name: "1. Intent + Status + isHidden (Compound Index)",
            filter: { intent: "lost", status: "active", isHidden: false }
        },
        {
            name: "2. Full-text search (Index textuel sur title & description)",
            filter: { $text: { $search: "téléphone noir" } }
        },
        {
            name: "3. Filtrage par Place (Index { place: 1 })",
            filter: { place: samplePlace?._id }
        },
        {
            name: "4. Index combiné : Intent + Status + Category + Date",
            filter: {
                intent: "found",
                status: "active",
                isHidden: false,
                ...(sampleCategory ? { category: sampleCategory._id } : {}),
                start: { $lte: new Date() }
            }
        },
        {
            name: "5. Tri par createdAt (Index { user: 1, createdAt: -1 } / scan)",
            filter: { status: "active" },
            sort: { createdAt: -1 },
            limit: 20
        }
    ];

    for (const q of QUERIES) {
        console.log(`\n▸ ${q.name}`);

        // Timing
        const ms = await runQuery(q);
        console.log(`  Temps d'exécution : ${ms} ms`);

        // Explain
        try {
            const info = await explainQuery(q);
            console.log(`  Étape (Stage)    : ${info.stage}`);
            console.log(`  Docs examinés    : ${info.totalDocsExamined}`);
            console.log(`  Clés examinées   : ${info.totalKeysExamined}`);
            console.log(`  Durée Mongo      : ${info.executionTimeMs} ms`);

            if (info.stage === "COLLSCAN") {
                console.log("  ⚠️  COLLSCAN détecté — index manquant !");
            } else {
                console.log("  ✅  Index utilisé (IXSCAN / TEXT / FETCH)");
            }
        } catch (err) {
            console.log(`  explain() erreur : ${err.message}`);
        }
    }

    console.log("\n" + "=".repeat(70));
    await mongoose.disconnect();
}

benchmark().catch((err) => {
    console.error("Benchmark failed:", err);
    process.exit(1);
});
