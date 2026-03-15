require("dotenv").config();

const fs = require("fs");
const path = require("path");
const express = require("express");
const compression = require("compression");
const session = require("express-session");

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const SpinCode = require("./models/SpinCode");
const UsedCode = require("./models/UsedCode");
const Card = require("./models/Card");
const SpinHistory = require("./models/SpinHistory");
const ClaimedCard = require("./models/ClaimedCard");

// Kết nối MongoDB
connectDB();

const app = express();

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session (nếu sau này cần dùng để chống spam)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "event-lottery-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
  })
);

// Thư mục static (cấu trúc public/ giống dự án tham khảo front_end_dande)
const publicDirs = [
  path.join(__dirname, "public"),
  path.join(process.cwd(), "public"),
  process.cwd(),
];
const publicDir = publicDirs.find((d) => fs.existsSync(path.join(d, "index.html"))) || path.join(__dirname, "public");
app.use(express.static(publicDir, { maxAge: process.env.VERCEL ? "1d" : 0 }));

// Đợi kết nối DB trước khi xử lý API (trả lỗi thật nếu kết nối thất bại)
app.use("/api", async (req, res, next) => {
  if (req.path === "/health") return next();
  if (mongoose.connection.readyState === 1) return next();
  const result = await connectDB();
  if (!result.connected) {
    return res.status(503).json({
      success: false,
      message: "Database không kết nối được.",
      error: result.error || "Unknown error",
    });
  }
  next();
});

// === API HEALTH CHECK ===
app.get("/api/health", (req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

// === API: Kiểm tra user (chỉ cho phép tài khoản đã được admin thêm trong trang taoma) ===
app.post("/api/get-or-create-user", async (req, res) => {
  try {
    let { username } = req.body || {};
    if (!username || typeof username !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng nhập tên tài khoản" });
    }

    username = username.trim().toLowerCase();

    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Tên tài khoản phải từ 3 đến 30 ký tự",
      });
    }

    const user = await User.findOne({ username }).lean();
    if (!user) {
      console.log("get-or-create-user: tài khoản chưa có trong DB:", username);
      return res.status(400).json({
        success: false,
        message:
          "Tài khoản chưa đăng ký.",
      });
    }

    console.log("get-or-create-user: OK", username);
    res.json({ success: true, username: user.username });
  } catch (err) {
    console.error("Lỗi /api/get-or-create-user:", err);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi kiểm tra tài khoản" });
  }
});

// === API: Verify code & ghi lại lượt quay ===
app.post("/api/verify-code", async (req, res) => {
  try {
    let { code, username } = req.body || {};

    if (!username || typeof username !== "string") {
      return res
        .status(400)
        .json({ ok: false, message: "Thiếu tên tài khoản" });
    }

    if (!code || typeof code !== "string") {
      return res.status(400).json({ ok: false, message: "Thiếu mã quay" });
    }

    username = username.trim().toLowerCase();
    code = code.trim().toUpperCase();

    const now = new Date();
    const [user, updated] = await Promise.all([
      User.findOne({ username }).lean(),
      SpinCode.findOneAndUpdate(
        { code, used: false },
        { $set: { used: true, usedAt: now } },
        { new: true }
      ).lean(),
    ]);

    if (!user) {
      return res
        .status(400)
        .json({ ok: false, message: "Tài khoản không hợp lệ hoặc chưa đăng ký" });
    }
    if (!updated) {
      const exists = await SpinCode.findOne({ code }).select("used").lean();
      return res
        .status(400)
        .json({ ok: false, message: exists?.used ? "Mã đã được sử dụng" : "Mã không hợp lệ" });
    }

    await Promise.all([
      UsedCode.create({ code, ip: req.ip }).catch((e) => {
        if (e) console.warn("UsedCode:", e.message);
      }),
      SpinHistory.create({ username, spinCode: code, isClaimed: false }),
    ]);

    res.json({ ok: true });
  } catch (err) {
    console.error("Lỗi /api/verify-code:", err);
    res
      .status(500)
      .json({ ok: false, message: "Lỗi server khi xác thực mã" });
  }
});

