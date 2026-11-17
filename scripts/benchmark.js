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

// ── Test queries ────────────────────────────────────────────────

const QUERIES = [
    {
        name: "1. intent + status (compound index)",
        filter: { intent: "lost", status: "active" }
    },
    {
        name: "2. Full-text search on title/description",
        filter: { $text: { $search: "téléphone perdu" } }
    },
    {
        name: "3. Geo bounding box (lat/lng)",
        filter: {
            lat: { $gte: 36.804, $lte: 36.808 },
            lng: { $gte: 10.179, $lte: 10.183 }
        }
    },
    {
        name: "4. Combined: intent + status + category + date",
        filter: {
            intent: "found",
            status: "active",
            category: "clés",
            start: { $lte: new Date() }
        }
    },
    {
        name: "5. Sort by created_at (index {created_at: -1})",
        filter: { status: "active" },
        sort: { created_at: -1 },
        limit: 20
    }
];

// ── Helpers ─────────────────────────────────────────────────────

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
        stage: exec.executionStages?.stage
            || exec.winningPlan?.stage
            || "N/A"
    };
}

// ── Main ────────────────────────────────────────────────────────

async function benchmark() {
    await mongoose.connect(process.env.MONGO_URI);

    const count = await Post.countDocuments();
    console.log(`\n📊  Benchmark on ${count} posts\n`);
    console.log("=".repeat(70));

    for (const q of QUERIES) {
        console.log(`\n▸ ${q.name}`);

        // Timing
        const ms = await runQuery(q);
        console.log(`  Time:  ${ms} ms`);

        // Explain
        try {
            const info = await explainQuery(q);
            console.log(`  Stage: ${info.stage}`);
            console.log(`  Docs examined:  ${info.totalDocsExamined}`);
            console.log(`  Keys examined:  ${info.totalKeysExamined}`);
            console.log(`  Execution time: ${info.executionTimeMs} ms`);

            if (info.stage === "COLLSCAN") {
                console.log("  ⚠️  COLLSCAN detected — missing index!");
            } else {
                console.log("  ✅  Index used (IXSCAN or FETCH)");
            }
        } catch (err) {
            console.log(`  explain() error: ${err.message}`);
        }
    }

    console.log("\n" + "=".repeat(70));
    await mongoose.disconnect();
}

benchmark().catch((err) => {
    console.error("Benchmark failed:", err);
    process.exit(1);
});
