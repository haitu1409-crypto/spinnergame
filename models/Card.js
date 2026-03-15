const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    prizeLabel: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    serial: { type: String, required: true, unique: true },
    used: { type: Boolean, default: false },
    usedAt: Date,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Card', cardSchema);