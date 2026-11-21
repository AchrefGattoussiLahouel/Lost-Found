import "dotenv/config";
import mongoose from "mongoose";
import Category from "../models/category.js";
import Place from "../models/place.js";

const categories = [
  "Sac",
  "Téléphone",
  "Clés",
  "Portefeuille",
  "Vêtement",
  "Bijou",
  "Autre",
];
const places = [
  { name: "Parking niveau -1", zone: "Parking" },
  { name: "Parking niveau -2", zone: "Parking" },
  { name: "Food court", zone: "Restauration" },
  { name: "Accueil", zone: "Rez-de-chaussée" },
  { name: "Entrée nord", zone: "Rez-de-chaussée" },
  { name: "Entrée sud", zone: "Rez-de-chaussée" },
  { name: "Cinéma", zone: "Étage 2" },
  { name: "Toilettes étage 1", zone: "Étage 1" },
];

await mongoose.connect(process.env.MONGO_URI);

for (const name of categories) {
  await Category.updateOne(
    { name },
    { $setOnInsert: { name, isActive: true } },
    { upsert: true },
  );
}
for (const p of places) {
  await Place.updateOne(
    { name: p.name },
    { $setOnInsert: { ...p, isActive: true } },
    { upsert: true },
  );
}

console.log(
  `Catalogue prêt : ${categories.length} catégories, ${places.length} lieux`,
);
await mongoose.disconnect();
