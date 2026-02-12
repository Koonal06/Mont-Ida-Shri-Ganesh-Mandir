# Mont-Ida Shri Ganesh Mandir Website Documentation

## 1. Project Overview
This is a static multi-page website built with:
- `HTML` (page structure)
- `CSS` (design and layout)
- `JavaScript` (interactivity)

The site is designed with a warm cultural theme and responsive layout for desktop, tablet, and mobile.

## 2. Pages
- `index.html` - Home page (hero video, countdown, upcoming events preview)
- `about.html` - About the mandir (mission, values, community)
- `events.html` - Main events listing page
- `event.html` - Secondary events page (same structure/content style)
- `gallery.html` - Filterable gallery with lightbox
- `contact.html` - Contact details and contact form

## 3. Folder Structure
- `css/styles.css` - Main global styling for all pages
- `style.css` - Gallery-specific styling
- `js/script.js` - All interactive behavior
- `assets/video/Index.mp4` - Hero background video

## 4. Main Features

### Global UI
- Sticky navigation with active link states
- Responsive mobile menu toggle
- Smooth scroll behavior
- Section reveal animation on scroll
- Card hover lift and subtle scaling effects
- Footer pushed to bottom on short pages

### Home (`index.html`)
- Hero video section with overlay
- Main CTA button to events page
- Countdown timer to next major event
- Upcoming events preview cards

### About (`about.html`)
- Structured content in clear sections
- Decorative heading divider lines
- Alternating section background rhythm

### Events (`events.html`, `event.html`)
- Event cards include:
  - Title
  - Date
  - Location
  - Description
  - Status badge (`Upcoming`, `Today`, `Completed`)
  - `Add to Calendar` link
- Automatic event sorting by date (JavaScript)

### Gallery (`gallery.html`)
- Category filter buttons:
  - All
  - Festival Decorations
  - Cultural Dance
  - Prayer Ceremony
  - Community Gathering
  - Diwali Lights
  - Youth Programs
- No page reload filtering
- Card layout with image, title, description
- Lightbox zoom with caption

### Contact (`contact.html`)
- Contact cards (address, phone, email)
- Form with name/email/message
- AJAX form submission feedback (`Sending`, success, error)

## 5. JavaScript Functions (`js/script.js`)
- `initializeNavigation()` - Mobile menu toggle
- `updateCountdown()` - Countdown calculation and rendering
- `setTimerValue()` - Timer number animation helper
- `initializeEvents()` - Sort events + status badge logic + calendar links
- `initializeGalleryFilters()` - Gallery button-based filtering
- `initializeGalleryLightbox()` - Open/close image lightbox
- `initializeContactForm()` - Submit form and show status feedback
- `initializeSectionReveal()` - Scroll-based section fade reveal

## 6. Styling System

### Main Theme Variables (in `css/styles.css`)
- Accent: `#FD9349`
- Base background: `#F1D5B4`
- Card background: `#FFFFFF`

### Design Patterns
- Rounded cards with soft shadows
- Premium spacing and typography hierarchy
- Smooth transitions for hover and motion
- Gradient-based navbar, buttons, and footer

## 7. How to Update Content

### Update Hero Video
Replace file:
- `assets/video/Index.mp4`

### Update Events
Edit event cards in:
- `events.html`
- `event.html`
- `index.html` (preview cards)

For each event card, update:
- `data-date` (YYYY-MM-DD)
- `data-title`
- `data-description`
- `data-location`

### Update Gallery Images
In `gallery.html`, replace `img src` values in `.gallery-card` items.

### Update Contact Email Endpoint
In `contact.html`, edit form `action` URL:
- Current: `https://formspree.io/f/mykdepgv`

## 8. Run Locally
This is a static website. You can run it by opening `index.html` directly in a browser, or with a local server for best behavior:

Example (if you use VS Code Live Server):
- Right click `index.html` -> `Open with Live Server`

## 9. Notes
- `event.html` and `events.html` both exist; keep them in sync if both are used.
- `style.css` is intentionally limited to gallery-specific polish.
- Main site-wide styling should stay in `css/styles.css`.
