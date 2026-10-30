# Calcula — Production-Grade Multi-Mode Calculator

Calcula is a tactile, production-grade multi-mode calculator web app built in **React 19**, **TypeScript**, and **Tailwind CSS**. It combines precision computational power across 6 distinct modes with zero generic AI clutter, rich physical keyboard shortcuts, and synthesized mechanical switch audio feedback generated on the fly via the browser's Web Audio API.

---

## ⚡ Quick Start

```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Start the local development server
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

---

## 📐 Architecture & Modes

### 1. Navigation & 3-Zone Header
- **Left**: Minimalist brand wordmark (`Calcula`) with tactile precision styling.
- **Center**: Single-line mode switcher tabs for instant mode switching.
- **Right**:
  - **Tactile Sound Toggle `[M]`**: Instant mute / unmute for the Web Audio synthesis engine.
  - **Theme Switcher `[T]`**: Cycles through 4 custom themes:
    - **Studio Dark**: Deep obsidian slate with precision blue accents.
    - **Clean Light**: Architectural off-white with high-contrast slate text.
    - **Amber Phosphor**: Retro-futuristic CRT amber phosphor luminescence.
    - **Nordic Slate**: Matte cold-slate blue-gray with arctic frost highlights.
  - **Keyboard Shortcuts Guide `[?]`**: Interactive guide overlay.
  - **Mobile History Drawer Toggle**: Access calculation tape on small screens.

### 2. The 6 Calculation Engines
1. **Standard Mode**:
   - Arithmetic (`+`, `−`, `×`, `÷`, `%`, `±`, grouping parentheses `(`, `)`).
   - Quick operations: Reciprocal `1/x`, Square `x²`, Square Root `√x`.
   - Dedicated memory registers with state indicator: `MC`, `MR`, `M+`, `M−`, `MS`.
   - Floating-point stabilization eliminating IEEE-754 precision artifacts (`0.1 + 0.2 = 0.3`).
   - Dynamic auto-scaling font size for long numbers.

2. **Scientific Mode**:
   - Trigonometry: `sin`, `cos`, `tan`, inverse (`sin⁻¹`, `cos⁻¹`, `tan⁻¹` via `2nd`), hyperbolic (`sinh`, `cosh`, `tanh` via `hyp`).
   - Interactive `DEG` / `RAD` angle mode switch with automatic conversion.
   - Logarithms: `log₁₀`, `ln`, `log₂`.
   - Powers and roots: `x²`, `x³`, `xʸ`, `10ˣ`, `eˣ`, `√x`, `∛x`.
   - Constants: `π` and `e`.
   - Factorial `n!`, absolute value `|x|`, modulo `mod`, and scientific exponent notation `EXP`.

3. **Programmer Mode**:
   - Word size selector: `QWORD` (64-bit), `DWORD` (32-bit), `WORD` (16-bit), `BYTE` (8-bit) with bitmasking.
   - Simultaneous real-time readouts across `HEX`, `DEC` (with Signed / Unsigned toggle), `OCT`, and `BIN` (grouped in 4-bit nibbles).
   - Clicking any base row sets it as the active input radix with dynamic keypad filtering.
   - Interactive 64-bit Bitboard: Visual grid representing all 64 bits where clicking any bit flips its state (0 ↔ 1) and recalculates all representations instantly.
   - Bitwise operations: `AND`, `OR`, `XOR`, `NOT`, `NAND`, `NOR`, bit shifts (`LSH <<`, `RSH >>`), circular rotations (`ROL`, `ROR`).

4. **Unit & Currency Converter**:
   - 9 conversion categories: Length, Mass & Weight, Temperature, Data Storage, Speed, Area, Volume, Time, Reference Currencies.
   - Bilateral inputs with unit selectors and an instant swap button.
   - Formula explanation and a multi-unit live reference matrix showing current value conversions across all other units simultaneously.

5. **Financial Calculator**:
   - **Loan & Mortgage Amortization**: Principal, annual interest rate, and term in years. Calculates monthly payment, total interest, total loan cost, visual principal vs. interest breakdown bar, and an amortization milestone table.
   - **Compound Interest & Wealth Growth**: Initial deposit, monthly contributions, annual return rate, and investment horizon. Calculates future portfolio value, total cash deposited, passive interest earned, and annual schedule.

6. **Interactive Function Grapher**:
   - Cartesian 2D canvas plotting $f(x)$ (e.g. `sin(x) * x`, `x^3 - 3*x`, `1/x`, Gaussian `exp(-x^2)`).
   - Interactive mouse crosshair probe showing live coordinate readouts `(X, Y)` and $f(x)$ in a floating telemetry HUD.
   - Zoom in/out, pan drag, reset pan/zoom, grid toggle, and quick preset buttons.
   - Multi-function comparison with $f_2(x)$.

### 3. Calculation History Tape & Memory
- Persistent audit tape saved in `localStorage` recording timestamp, mode, expression, and result.
- Actions: Insert Result into active calculation, Restore Expression, Copy to Clipboard, Export Tape as CSV, and Clear History.
- Memory register inspector with live status indicator.

### 4. Synthesized Mechanical Sound Engine
- 100% native Web Audio API acoustic synthesis.
- Zero external MP3/WAV audio assets or latency.
- Realistic tactile mechanical key clicks, deep thocks for operators, satisfying chord confirmations for equals, and snap releases for clear.

---

## ⌨️ Physical Keyboard Map

| Key | Action |
| :--- | :--- |
| `0` - `9`, `.` | Enter numbers / decimal point |
| `+`, `-`, `*`, `/` | Basic arithmetic operators |
| `Enter` or `=` | Evaluate expression |
| `Backspace` | Delete last character |
| `Escape` or `C` | Clear All (AC) |
| `(`, `)` | Grouping parentheses |
| `^` | Exponentiation |
| `%` | Modulo / Percentage |
| `M` | Toggle mechanical sound engine ON / OFF |
| `T` | Cycle color themes |
| `?` | Open / close keyboard shortcuts modal |
| `1` - `6` | Quick-switch calculator modes |
| `A` - `F` | Hexadecimal digits (in Programmer mode) |
| `Tab` | Cycle active radix (in Programmer mode) |
