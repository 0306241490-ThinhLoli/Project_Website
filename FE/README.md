# Frontend - Web Ghi Chú

## Lệnh sử dụng

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Cấu trúc chính

- `src/App.jsx`: Router, Layout và Bottom Navigation.
- `src/AppContext.jsx`: Provider tải profile toàn cục.
- `src/AppState.js`: Context object.
- `src/Notes.jsx`: Main, List, CRUD, tìm kiếm, lọc và phân trang.
- `src/PrivateNotes.jsx`: xác thực và CRUD ghi chú riêng tư.
- `src/Settings.jsx`: profile, theme, màu chủ đạo, mật khẩu.
- `src/App.css`: toàn bộ style responsive theo thiết kế.

Frontend gọi API tại `http://localhost:5000`; cần chạy Backend trong thư mục `../BE`.