// === API: Claim thẻ cào khi trúng ===
app.post("/api/claim-card", async (req, res) => {
  try {
    let { prizeLabel, username } = req.body || {};

    if (!username || typeof username !== "string") {
      return res
        .status(400)
        .json({ message: "Thiếu tên tài khoản" });
    }

    if (!prizeLabel || typeof prizeLabel !== "string") {
      return res
        .status(400)
        .json({ message: "Thiếu loại giải thưởng" });
    }

    username = username.trim().toLowerCase();
    prizeLabel = prizeLabel.trim();

    const now = new Date();
    const [card, history] = await Promise.all([
      Card.findOneAndUpdate(
        { prizeLabel, used: false },
        { $set: { used: true, usedAt: now } },
        { new: true }
      ).lean(),
      SpinHistory.findOne({
        username,
        isClaimed: false,
        $nor: [{ prizeLabel: { $regex: /^Thêm lượt quay/ } }],
      }).sort({ spunAt: -1 }).lean(),
    ]);

    if (!card) {
      return res.status(400).json({
        message: "Hiện tại đã hết thẻ cào cho giải thưởng này, vui lòng liên hệ hỗ trợ",
      });
    }
    if (!history) {
      await Card.updateOne(
        { _id: card._id },
        { $set: { used: false, usedAt: null } }
      ).catch(() => { });
      return res.status(400).json({
        message:
          "Không tìm thấy lượt quay hợp lệ để nhận thưởng. Vui lòng quay lại hoặc liên hệ hỗ trợ.",
      });
    }

    await Promise.all([
      SpinHistory.updateOne(
        { _id: history._id },
        {
          $set: {
            prizeLabel,
            isClaimed: true,
            cardCode: card.code,
            serial: card.serial,
            claimedAt: now,
          },
        }
      ),
      ClaimedCard.create({
        prizeLabel,
        code: card.code,
        serial: card.serial,
        claimedByCode: history.spinCode,
        ip: req.ip,
      }).catch((e) => {
        if (e) console.warn("ClaimedCard:", e.message);
      }),
    ]);

    res.json({
      code: card.code,
      serial: card.serial,
    });
  } catch (err) {
    console.error("Lỗi /api/claim-card:", err);
    res
      .status(500)
      .json({ message: "Không thể nhận thưởng, vui lòng thử lại sau" });
  }
});

// === API: Ghi nhận trúng bonus (Thêm lượt quay) và cấp mã cho user ===
app.post("/api/record-bonus-win", async (req, res) => {
  try {
    let { username, prizeLabel } = req.body || {};

    if (!username || typeof username !== "string") {
      return res.status(400).json({ success: false, message: "Thiếu tên tài khoản" });
    }

    username = username.trim().toLowerCase();

    let count = 0;
    if (prizeLabel === "Thêm lượt quay x1") count = 1;
    else if (prizeLabel === "Thêm lượt quay x2") count = 2;
    else if (prizeLabel === "Thêm lượt quay x5") count = 5;

    if (count <= 0) {
      return res.status(400).json({ success: false, message: "Giải thưởng không hợp lệ" });
    }

    const user = await User.findOne({ username }).lean();
    if (!user) {
      return res.status(400).json({ success: false, message: "Tài khoản không tồn tại" });
    }

    const bonusCodes = [];
    const seen = new Set();
    for (let i = 0; i < count; i++) {
      for (let r = 0; r < 50; r++) {
        const randomPart = Math.floor(100000 + Math.random() * 900000);
        const c = `CODE${randomPart}`;
        if (seen.has(c)) continue;
        seen.add(c);
        bonusCodes.push(c);
        break;
      }
    }

    let insertedCodes = [];
    if (bonusCodes.length > 0) {
      const toInsert = bonusCodes.map((code) => ({ code, used: false }));
      try {
        const result = await SpinCode.insertMany(toInsert, { ordered: false });
        insertedCodes = bonusCodes;
      } catch (e) {
        if (e.result?.insertedIds && typeof e.result.insertedIds === "object") {
          insertedCodes = Object.keys(e.result.insertedIds)
            .sort((a, b) => Number(a) - Number(b))
            .map((idx) => toInsert[Number(idx)].code);
        }
        if (e.writeErrors) {
          for (const w of e.writeErrors) {
            if (w.code !== 11000) throw e;
          }
        } else throw e;
      }
    }

    await SpinHistory.create({
      username,
      spinCode: insertedCodes[0] || "BONUS",
      prizeLabel,
      isClaimed: false,
      bonusCodes: insertedCodes,
    });

    res.json({ success: true, bonusCodes: insertedCodes });
  } catch (err) {
    console.error("Lỗi /api/record-bonus-win:", err);
    res.status(500).json({ success: false, message: "Lỗi ghi nhận bonus" });
  }
});

