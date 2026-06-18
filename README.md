# Portfolio

Personal portfolio website for software engineering/tech student.

## Project Structure

```
my-portfolio/
├── index.html      # Main HTML — all sections and content
├── style.css       # All styles (reset, variables, layout, components, responsive)
├── script.js       # All JS (starfield animation, live clock, scroll reveal, smooth scroll)
├── assets/         # Place your static assets here
└── README.md
```

## Getting Started

Just open `index.html` in a browser — no build step or dependencies needed.

## Things to update before going live

- **Photo** — Add your image to `assets/` and replace the placeholder in `index.html`:
  ```html
  <!-- Replace the photo-frame placeholder with: -->
  <img src="assets/your-photo.jpg" alt="Author">
  ```
- **Deploy** — This is a static site, so it works on GitHub Pages, Netlify, Vercel, or any static host. For GitHub Pages, push to a repo and enable Pages from the `main` branch root.

## Tech

Vanilla HTML, CSS, and JavaScript. No frameworks, no build tools.
