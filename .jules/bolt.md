## 2024-05-15 - [Intl.DateTimeFormat.format() is relatively slow inside massive loops]
**Learning:** Calling `Intl.DateTimeFormat.format()` 100,000 times takes ~130ms, while creating `new Date(ts)` and extracting `getDate()`, `getMonth()`, `getFullYear()` takes only ~25ms.
**Action:** When grouping messages by date (e.g. `useVirtualizedChat`), use `new Date()` to detect boundary changes instead of formatting every single timestamp. Only format the label when the day actually changes.

## 2024-05-16 - [String.toLowerCase().includes() is slow for massive arrays]
**Learning:** Calling `toLowerCase().includes()` inside a massive loop over string arrays (e.g. 100,000 strings) is much slower (152ms vs 8ms) than compiling a single case-insensitive `RegExp.test()` outside the loop. The `toLowerCase()` function creates a new string in memory on every iteration, leading to massive string allocation overhead. Using standard `for` loops rather than `forEach` or `filter` also reduces function call overhead.
**Action:** When searching or filtering massive string arrays (like chat histories), use pre-compiled case-insensitive Regular Expressions (`new RegExp(escaped, 'i').test()`) instead of `String.toLowerCase().includes()`. Also prefer standard `for` loops over `forEach`/`filter` when iterating over huge arrays.
