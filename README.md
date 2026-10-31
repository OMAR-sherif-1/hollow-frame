# HOLLOW FRAME: Link-in-Bio

A cinematic horror link-in-bio page. Pure HTML, CSS and vanilla JavaScript: no build step, no frameworks, no backend, no paid services.

```
hollow-frame/
├── index.html          page structure, SEO tags, your links
├── style.css           all styling and animation
├── script.js           menu, ambient sound, parallax, load sequence
├── .nojekyll           tells GitHub Pages to serve files as they are
├── favicon.ico  favicon-32.png  apple-touch-icon.png
└── assets/
    ├── fonts/          Cinzel, Cormorant Garamond, Montserrat (self-hosted, free OFL licence)
    └── img/            logo mark, wordmark, background, social preview image
```

---

## 1. Put in your real links (do this first)

Open **`index.html`** and search for `EDIT YOUR SOCIAL LINKS HERE`. Replace the three addresses:

| Button | Replace this | With, for example |
|---|---|---|
| Watch on YouTube | `https://www.youtube.com/@YOUR_YOUTUBE_HANDLE` | `https://www.youtube.com/@HollowFrame` |
| Follow on TikTok | `https://www.tiktok.com/@YOUR_TIKTOK_HANDLE` | `https://www.tiktok.com/@hollowframe` |
| Follow on Instagram | `https://www.instagram.com/YOUR_INSTAGRAM_HANDLE` | `https://www.instagram.com/hollowframe` |

Then search for `EDIT YOUR CONTACT EMAIL HERE` and change the email (both the `mailto:` part and the visible text) in the menu.

Until you do, the browser console (F12) lists any links that still contain a placeholder.

## 2. Set your web address (for Google and social previews)

Near the top of `index.html`, in the head, replace `YOUR-USERNAME` and `YOUR-REPO` in these five places: `canonical`, `og:url`, `og:image`, `twitter:image` (the image address **must** be the full `https://...` address or the preview picture will not appear on social networks). If you use a custom domain, use that instead.

Example: `https://hollowframe.github.io/hollow-frame/assets/img/og-image.jpg`

## 3. Run it on your computer

The site works by double-clicking `index.html`. For the most accurate result, run a tiny local server:

```bash
cd hollow-frame
python3 -m http.server 8000
```

Then open <http://localhost:8000>. (Alternative: the "Live Server" extension in VS Code.)

## 4. Publish for free with GitHub Pages

1. Create a free account at <https://github.com>.
2. Click **New repository**. Name it, for example, `hollow-frame`. Choose **Public**. Click **Create repository**.
3. On the empty repository page click **uploading an existing file**. Drag **everything inside** the `hollow-frame` folder (including the `assets` folder and the hidden `.nojekyll` file) into the page. Click **Commit changes**.
   Make sure `index.html` sits at the top level of the repository, not inside an extra folder.
4. Go to **Settings, then Pages**. Under **Build and deployment**, set **Source** to **Deploy from a branch**, branch **main**, folder **/ (root)**. Click **Save**.
5. Wait one to two minutes. Your address appears at the top of that page:
   `https://YOUR-USERNAME.github.io/hollow-frame/`
6. Put that address into step 2 above, commit the change, and use the link in your bios.

**To update later:** open a file on GitHub, click the pencil icon, edit, and commit. The site refreshes in a minute or two.

**Custom domain (optional, costs money for the domain only):** Settings, Pages, Custom domain.

**Check your social preview:** after publishing, paste your address into a post draft (or a free "Open Graph preview" checker). Platforms cache previews, so they may take a while to refresh after changes.

## 5. Behaviour you can rely on

- **Sound** is off by default and never plays on its own. The speaker button (top right) starts a quiet drone and wind sound that is generated in the browser (no audio files). It stops when the tab is hidden. Change loudness with `SOUND_VOLUME` at the top of `script.js`.
- **Reduced motion:** if a visitor's device asks for less motion, the opening sequence, fog drift, flicker, grain movement and parallax are all switched off and the page shows instantly.
- **Keyboard:** Tab goes through skip link, menu, sound, then the three links. Escape closes the menu. Focus is clearly visible.
- **Without JavaScript** the page still shows everything and all links work.

## 6. Customising

| Want to change | Where |
|---|---|
| Colours | `:root` variables at the top of `style.css` |
| Button text | `index.html`, inside each `<a class="door">` |
| Headline / whisper / footer text | `index.html` |
| Menu "about" text | `<dialog id="menu">` in `index.html` |
| Background picture | replace `assets/img/bg-800.webp` and `bg-1600.webp` (keep the 1145:1374 portrait ratio, or adjust `aspect-ratio` on `.scene__frame` and the glow position on `.scene__glow`) |
| Social preview picture | replace `assets/img/og-image.jpg` (1200 × 630) |

## 7. Notes on image quality

The logo, wordmark and background were extracted from the reference images supplied (a 1145 × 1374 mockup). They were cleaned and enlarged, so they look sharp at normal sizes, but a higher-resolution original will always look better on large or high-density screens. If you have the original files, export them transparent (logo, wordmark) and as a wide background, and drop them into `assets/img/` using the same file names.

## 8. Credits and licences

Fonts: Cinzel, Cormorant Garamond and Montserrat, all under the SIL Open Font License (free for commercial use). The social platform icons are simplified drawings; the TikTok, YouTube and Instagram marks belong to their owners.
