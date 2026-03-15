// models/UsedCode.js
const mongoose = require('mongoose');

const usedCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    usedAt: {
        type: Date,
        default: Date.now,
    },
    ip: String,          // optional: lưu IP để chống lạm dụng
});

module.exports = mongoose.model('UsedCode', usedCodeSchema);