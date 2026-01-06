const mongoose = require('mongoose');

const AdminAISchema = new mongoose.Schema({
    numbers: { type: [Number], required: true }, // Array of 25 numbers
    series: { type: String, required: true },
    line: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdminAI', AdminAISchema);
