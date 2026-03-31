# Mont-Ida Shri Ganesh Mandir Website Documentation

## 1. Project Overview
This is a static community website built with:
- `HTML` for page structure
- `CSS` for layout and visual styling
- `JavaScript` for navigation, events, gallery behavior, and form feedback

The site uses a clean multi-page structure that is easier to maintain for a temple and community organization.

## 2. Canonical Pages
These are the real content pages that should be edited:
- `index.html` - Home page with hero video, countdown, and event preview
- `about/index.html` - About the mandir
- `events/index.html` - Events listing
- `gallery/index.html` - Gallery with filters and lightbox
- `members/index.html` - Committee and members page
- `contact/index.html` - Contact details and contact form

## 3. Legacy Redirect Pages
These root-level files are now compatibility shims that forward visitors to the folder pages:
- `about.html`
- `event.html`
- `events.html`
- `gallery.html`
- `members.html`
- `contact.html`

Do not add page content to those redirect files. Update the folder pages instead.

## 4. Folder Structure
- `assets/images/` - Logos and page images
- `assets/video/` - Hero background videos
- `css/styles.css` - Main shared stylesheet
- `js/script.js` - Shared site behavior
- `about/index.html` - About page
- `events/index.html` - Events page
- `gallery/index.html` - Gallery page
- `members/index.html` - Members page
- `contact/index.html` - Contact page
- `favicon.ico`, `favicon-96x96.png`, `apple-touch-icon.png`, `site.webmanifest` - Site icons and manifest

## 5. Main Features

### Global UI
- Sticky navigation with active link states
- Responsive mobile menu toggle
- Favicon and app icon support
- URL normalization from `/index.html` to folder-style URLs when hosted
- Section reveal animation on scroll

### Home
- Hero video section with overlay
- Countdown timer to the next major event
- Upcoming events preview cards

### About
- Structured temple and community information
- Clear content sections for mission and values

### Events
- Event cards with title, date, location, description, and status
- Automatic event sorting by date
- Google Calendar links generated in JavaScript

### Gallery
- Category filter buttons
- Lightbox image preview
- Responsive card layout

### Members
- Committee and member presentation cards
- Dedicated visual styling for leadership roles

### Contact
- Contact information cards
- Form submission feedback for success and error states

## 6. JavaScript Functions
Main behavior lives in `js/script.js`:
- `normalizeHomeUrl()` - Rewrites `/index.html` to `/` on hosted sites
- `normalizePageUrls()` - Rewrites old root `.html` routes to folder routes on hosted sites
- `initializeNavigation()` - Mobile menu toggle
- `updateCountdown()` - Countdown rendering
- `initializeEvents()` - Event sorting, badges, and calendar links
- `initializeGalleryFilters()` - Gallery filtering
- `initializeGalleryLightbox()` - Lightbox open and close behavior
- `initializeContactForm()` - Contact form submission state
- `initializeSectionReveal()` - Scroll-based reveal animation

## 7. How to Update Content

### Update Home Content
Edit:
- `index.html`

### Update About Content
Edit:
- `about/index.html`

### Update Events
Edit:
- `events/index.html`
- `index.html` for the home-page event preview cards

For each event card, update:
- `data-date` in `YYYY-MM-DD` format
- `data-title`
- `data-description`
- `data-location`

### Update Gallery Images
Edit:
- `gallery/index.html`

### Update Members
Edit:
- `members/index.html`

### Update Contact Details or Form Endpoint
Edit:
- `contact/index.html`

Current form endpoint:
- `https://formspree.io/f/mykdepgv`

## 8. Run Locally
Best option:
- Run the site with a local static server such as VS Code Live Server

You can also open `index.html` directly in a browser. The navigation now points to explicit folder `index.html` files so local browsing is more reliable.

## 9. Notes
- The folder pages are the single source of truth for site content.
- The root `.html` pages only exist to redirect old links safely.
- Main shared styling should stay in `css/styles.css`.
