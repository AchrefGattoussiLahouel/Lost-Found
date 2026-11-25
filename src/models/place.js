import mongoose from "mongoose";

const placeSchema= new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true, maxlength: 100 },
    zone: { type: String, trim: true, maxlength: 100 },   // ex. "Niveau -1", "Food court"
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    isActive: { type: Boolean, default: true },
    },
    { timestamps: true, versionKey: false },
)

export default mongoose.model("Place", placeSchema);