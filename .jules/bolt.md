## 2024-05-15 - [Intl.DateTimeFormat.format() is relatively slow inside massive loops]
**Learning:** Calling `Intl.DateTimeFormat.format()` 100,000 times takes ~130ms, while creating `new Date(ts)` and extracting `getDate()`, `getMonth()`, `getFullYear()` takes only ~25ms.
**Action:** When grouping messages by date (e.g. `useVirtualizedChat`), use `new Date()` to detect boundary changes instead of formatting every single timestamp. Only format the label when the day actually changes.

## 2024-05-16 - [String.toLowerCase().includes() is extremely slow inside massive loops]
**Learning:** Using `.toLowerCase().includes()` inside `.forEach()` or `.filter()` for array search/filtering on 100,000+ elements creates massive string allocation overhead and suffers from array method call overhead. A pre-compiled case-insensitive regex (`new RegExp(escaped, 'i')`) combined with a standard `for` loop is ~4x faster.
**Action:** For performance when searching or filtering massive string arrays (like chat histories), use pre-compiled case-insensitive Regular Expressions and standard `for` loops instead of `.toLowerCase().includes()` inside `.filter()` or `.forEach()`.
