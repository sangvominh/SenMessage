// ============================================================
// Vietnamese i18n string constants
// All UI text for SenMessage
// ============================================================

export const vi = {
  // App branding
  appName: "SenMessage",
  appTagline: "Tìm lại những khoảnh khắc ngọt ngào",

  // Onboarding screen
  onboarding: {
    welcome: "Chào mừng bạn đến với SenMessage!",
    description:
      "SenMessage giúp bạn tìm lại những tin nhắn ngọt ngào nhất trong cuộc hội thoại Facebook Messenger của bạn.",
    howToExport: "Cách export tin nhắn từ Facebook:",
    step1: "Truy cập facebook.com/dyi",
    step2: 'Chọn "Yêu cầu tải xuống"',
    step3: 'Chỉ chọn "Tin nhắn" — bỏ chọn tất cả mục khác',
    step4: "Chọn định dạng JSON (khuyến nghị) hoặc HTML",
    step5: "Tải về, giải nén, rồi chọn thư mục inbox hoặc thư mục cuộc hội thoại",
    startButton: "Bắt đầu",
  },

  // Upload screen
  upload: {
    title: "Tải lên file export",
    dragDrop: "Kéo thả file hoặc thư mục vào đây",
    or: "hoặc",
    selectFile: "Chọn file JSON/HTML",
    selectFolder: "Chọn thư mục export",
    folderHint:
      "Chọn thư mục chứa export Facebook (ví dụ: thư mục inbox hoặc thư mục cuộc hội thoại)",
    acceptedFormats: "Hỗ trợ file .json / .html hoặc thư mục export Facebook Messenger",
    parsing: "Đang đọc file...",
    scanning: "Đang quét thư mục...",
    foundFiles: (count: number) => `Tìm thấy ${count} file tin nhắn`,
    parseProgress: (percent: number) => `Đang xử lý... ${Math.round(percent * 100)}%`,
  },

  // Conversation picker
  picker: {
    title: "Chọn cuộc hội thoại",
    messageCount: (count: number) => `${count.toLocaleString("vi-VN")} tin nhắn`,
    participants: "Thành viên",
  },

  // Conversation summary
  summary: {
    participants: "Thành viên",
    messageCount: "Số tin nhắn",
    dateRange: "Khoảng thời gian",
    viewMessages: "Xem tin nhắn",
  },

  // Chat viewer
  viewer: {
    searchPlaceholder: "Tìm kiếm tin nhắn...",
    unsent: "Tin nhắn đã bị thu hồi",
  },

  // Sweetness filter
  filter: {
    allMessages: "Tất cả",
    level1: "Hơi sến",
    level2: "Sến vừa",
    level3: "Sến rõ",
    level4: "Rất sến",
    level5: "Sến đỉnh cao",
    showing: (shown: number, total: number) =>
      `Đang hiển thị ${shown.toLocaleString("vi-VN")}/${total.toLocaleString("vi-VN")} tin nhắn`,
    noResults: "Không tìm thấy tin nhắn sến ở mức này 🥲",
    noSearchResults: "Không tìm thấy kết quả tìm kiếm",
    tryLower: "Thử giảm mức sến nhé!",
    matchCount: (count: number) => `${count} kết quả`,
  },

  // Analysis progress
  analysis: {
    analyzing: "Đang phân tích...",
    progress: (done: number, total: number) =>
      `Đang phân tích... ${done.toLocaleString("vi-VN")}/${total.toLocaleString("vi-VN")} tin nhắn`,
    completed: "Phân tích hoàn tất!",
    failed: "Phân tích gặp lỗi",
    retry: "Thử lại",
    paused: "Tạm dừng",
  },

  // API key
  apiKey: {
    title: "Gemini API Key",
    description: "Nhập API key của bạn để phân tích độ sến tin nhắn",
    placeholder: "Nhập Gemini API key...",
    save: "Lưu",
    clear: "Xóa",
    show: "Hiện",
    hide: "Ẩn",
    guide: {
      title: "Cách lấy Gemini API Key (miễn phí)",
      step1: "Truy cập aistudio.google.com",
      step2: "Đăng nhập bằng tài khoản Google",
      step3: 'Nhấn "Get API Key" → "Create API key"',
      step4: "Sao chép key và dán vào đây",
      note: "Key chỉ được lưu trên trình duyệt của bạn — không gửi đến bất kỳ server nào ngoài Google.",
    },
    required: "Cần API key để phân tích độ sến (mức 1-5)",
    promptForKey: "Nhập Gemini API key để bắt đầu phân tích",
  },

  // Settings
  settings: {
    title: "Cài đặt",
    apiKeySection: "API Key",
    about: "Về SenMessage",
    version: "Phiên bản",
    back: "Quay lại",
  },

  // Error messages
  errors: {
    generic: "Đã xảy ra lỗi. Vui lòng thử lại.",
    parseInvalidJson:
      "File không phải định dạng JSON hợp lệ. Vui lòng kiểm tra lại file export từ Facebook.",
    parseMissingMessages:
      "File JSON không chứa dữ liệu tin nhắn. Đảm bảo bạn đã export phần 'Tin nhắn' từ Facebook.",
    parseEmptyConversation: "Cuộc hội thoại này không có tin nhắn nào.",
    parseInvalidHtml: "File không phải định dạng HTML export từ Facebook.",
    parseNoHtmlMessages:
      "Không tìm thấy tin nhắn trong file HTML. Facebook có thể đã thay đổi format export.",
    parseHtmlClassMismatch: "Format HTML không được nhận dạng. Thử export lại ở định dạng JSON.",
    parseUnknownFormat:
      "Không tìm thấy file tin nhắn. Hãy chọn thư mục chứa export Facebook hoặc chọn trực tiếp file message_*.json.",
    parseNoMessageFiles:
      "Không tìm thấy file message_*.json trong thư mục. Hãy chọn đúng thư mục inbox hoặc thư mục cuộc hội thoại.",
    apiKeyInvalid: "API key không hợp lệ. Vui lòng kiểm tra lại.",
    apiRateLimit: "Đã vượt giới hạn API. Đang chờ để thử lại...",
    apiServerError: "Lỗi server Gemini. Đang thử lại...",
    apiNetworkError: "Lỗi kết nối mạng. Vui lòng kiểm tra internet.",
    memoryWarning: "File chứa nhiều tin nhắn (100K+). Ứng dụng có thể chạy chậm hơn bình thường.",
  },

  // Empty states
  empty: {
    noUpload: "Chưa có file nào được tải lên",
    noUploadHint: "Hãy upload file export Facebook Messenger để bắt đầu",
    noMessages: "Không có tin nhắn nào",
    analysisInProgress:
      "Đang phân tích tin nhắn... Bạn có thể duyệt tin nhắn ở mức 0 trong khi chờ đợi!",
  },

  // Common
  common: {
    loading: "Đang tải...",
    cancel: "Hủy",
    close: "Đóng",
    uploadNew: "Tải file mới",
    confirm: "Xác nhận",
  },

  // Message type labels
  messageTypes: {
    photo: "📷 Ảnh",
    video: "🎥 Video",
    audio: "🎵 Tin nhắn thoại",
    sticker: "🏷️ Sticker",
    gif: "🎞️ GIF",
    file: "📎 File",
    share: "🔗 Liên kết",
    call: "📞 Cuộc gọi",
    reaction: "👍 Cảm xúc",
    system: "⚙️ Hệ thống",
    other: "📝 Khác",
  },
} as const;
