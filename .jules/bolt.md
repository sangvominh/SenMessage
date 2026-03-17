## 2024-05-15 - [Intl.DateTimeFormat.format() is relatively slow inside massive loops]
**Learning:** Calling `Intl.DateTimeFormat.format()` 100,000 times takes ~130ms, while creating `new Date(ts)` and extracting `getDate()`, `getMonth()`, `getFullYear()` takes only ~25ms.
**Action:** When grouping messages by date (e.g. `useVirtualizedChat`), use `new Date()` to detect boundary changes instead of formatting every single timestamp. Only format the label when the day actually changes.
