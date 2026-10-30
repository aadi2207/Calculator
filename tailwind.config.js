/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        theme: {
          bg: 'var(--color-bg)',
          card: 'var(--color-card)',
          elevated: 'var(--color-elevated)',
          border: 'var(--color-border)',
          'border-subtle': 'var(--color-border-subtle)',
          primary: 'var(--color-primary)',
          'primary-hover': 'var(--color-primary-hover)',
          text: 'var(--color-text)',
          'text-muted': 'var(--color-text-muted)',
          'text-dim': 'var(--color-text-dim)',
          accent: 'var(--color-accent)',
          'accent-glow': 'var(--color-accent-glow)',
          btn: 'var(--color-btn)',
          'btn-hover': 'var(--color-btn-hover)',
          'btn-active': 'var(--color-btn-active)',
          'btn-fn': 'var(--color-btn-fn)',
          'btn-fn-hover': 'var(--color-btn-fn-hover)',
          'btn-op': 'var(--color-btn-op)',
          'btn-op-hover': 'var(--color-btn-op-hover)',
          'btn-equal': 'var(--color-btn-equal)',
          'btn-equal-hover': 'var(--color-btn-equal-hover)',
          danger: 'var(--color-danger)',
        }
      },
      boxShadow: {
        'tactile': 'var(--shadow-tactile)',
        'tactile-pressed': 'var(--shadow-tactile-pressed)',
        'display-inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.4)',
        'glow': '0 0 15px var(--color-accent-glow)',
      },
      gridTemplateColumns: {
        '16': 'repeat(16, minmax(0, 1fr))',
        '32': 'repeat(32, minmax(0, 1fr))',
      }
    },
  },
  plugins: [],
}
