// config/db.js
const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Kết nối MongoDB. Trả về { connected, error } để API có thể hiển thị lỗi thật.
 * Trên Vercel: cấu hình MONGODB_URI trong Environment Variables.
 * Nếu lỗi "connection timed out" / "ECONNREFUSED": vào MongoDB Atlas → Network Access → thêm 0.0.0.0/0 (cho phép mọi IP).
 */
const connectDB = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri || typeof uri !== 'string') {
        const msg = 'MONGODB_URI chưa được cấu hình (Vercel: Settings → Environment Variables).';
        console.error('Lỗi kết nối MongoDB:', msg);
        return { connected: false, error: msg };
    }
    try {
        await mongoose.connect(uri);
        console.log('MongoDB Atlas kết nối thành công!');
        return { connected: true };
    } catch (error) {
        console.error('Lỗi kết nối MongoDB:', error.message);
        if (!process.env.VERCEL) {
            process.exit(1);
        }
        return { connected: false, error: error.message };
    }
};

module.exports = connectDB;