# spinnergame

Trang web quay số 20 ô giải thưởng cho sự kiện (vòng quay quà tặng).

## Công nghệ

- Node.js, Express
- MongoDB (Mongoose)
- Frontend: HTML, CSS, JavaScript

## Cài đặt

```bash
npm install
```

Tạo file `.env` với biến môi trường (ví dụ `MONGODB_URI`, `SESSION_SECRET`, `PORT`).

## Chạy

```bash
npm start
```

Mở trình duyệt tại `http://localhost:3000`.

## Tính năng

- Quay số 20 ô giải thưởng (thẻ cào, thêm lượt quay)
- Trang admin `/taoma`: tạo mã quay, thẻ cào, thêm user (chỉ user do admin thêm mới được quay)
- Thông báo trúng thưởng chạy ngang (ticker)
- Lịch sử nhận thưởng theo tài khoản