// === API: Lịch sử nhận thưởng theo username ===
app.post("/api/history", async (req, res) => {
  try {
    let { username } = req.body || {};

    if (!username || typeof username !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng nhập tên tài khoản" });
    }

    username = username.trim().toLowerCase();

    const history = await SpinHistory.find({ username })
      .sort({ spunAt: -1 })
      .lean();

    const allCodes = [];
    for (const h of history) {
      if (h.bonusCodes?.length) {
        for (const raw of h.bonusCodes) {
          const c = String(raw || "").trim().toUpperCase();
          if (c) allCodes.push(c);
        }
      }
    }
    const usedSet = new Set();
    if (allCodes.length > 0) {
      const usedDocs = await SpinCode.find({ code: { $in: allCodes } })
        .select("code used")
        .lean();
      for (const d of usedDocs) {
        if (d.used) usedSet.add(String(d.code).toUpperCase());
      }
    }

    const historyWithUsed = history.map((h) => {
      const item = { ...h };
      if (item.bonusCodes?.length) {
        item.bonusCodesWithStatus = item.bonusCodes.map((rawCode) => {
          const codeNorm = String(rawCode || "").trim().toUpperCase();
          return { code: codeNorm || rawCode, used: usedSet.has(codeNorm) };
        });
      }
      return item;
    });

    res.json({
      success: true,
      history: historyWithUsed,
    });
  } catch (err) {
    console.error("Lỗi /api/history:", err);
    res
      .status(500)
      .json({ success: false, message: "Lỗi tải lịch sử" });
  }
});

