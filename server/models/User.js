const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    interests: [{ type: String }], // e.g., ["Web Development", "AI"]
    skills: [{ type: String }] // e.g., ["JavaScript", "Python"]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);