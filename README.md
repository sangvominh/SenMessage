# SenMessage 💌

> _Tìm lại những khoảnh khắc ngọt ngào trong tin nhắn Facebook Messenger._

## ⚠️ Trạng thái dự án: Tạm đóng băng

Dự án hiện đã được **tạm dừng phát triển** vì một giới hạn kỹ thuật không thể giải quyết được:

**Facebook Messenger đã mã hóa đầu cuối (End-to-End Encryption / E2EE) các cuộc trò chuyện cá nhân.**

Điều này có nghĩa là:

- Tính năng "Download Your Information" (DYI) của Facebook **không thể xuất nội dung** các cuộc trò chuyện đã được bật E2EE.
- File export chỉ chứa metadata (tên, thời gian) mà **không có nội dung tin nhắn** — hoàn toàn không có dữ liệu text để phân tích.
- Đây là hạn chế từ phía Facebook nhằm bảo vệ quyền riêng tư người dùng, và SenMessage không có cách nào vượt qua được.
- Các cuộc trò chuyện mới trên Messenger mặc định đều bật E2EE, nên vấn đề này ảnh hưởng đến **phần lớn người dùng**.

Nếu trong tương lai Facebook cung cấp API hoặc cách export có hỗ trợ giải mã E2EE cho chính chủ tài khoản, dự án có thể được tiếp tục phát triển.

---

## Giới thiệu

SenMessage là ứng dụng web giúp phân tích "độ sến" (mức độ tình cảm, ngọt ngào) trong tin nhắn Facebook Messenger. Ứng dụng chạy hoàn toàn trên trình duyệt — dữ liệu tin nhắn không bao giờ rời khỏi máy của bạn.

### Tính năng chính

- 📁 **Upload file export** từ Facebook (JSON/HTML) hoặc chọn thư mục
- 📋 **Dán tin nhắn** trực tiếp — không cần export, chỉ cần copy-paste
- ⚡ **Chấm điểm sến tức thì** bằng từ điển tiếng Việt (150+ pattern, không cần internet)
- 🤖 **Phân tích sâu bằng AI** (Gemini, tùy chọn) — hiểu ngữ cảnh, tiếng lóng
- 🎚️ **Bộ lọc mức sến** 0–5: từ "bình thường" đến "sến đỉnh cao"
- 🔍 **Tìm kiếm** tin nhắn theo từ khóa
- 💬 **Hiển thị tin nhắn** dạng chat bubble, cuộn mượt dù 100K+ tin nhắn
- 🔒 **Bảo mật**: Mọi xử lý trên trình duyệt, không có server backend

### Công nghệ

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS v4
- **Lưu trữ**: IndexedDB (Dexie.js) — dữ liệu nằm trên máy người dùng
- **Chấm điểm**: Từ điển regex tiếng Việt (mặc định) + Gemini 2.0 Flash-Lite API (tùy chọn)
- **Hiển thị**: react-virtuoso (virtualized rendering)

## Cách chạy

```bash
# Cài đặt
npm install

# Chạy dev server
npm run dev
# → http://localhost:5173

# Build production
npm run build
```

## Cách sử dụng

1. Mở ứng dụng → nhấn **Bắt đầu**
2. Chọn **📋 Dán tin nhắn** (nhanh) hoặc **📁 File/Thư mục** (đầy đủ)
3. Kết quả chấm điểm sến hiện **ngay lập tức**
4. Kéo thanh slider để lọc theo mức sến (0–5)
5. _(Tùy chọn)_ Vào ⚙️ Cài đặt → nhập Gemini API key → nhấn "Phân tích sâu hơn bằng AI"

## Thang điểm sến

| Mức | Ý nghĩa      | Ví dụ                                  |
| --- | ------------ | -------------------------------------- |
| 0   | Bình thường  | "ok", "ừ", "mai đi ăn"                 |
| 1   | Hơi sến nhẹ  | "về chưa?", "nhớ ăn cơm nha"           |
| 2   | Sến vừa      | "ngủ ngon nha", "nhớ em/anh"           |
| 3   | Sến rõ       | "yêu em", "bé yêu ơi"                  |
| 4   | Rất sến      | "nhớ em quá đi", "muốn ôm em"          |
| 5   | Sến đỉnh cao | "yêu em nhiều lắm, không thể thiếu em" |

## Cấu trúc dự án

```
src/
├── components/         # React components
│   ├── chat/           # ChatBubble, ChatList, ChatViewer, ...
│   ├── common/         # Layout, ErrorBoundary, ApiKeyInput, ...
│   ├── conversation/   # ConversationPicker, ConversationSummary
│   ├── filter/         # SweetnessSlider, SearchBar, FilterStatus
│   └── upload/         # OnboardingScreen, UploadArea
├── hooks/              # React hooks (useFileUpload, useLocalScoring, ...)
├── i18n/               # Tiếng Việt string constants
├── models/             # TypeScript types & interfaces
├── services/
│   ├── ai/             # Gemini service, rate limiter, batch manager
│   ├── parser/         # JSON parser, HTML parser, paste parser
│   ├── scoring/        # Local Vietnamese sweetness scorer
│   └── storage/        # Dexie.js IndexedDB wrapper
└── utils/              # Decode utilities, message filter
```

## Tác giả

Dự án được phát triển bởi [@sangvominh](https://github.com/sangvominh).

## Giấy phép

MIT