// Trang chính vòng quay
app.get("/", (req, res) => {
  const idx = path.join(publicDir, "index.html");
  if (fs.existsSync(idx)) return res.sendFile(idx);
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ======================== TRANG ADMIN /taoma (tạo mã, thẻ cào, user) ========================
app.get("/taoma", (req, res) => {
  // xử lý logout nhanh
  if (req.query.logout === "1") {
    req.session.destroy(() => {
      res.redirect("/taoma");
    });
    return;
  }

  // Đã đăng nhập admin
  if (req.session.isAdmin) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <title>Admin - Tạo Mã</title>
        <style>
          body{font-family:Arial,system-ui;margin:20px;background:#0f172a;color:#e5e7eb;}
          h1,h2{color:#facc15;}
          input,button,select{margin:5px;padding:8px;}
          a{color:#60a5fa;}
        </style>
      </head>
      <body>
        <h1>🔑 Trang Quản Trị</h1>
        <p><a href="/taoma?logout=1">Đăng xuất</a></p>
        <hr>

        <h2>Tạo mã quay số (Spin Code)</h2>
        <form action="/api/generate-spin-codes" method="POST">
          Số lượng mã cần tạo: <input type="number" name="quantity" value="10" min="1" required><br>
          <button type="submit">Tạo ngay</button>
        </form>

        <hr>
        <h2>Tạo thẻ cào mới</h2>
        <form action="/api/generate-card" method="POST">
          Mệnh giá (label):
          <select name="prizeLabel" required>
            <option value="Thẻ cào 10.000đ">Thẻ cào 10.000đ</option>
            <option value="Thẻ cào 20.000đ">Thẻ cào 20.000đ</option>
            <option value="Thẻ cào 50.000đ">Thẻ cào 50.000đ</option>
            <option value="Thẻ cào 100.000đ">Thẻ cào 100.000đ</option>
            <option value="Thẻ cào 200.000đ">Thẻ cào 200.000đ</option>
          </select><br>
          Mã thẻ: <input type="text" name="code" placeholder="MA10K_ABC123" required><br>
          Số seri: <input type="text" name="serial" placeholder="SERI123456" required><br>
          <button type="submit">Thêm thẻ cào</button>
        </form>

        <hr>
        <h2>Thêm user 188lux thủ công</h2>
        <form action="/api/add-user" method="POST">
          Tên tài khoản: <input type="text" name="username" placeholder="gia123" required><br>
          <button type="submit">Thêm user</button>
        </form>

        <hr>
        <p><strong>Lưu ý:</strong> Mã quay & thẻ cào được lưu trong MongoDB. Hãy bảo mật trang này.</p>
        <p><a href="/">← Về trang quay số</a></p>
      </body>
      </html>
    `);
  }

  // Chưa login → hiện form mật khẩu admin
  res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>Đăng nhập Admin</title>
    </head>
    <body>
      <h2>Nhập mật khẩu để vào trang quản trị</h2>
      <form method="POST" action="/admin-login">
        <input type="password" name="password" placeholder="Mật khẩu" required>
        <button type="submit">Đăng nhập</button>
      </form>
      <p><a href="/">← Về trang quay số</a></p>
    </body>
    </html>
  `);
});

app.post("/admin-login", (req, res) => {
  if (req.body.password === "141920") {
    req.session.isAdmin = true;
    return res.redirect("/taoma");
  }
  res.send("Sai mật khẩu! <a href='/taoma'>Thử lại</a>");
});

// ======================== API ADMIN: TẠO MÃ & THẺ CÀO & USER ========================
app.post("/api/generate-spin-codes", async (req, res) => {
  if (!req.session.isAdmin) return res.status(403).send("Không có quyền");

  const qty = parseInt(req.body.quantity, 10) || 10;
  const created = [];

  for (let i = 0; i < qty; i++) {
    let newCode;
    let retries = 0;
    const maxRetries = 50;
    while (retries < maxRetries) {
      const randomPart = Math.floor(100000 + Math.random() * 900000);
      newCode = `CODE${randomPart}`;
      const exists = await SpinCode.findOne({ code: newCode });
      if (!exists) break;
      retries++;
    }
    if (retries >= maxRetries) continue;
    try {
      await SpinCode.create({ code: newCode, used: false });
      created.push(newCode);
    } catch (e) {
      // trùng key (race) → thử mã khác
      i--;
    }
  }

  res.send(
    `Đã tạo ${created.length} mã quay số:<br>${created.join(
      "<br>"
    )}<br><a href="/taoma">Quay lại</a>`
  );
});

app.post("/api/generate-card", async (req, res) => {
  if (!req.session.isAdmin) return res.status(403).send("Không có quyền");

  const { prizeLabel, code, serial } = req.body || {};

  if (!prizeLabel || !code || !serial) {
    return res.status(400).send("Thiếu thông tin thẻ cào");
  }

  const codeTrim = String(code || "").trim();
  const serialTrim = String(serial || "").trim();
  if (!codeTrim || !serialTrim) {
    return res.status(400).send("Mã thẻ và số seri không được để trống!<br><a href='/taoma'>Quay lại</a>");
  }

  const existsCode = await Card.findOne({ code: codeTrim });
  const existsSerial = await Card.findOne({ serial: serialTrim });
  if (existsCode) {
    return res.status(400).send(`Mã thẻ "${codeTrim}" đã tồn tại!<br><a href="/taoma">Quay lại</a>`);
  }
  if (existsSerial) {
    return res.status(400).send(`Số seri "${serialTrim}" đã tồn tại!<br><a href="/taoma">Quay lại</a>`);
  }

  try {
    await Card.create({ prizeLabel, code: codeTrim, serial: serialTrim, used: false });
    res.send(
      `Thẻ cào ${prizeLabel} đã được thêm thành công!<br>Mã: ${codeTrim}<br>Seri: ${serialTrim}<br><a href="/taoma">Quay lại</a>`
    );
  } catch (err) {
    res.status(500).send("Lỗi: " + err.message);
  }
});

app.post("/api/add-user", async (req, res) => {
  if (!req.session.isAdmin) return res.status(403).send("Không có quyền");

  const { username } = req.body || {};

  if (!username || typeof username !== "string" || username.trim().length < 3) {
    return res.send(
      "Tên tài khoản không hợp lệ!<br><a href='/taoma'>Quay lại</a>"
    );
  }

  const cleanUsername = username.trim().toLowerCase();

  try {
    const existing = await User.findOne({ username: cleanUsername }).lean();
    if (existing) {
      return res.send(
        `User ${cleanUsername} đã tồn tại!<br><a href='/taoma'>Quay lại</a>`
      );
    }

    await User.create({ username: cleanUsername });
    res.send(
      `Đã thêm user: ${cleanUsername}<br><a href='/taoma'>Quay lại</a>`
    );
  } catch (err) {
    res
      .status(500)
      .send("Lỗi: " + err.message + "<br><a href='/taoma'>Quay lại</a>");
  }
});

const PORT = process.env.PORT || 3000;

// Trên Vercel: export app để serverless dùng; local: chạy listen
if (process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
  });
}