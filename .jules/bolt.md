## 2024-05-15 - [Intl.DateTimeFormat.format() is relatively slow inside massive loops]
**Learning:** Calling `Intl.DateTimeFormat.format()` 100,000 times takes ~130ms, while creating `new Date(ts)` and extracting `getDate()`, `getMonth()`, `getFullYear()` takes only ~25ms.
**Action:** When grouping messages by date (e.g. `useVirtualizedChat`), use `new Date()` to detect boundary changes instead of formatting every single timestamp. Only format the label when the day actually changes.

## 2024-05-23 - [Avoid spread operator with Math.min/max on massive arrays]
**Learning:** Using `Math.min(...timestamps)` or `Math.max(...timestamps)` on very large arrays (e.g., chat histories with 100k+ messages) causes the V8 engine to push all elements onto the call stack, leading to a fatal "Maximum call stack size exceeded" crash.
**Action:** Always compute min and max values manually using a standard `for` loop for any array that could potentially exceed 10,000 items. This avoids call stack limits and improves performance by preventing unnecessary array allocations.