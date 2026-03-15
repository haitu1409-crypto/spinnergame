// models/ClaimedCard.js
const mongoose = require('mongoose');

const claimedCardSchema = new mongoose.Schema({
    prizeLabel: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    serial: {
        type: String,
        required: true,
    },
    claimedByCode: String,   // mã code quay số dùng để claim
    claimedAt: {
        type: Date,
        default: Date.now,
    },
    ip: String,
});

module.exports = mongoose.model('ClaimedCard', claimedCardSchema);