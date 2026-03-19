## 2024-05-15 - [Intl.DateTimeFormat.format() is relatively slow inside massive loops]
**Learning:** Calling `Intl.DateTimeFormat.format()` 100,000 times takes ~130ms, while creating `new Date(ts)` and extracting `getDate()`, `getMonth()`, `getFullYear()` takes only ~25ms.
**Action:** When grouping messages by date (e.g. `useVirtualizedChat`), use `new Date()` to detect boundary changes instead of formatting every single timestamp. Only format the label when the day actually changes.

## 2026-03-19 - [String.toLowerCase().includes() is slow in massive loops]
**Learning:** Using `message.content.toLowerCase().includes(lowerQuery)` inside array iterations (`filter`, `forEach`) across massive sets of objects (e.g. 100,000 chat messages) is relatively slow because it forces string allocation on every iteration.
**Action:** Replace it by pre-compiling a case-insensitive regular expression `new RegExp(escapedQuery, 'i')` and calling `.test(content)`. Combine with standard `for` loops rather than array methods to maximize speed.
