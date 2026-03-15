// config/db.js
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    const uri = process.env.MONGODB_URI || "mongodb+srv://laongogia76_db_user:PwS6Bw7n8B1TEZ2X@cluster0.9ugi4ot.mongodb.net/spin_game?retryWrites=true&w=majority";
    if (!uri || typeof uri !== 'string') {
        console.error('Lỗi kết nối MongoDB: MONGODB_URI chưa được cấu hình. Trên Vercel: Project → Settings → Environment Variables → thêm MONGODB_URI.');
        return;
    }
    try {
        await mongoose.connect(uri);
        console.log('MongoDB Atlas kết nối thành công!');
    } catch (error) {
        console.error('Lỗi kết nối MongoDB:', error.message);
        if (!process.env.VERCEL) {
            process.exit(1);
        }
    }
};

module.exports = connectDB;