<div align="center">

# 🚀 Victor Guilarte — Portfolio

[![License: MIT](https://img.shields.io/badge/License-MIT-e94e4e.svg)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/vgl91/personal_website_design)](https://github.com/vgl91/personal_website_design/commits/main)
[![Languages](https://img.shields.io/badge/i18n-EN%20%7C%20ES-blue)](#-how-the-translation-system-works)
[![No Build](https://img.shields.io/badge/build-none-success)](#-running-it-locally)
[![Made with ❤️ in Cuba](https://img.shields.io/badge/made%20with%20❤️%20in-Holguín%2C%20Cuba-e94e4e)](#-author)

**Friendly neighborhood .NET dev building enterprise software that doesn't fall over in production.**<br>
Currently in 🇨🇺 Holguín, Cuba. Open to interesting work and good conversations.

[**🌐 Live Demo**](https://victorguilarte.dev) · [**💼 LinkedIn**](https://www.linkedin.com/in/victor-guilarte) · [**🐙 GitHub**](https://github.com/vgl91) · [**✉️ Email**](mailto:vaglegra91@gmail.com)

</div>

---

## 📸 Sneak peek

<table>
  <tr>
    <td><img src="docs/screenshots/hero-dark.png" alt="Hero section in dark mode"></td>
    <td><img src="docs/screenshots/full-dark.png" alt="Full page in dark mode"></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/full-light.png" alt="Full page in light mode"></td>
    <td><img src="docs/screenshots/mobile-dark.png" alt="Mobile view in dark mode"></td>
  </tr>
</table>

> 📷 Screenshots go in `docs/screenshots/`. The README is wired up to expect four files with those exact names.

---

## ✨ What it does

- 🌐 **Bilingual EN/ES** — Full English/Spanish support with one-click toggle and persistent preference
- 🌓 **Dark & Light themes** — Both look intentional (not just inverted). Respects `prefers-color-scheme` on first visit, with no flash of the wrong theme.
- 📱 **Responsive from 320px to 4K** — Mobile menu, fluid type, grids that don't fall apart
- ♿ **Accessible** — Skip link, ARIA labels, focus-trapped dialog, `aria-current` on the active nav item, `prefers-reduced-motion`, WCAG AA contrast in both themes
- ⚡ **Fast by default** — ~250 KB on first load, no icon fonts, no build step, WebP images, IntersectionObserver animations
- 🔍 **SEO-ready** — Schema.org `Person` JSON-LD, Open Graph, Twitter Cards, sitemap, hreflang
- 📄 **CV modal** — Embedded PDF preview, no Google Drive round-trip (the PDF is only fetched when you open it)
- 📬 **Contact form** — EmailJS integration, no backend required
- 🎯 **No framework, no build** — Vanilla HTML/CSS/JS, deploys anywhere
- 🧱 **Works without JavaScript** — All content stays readable and visible if the script fails to load

---

## 🛠️ Tech stack

| Layer | Tool | Why |
|---|---|---|
| **Markup** | HTML5 | Semantic, accessible, no preprocessor needed |
| **Styles** | CSS3 | Custom properties, `color-mix()`, `clamp()`, container queries-ready |
| **Behavior** | Vanilla JS (ES2020+) | One IIFE, no build, no jQuery, no React |
| **Fonts** | [Inter](https://rsms.me/inter/) + [JetBrains Mono](https://www.jetbrains.com/lp/mono/) | Industry-standard pairing, both open source |
| **Icons** | Inline SVG sprite | 24 icons in ~25 KB of markup, zero requests, no icon font |
| **Tech logos** | [Devicon](https://devicon.dev/) | Consistent set of tech icons |
| **Forms** | [EmailJS](https://www.emailjs.com/) | Send emails without a backend |
| **Hosting** | Static (any) | GitHub Pages, Netlify, Vercel, S3, anywhere |

---

## 📂 Project layout

```
personal_website_design/
├── index.html                  # Single page, all 7 sections (59 KB, inline SVG icon sprite)
├── manifest.json               # PWA manifest
├── robots.txt                  # SEO crawler config
├── sitemap.xml                 # Sitemap with hreflang
├── LICENSE                     # MIT
├── README.md                   # You are here
│
├── css/
│   └── style.css               # Full design system (40 KB, no preprocessor)
│
├── js/
│   └── script.js               # IIFE, vanilla ES2020+ (16 KB)
│
├── languages/
│   ├── en.json                 # 156 keys, English is the default
│   └── es.json                 # Same keys, Spanish translation
│
├── img/                        # Shipped images + conversion sources
│   ├── perfil.webp             # Hero portrait (shipped)
│   ├── perfil.png              # Source for the WebP conversion, not shipped
│   ├── portfolio*.webp         # Project thumbnails (conversion output)
│   ├── portfolio*.jpg          # Conversion sources, not shipped
│   ├── gb.svg                  # UK flag
│   ├── es.svg                  # Spain flag
│   ├── VAGL_logo2Mini.jpg      # Logo
│   └── ...
│
├── assets/
│   └── pdf/
│       └── cv-victor-guilarte.pdf   # CV embedded in modal (loaded on demand)
│
├── docs/
│   └── screenshots/            # README images go here
│
└── scripts/
    ├── optimize_images.py      # JPG/PNG → WebP batch converter
    ├── verify_keys.py          # Check the translation layer (HTML + JS + JSON)
    └── validate.py             # HTML structure sanity check
```

---

## 🚀 Running it locally

No build step. No `npm install`. Just clone and serve.

```bash
# 1. Clone
git clone https://github.com/vgl91/personal_website_design.git
cd personal_website_design

# 2. Serve (any static server works — must be HTTP, not file://)
python -m http.server 8000
#   or:  npx serve .
#   or:  php -S localhost:8000

# 3. Open
open http://localhost:8000
```

**Why HTTP, not `file://`?**
The translation system uses `fetch()` to load JSON files. Browsers block `fetch()` from `file://` URLs in most configurations, so you need a real (even local) server.

---

## 🌐 How the translation system works

Every translatable string lives in `languages/<lang>.json` with a flat key namespace. HTML elements opt in by adding `data-text="key"`:

```html
<!-- en.json -->              <!-- HTML -->
{                             <h1 data-text="home_title">I'm Victor</h1>
  "home_title": "I'm Victor"
}
```

On page load and on language toggle, `js/script.js` walks all `[data-text]` elements and replaces `textContent` with the value from the active JSON.

Attributes use `data-aria-label="key"`, and strings that the script writes at runtime
(form feedback, the theme toggle label) are read with `t('key')`. All three are checked
by `scripts/verify_keys.py`, which also verifies that the English fallback baked into
the HTML still matches `en.json` — so the two can't drift apart silently.

### ➕ Adding a new language (3 steps)

1. **Create the file** — `languages/fr.json` (copy `en.json` and translate)
2. **Add the flag** — `img/fr.svg` + a `<button class="flags-item" data-lang="fr">` in the header
3. **Update the default** (optional) — if French should be the *first* load, change `LANG_DEFAULT` in `js/script.js`

Run `python scripts/verify_keys.py` to confirm your new file has all the keys the site expects.

### 🛡️ What happens if a key is missing

The element keeps its hardcoded fallback text. The site stays usable even with a partial translation. No crashes, no broken UI.

---

## 🎨 Customization

The design system is centralized in CSS custom properties. Change one variable, see the effect everywhere.

### Change the accent color

```css
/* css/style.css, top of file */
[data-theme="dark"] {
  --accent: #e94e4e;          /* text, icons, markers */
  --accent-hover: #ff6b6b;    /* hover emphasis */
  --accent-solid: #c93a3a;    /* filled buttons (needs 4.5:1 against white text) */
  --accent-solid-hover: #b53232;
  --accent-on-tint: #ff8a8a;  /* text on a tinted accent surface */
  /* ... */
}
```

The accent cascades to: links, buttons, tags, timeline markers, scroll-to-top button, focus rings, gradients.

> `--accent` and `--accent-solid` are two different reds on purpose. `--accent` is
> used for text and icons on the page background; `--accent-solid` is used for filled
> surfaces that carry white text, and has to be dark enough to clear WCAG AA.

### Add a new project to the portfolio

1. Add 3 new keys per language to `languages/en.json` and `languages/es.json`:
   ```json
   "portfolio_project_4_status": "Live",
   "portfolio_project_4_title": "My New Project",
   "portfolio_project_4_description": "What it does in one line.",
   "portfolio_project_4_stack": ".NET, Angular, Azure",
   "portfolio_project_4_features": "Auth · Payments · Dashboard"
   ```
2. Add a `<article class="project-card">…</article>` to the `#portfolio` section in `index.html`, copying the existing one
3. Add a gradient variant in CSS if you want a different color:
   ```css
   .project-thumb[data-gradient="ocean"] {
     background: var(--gradient-ocean);
   }
   ```
   and declare `--gradient-ocean` in both theme blocks.

### Add a new icon

Icons live in the inline SVG sprite at the top of `index.html`:

```html
<symbol id="i-bx-star" viewBox="0 0 24 24"><path d="…"/></symbol>
```

```html
<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-bx-star"></use></svg>
```

Copy the path from [Boxicons](https://boxicons.com/) or [Devicon](https://devicon.dev/)
and strip its `fill` attribute so the icon inherits `currentColor`.

### Add a new section

1. Pick a section ID (e.g. `#blog`)
2. Add a `<section class="blog" id="blog" aria-labelledby="blog-title">…</section>` after the existing ones
3. Add a `<li><a href="#blog" data-text="nav_blog">Blog</a></li>` to the nav
4. Add `nav_blog` to both JSON files
5. The IntersectionObserver will pick it up for the active nav indicator automatically

---

## 🌍 Deployment

This is a static site. Pick your favorite host.

### GitHub Pages (1 minute)

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/vgl91/personal_website_design.git
git push -u origin main
# → Settings → Pages → Source: main / (root) → Save
# Live in ~30 seconds at https://vgl91.github.io/personal_website_design
```

### Netlify (drag & drop)

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the project folder onto the page
3. Done. Live URL in 10 seconds.

### Vercel

```bash
npm i -g vercel
vercel --prod
```

### Custom domain

Point a CNAME to your host and update `<link rel="canonical">` and the `<loc>` entries in `sitemap.xml` to use your real domain.

---

## 📊 Performance

Measured in Chrome (headless, first load, no cache):

| Metric | Before | After | Δ |
|---|---|---|---|
| **Total page weight** | **~2.29 MB** | **~252 KB** | **−89%** |
| **Transferred over the wire** | ~2.29 MB | ~143 KB (gzip) | **−94%** |
| **Requests on first load** | 20 | 11 | −45% |
| Icon system (Boxicons + Devicon) | 2.03 MB (CSS + TTF + WOFF2) | 25 KB (inline SVG) | **−98.8%** |
| `perfil.png` (hero portrait) | 175 KB | 21 KB (WebP) | −88% |
| `portfolio*.jpg` (6 images) | 172 KB | 116 KB (WebP) | −33% |
| `es.svg` (Spain flag) | 93 KB | 0.3 KB (simplified) | −99.7% |
| HTML payload | 15.7 KB | 59 KB (inline sprite + SEO + ARIA) | +276% |
| CSS payload | n/a (orphan file) | 40 KB | clean |
| JS payload | — | 16 KB | no dependencies |

The biggest win was dropping the two icon-font CDNs: `devicon.min.css` declares its
sources in `eot → svg → ttf → woff → woff2` order, so Chrome downloaded the **1.7 MB
TTF** to draw 8 technology logos. Everything is now inline SVG in the document.

Lighthouse targets (mobile, throttled):

- 🎯 Performance: **95+**
- ♿ Accessibility: **95+**
- 🔍 SEO: **100**
- ✅ Best Practices: **95+**

---

## ♿ Accessibility & SEO

Accessibility isn't an afterthought here — it's in the markup.

**Accessibility**

- ✅ Skip-to-content link
- ✅ Semantic HTML5 (`<header>`, `<main>`, `<nav>`, `<section>`, `<article>`, `<footer>`)
- ✅ `aria-label` on all icon-only buttons (translated)
- ✅ `aria-current="location"` and active state on the nav item of the current section
- ✅ `aria-pressed` on the language and theme toggles
- ✅ `aria-live="polite"` region for form feedback, `aria-invalid` on invalid fields
- ✅ `prefers-reduced-motion` honored globally
- ✅ Focus rings on all interactive elements (`:focus-visible`)
- ✅ Form validation with descriptive error messages (translated)
- ✅ Color contrast: **WCAG AA (4.5:1) verified on every text/background pair, in both themes**
- ✅ Keyboard-navigable modal (Escape to close, focus trapped inside, focus restored on close)
- ✅ The off-canvas mobile menu is `inert` and `aria-hidden` while closed, so keyboard users never tab into an invisible panel
- ✅ Touch targets ≥ 24 px (WCAG 2.5.8); standalone controls are ≥ 32 px
- ✅ The page stays fully readable if JavaScript fails to load

**SEO**

- ✅ Open Graph + Twitter Card metadata
- ✅ JSON-LD `Person` schema (Google rich results)
- ✅ `sitemap.xml` with hreflang
- ✅ `robots.txt`
- ✅ `manifest.json` (PWA installable)
- ✅ `theme-color` updated live with the theme
- ✅ Descriptive `<title>`, `<meta description>`, OG image
- ✅ Canonical URL

---

## 🗺️ Roadmap

Things I'd like to add when there's time:

- [ ] 📝 **Blog** with Markdown posts and reading time
- [ ] 🌍 **Localized routing** (`/en/`, `/es/`) instead of client-side language swap
- [ ] ✨ **View Transitions API** for buttery section changes
- [ ] 📊 **Plausible analytics** (privacy-friendly, no cookies)
- [ ] 💼 **Real portfolio projects** to replace the 3 concept cards (currently labelled *Concept* on purpose)
- [ ] 🧪 **Unit tests** for the language switcher and form validation
- [ ] 🖼️ **OG image generator** — dynamic preview card per section
- [ ] 🎨 **Theme picker** — let visitors pick from 3-4 accent colors

Have an idea? [Open an issue](https://github.com/vgl91/personal_website_design/issues).

---

## 📄 License

[MIT](LICENSE) © 2026 Victor Guilarte

You can use this as a template for your own portfolio, fork it, learn from it, ship something based on it. Attribution appreciated but not required.

---

## 👤 Author

**Victor Guilarte** — Full-Stack .NET Developer

- 💼 [LinkedIn](https://www.linkedin.com/in/victor-guilarte)
- 🐙 [GitHub](https://github.com/vgl91)
- ✉️ [vaglegra91@gmail.com](mailto:vaglegra91@gmail.com)
- 📍 Holguín, Cuba
- 🗣️ English (C1) · Spanish (native)

Currently working at **Sifizsoft S.A** on enterprise financial systems, and looking for the next interesting problem to solve.

---

## 🙏 Credits

Built with coffee ☕, [VS Code](https://code.visualstudio.com/), and these amazing free tools:

- [Inter](https://rsms.me/inter/) — UI font
- [JetBrains Mono](https://www.jetbrains.com/lp/mono/) — monospace font
- [Boxicons](https://boxicons.com/) — icon set (SVG paths inlined in `index.html`)
- [Devicon](https://devicon.dev/) — tech logos (SVG paths inlined in `index.html`)
- [EmailJS](https://www.emailjs.com/) — contact form backend
- [Pillow](https://python-pillow.org/) — WebP conversion in the optimization script
- [Schema.org](https://schema.org/) — structured data vocabulary
- [Shields.io](https://shields.io/) — README badges

---

<div align="center">

If this helped you ship your own portfolio, consider ⭐ starring the repo. It means a lot.

**[⬆ back to top](#-victor-guilarte--portfolio)**

</div>
