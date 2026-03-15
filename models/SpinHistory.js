const mongoose = require('mongoose');

const spinHistorySchema = new mongoose.Schema({
    username: { type: String, required: true, index: true },
    spinCode: { type: String, required: true },
    prizeLabel: { type: String },
    isClaimed: { type: Boolean, default: false },
    cardCode: String,
    serial: String,
    bonusCodes: [{ type: String }], // mã quay cấp khi trúng "Thêm lượt quay"
    spunAt: { type: Date, default: Date.now },
    claimedAt: Date
});

module.exports = mongoose.model('SpinHistory', spinHistorySchema);