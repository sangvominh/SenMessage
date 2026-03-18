## 2024-05-15 - [Intl.DateTimeFormat.format() is relatively slow inside massive loops]
**Learning:** Calling `Intl.DateTimeFormat.format()` 100,000 times takes ~130ms, while creating `new Date(ts)` and extracting `getDate()`, `getMonth()`, `getFullYear()` takes only ~25ms.
**Action:** When grouping messages by date (e.g. `useVirtualizedChat`), use `new Date()` to detect boundary changes instead of formatting every single timestamp. Only format the label when the day actually changes.

## 2024-05-16 - [String.toLowerCase().includes() vs RegExp.test() inside massive loops]
**Learning:** Using `m.content?.toLowerCase().includes(query)` inside a large array `.filter()` creates a new string allocation for every single message. For 100k items, this takes ~120-200ms depending on string length. Using a pre-compiled `new RegExp(query, 'i')` and calling `.test(m.content)` completely avoids this allocation and is 3-4x faster (~50-60ms for 100k items).
**Action:** Always prefer pre-compiled case-insensitive regular expressions (`RegExp.test()`) over `toLowerCase().includes()` when filtering or iterating over large message arrays in memory (e.g., chat search, keyword filtering).
