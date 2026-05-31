const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructor: { type: String, required: true },
    category: { type: String, required: true },
    tags: [{ type: String }] // e.g., ["React", "Frontend", "JavaScript"]
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);