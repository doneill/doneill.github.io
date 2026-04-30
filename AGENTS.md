# AGENTS.md
## Site Overview

Personal blog/portfolio site at [gh.jdoneill.com](http://gh.jdoneill.com) built with **Hexo v5** and the **Cactus dark theme**. Deployed to GitHub Pages via the `master` branch; all active development happens on `develop`.

## Commands

```bash
# Development
npm run server    # Start dev server at localhost:4000
npm run build     # hexo generate — build static site to public/
npm run clean     # hexo clean — wipe generated files and cache
npm run deploy    # hexo deploy — push public/ to master branch

# Theme linting (run from themes/cactus/)
npm run lint      # JSHint on JS files
npm run test      # gulp validate — full validation
npm run clean     # Stylus formatting via stylus-supremacy
```

## Architecture

```
source/
  _posts/         # Blog posts as Markdown with YAML front-matter
  _data/          # projects.json (feeds the Projects section)
  gallery/        # Standalone HTML pages for interactive visualizations
themes/cactus/    # Cactus dark theme (fork of probberechts/cactus-dark)
  _config.yml     # Theme config: nav, social links, colorscheme, Leaflet toggle
  source/         # Theme assets (Stylus, JS, templates)
public/           # Build output — never edit directly
_config.yml       # Root Hexo config: URL, permalink, plugins, pagination
```

## Deployment Pipeline

GitHub Actions (`.github/workflows/build.yml`) triggers on pushes to `develop`, runs `npm install && npm run build`, then deploys `public/` to `master` via `peaceiris/actions-gh-pages`. Never push generated content manually.

## Content

- **Posts** live in `source/_posts/` as `.md` files with Hexo front-matter (`title`, `date`, `tags`, `categories`).
- **Gallery pages** in `source/gallery/` are standalone HTML files (not Hexo posts) using Leaflet for maps and justifiedGallery for photo layouts.
- **Projects** data is driven by `source/_data/projects.json`.

## Theme Configuration

Key theme settings in `themes/cactus/_config.yml`:
- `colorscheme: dark` with `kimbie.dark` code highlighting
- Leaflet maps enabled globally
- Gravatar avatar sourced from `dev@jdoneill.com`
- Posts overview limited to 5 recent; all posts shown in archives

## Python Environment

Dependencies for data processing scripts are managed with **uv** (`pyproject.toml`, Python 3.10). The `.venv` is created automatically:

```bash
uv sync          # install dependencies into .venv
uv run python    # run python in project venv without activating
```

Scripts (`update-data.sh`, `wa-counties-covid.py`, `covid19.py`) fetch and process GeoJSON data for gallery visualizations.

## Hexo Plugins

Key plugins in `package.json`: `hexo-renderer-marked` (Markdown), `hexo-deployer-git` (GitHub Pages), `hexo-generator-cname`, `hexo-asset-link`. The permalink format is `/:year/:month/:day/:title/`.
