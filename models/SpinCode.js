const mongoose = require('mongoose');

const spinCodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    used: { type: Boolean, default: false },
    usedAt: Date,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SpinCode', spinCodeSchema);