## 2024-05-15 - [Intl.DateTimeFormat.format() is relatively slow inside massive loops]
**Learning:** Calling `Intl.DateTimeFormat.format()` 100,000 times takes ~130ms, while creating `new Date(ts)` and extracting `getDate()`, `getMonth()`, `getFullYear()` takes only ~25ms.
**Action:** When grouping messages by date (e.g. `useVirtualizedChat`), use `new Date()` to detect boundary changes instead of formatting every single timestamp. Only format the label when the day actually changes.

## 2025-02-24 - [Avoid `toLowerCase().includes()` inside massive message loops]
**Learning:** For performance when searching or filtering massive string arrays (like chat histories), `String.toLowerCase().includes()` inside large `.filter` or `.forEach` loops can cause excessive string allocation and method call overhead. A pre-compiled case-insensitive Regular Expression (`new RegExp(escaped, 'i').test()`) with a standard `for` loop is about 2x-3x faster.
**Action:** Always prefer pre-compiled case-insensitive Regular Expressions and standard `for` loops over array methods when filtering or extracting matches across tens of thousands of chat messages.
