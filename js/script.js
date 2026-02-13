const eventDate = new Date("September 19, 2026 00:00:00").getTime();

function normalizeHomeUrl() {
    const isWebProtocol = window.location.protocol === "http:" || window.location.protocol === "https:";
    if (!isWebProtocol) {
        return;
    }

    const currentPath = window.location.pathname;
    if (!/\/index\.html$/i.test(currentPath)) {
        return;
    }

    const normalizedPath = currentPath.replace(/\/index\.html$/i, "/");
    const nextUrl = `${normalizedPath}${window.location.search}${window.location.hash}`;
    window.history.replaceState(null, "", nextUrl);
}

function normalizePageUrls() {
    const isWebProtocol = window.location.protocol === "http:" || window.location.protocol === "https:";
    if (!isWebProtocol) {
        return;
    }

    const path = window.location.pathname;
    const pageMap = {
        "/about.html": "/about/",
        "/event.html": "/events/",
        "/events.html": "/events/",
        "/gallery.html": "/gallery/",
        "/members.html": "/members/",
        "/contact.html": "/contact/"
    };

    for (const [from, to] of Object.entries(pageMap)) {
        if (path.toLowerCase().endsWith(from)) {
            const nextPath = path.slice(0, path.length - from.length) + to;
            const nextUrl = `${nextPath}${window.location.search}${window.location.hash}`;
            window.history.replaceState(null, "", nextUrl);
            return;
        }
    }
}

function initializeNavigation() {
    const navToggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (!navToggle || !navLinks) {
        return;
    }

    navToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("open");
            navToggle.setAttribute("aria-expanded", "false");
        });
    });
}

function updateCountdown() {
    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
        return;
    }

    const now = Date.now();
    const distance = eventDate - now;

    if (distance <= 0) {
        daysEl.innerText = "00";
        hoursEl.innerText = "00";
        minutesEl.innerText = "00";
        secondsEl.innerText = "00";
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    setTimerValue(daysEl, days);
    setTimerValue(hoursEl, hours);
    setTimerValue(minutesEl, minutes);
    setTimerValue(secondsEl, seconds);
}

function setTimerValue(element, value) {
    const nextValue = String(value).padStart(2, "0");
    if (element.textContent !== nextValue) {
        element.classList.remove("timer-tick");
        void element.offsetWidth;
        element.classList.add("timer-tick");
    }
    element.textContent = nextValue;
}

function formatDateForGoogleCalendar(dateString) {
    const start = new Date(`${dateString}T00:00:00`);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const toUtcDate = (value) => {
        const year = value.getUTCFullYear();
        const month = String(value.getUTCMonth() + 1).padStart(2, "0");
        const day = String(value.getUTCDate()).padStart(2, "0");
        return `${year}${month}${day}`;
    };

    return `${toUtcDate(start)}/${toUtcDate(end)}`;
}

function initializeEvents() {
    document.querySelectorAll('.events-grid[data-sort="date"]').forEach((grid) => {
        const cards = Array.from(grid.querySelectorAll(".event-card[data-date]"));
        cards
            .sort((a, b) => new Date(a.dataset.date) - new Date(b.dataset.date))
            .forEach((card) => grid.appendChild(card));
    });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    document.querySelectorAll(".event-card[data-date]").forEach((card) => {
        const eventDateValue = new Date(`${card.dataset.date}T00:00:00`);
        const statusEl = card.querySelector(".event-status");

        if (statusEl) {
            statusEl.classList.remove("today", "completed");
            if (eventDateValue < todayStart) {
                statusEl.textContent = "Completed";
                statusEl.classList.add("completed");
            } else if (eventDateValue >= todayStart && eventDateValue < tomorrowStart) {
                statusEl.textContent = "Today";
                statusEl.classList.add("today");
            } else {
                statusEl.textContent = "Upcoming";
            }
        }

        const calendarLink = card.querySelector(".calendar-link");
        if (calendarLink) {
            const title = encodeURIComponent(card.dataset.title || "Temple Event");
            const details = encodeURIComponent(card.dataset.description || "Temple celebration");
            const location = encodeURIComponent(card.dataset.location || "Mont-Ida Shri Ganesh Mandir");
            const dates = formatDateForGoogleCalendar(card.dataset.date);
            calendarLink.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
        }
    });
}

function initializeGalleryFilters() {
    const filterContainer = document.getElementById("gallery-filters");
    const cards = Array.from(document.querySelectorAll(".gallery-card"));

    if (!filterContainer || cards.length === 0) {
        return;
    }

    const normalizeCategory = (value) =>
        String(value || "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

    const formatCategoryLabel = (slug) =>
        String(slug || "")
            .split("-")
            .filter(Boolean)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

    const knownFilters = new Set();
    Array.from(filterContainer.querySelectorAll(".gallery-filter-btn")).forEach((button) => {
        const normalizedFilter = normalizeCategory(button.dataset.filter || button.textContent);
        button.dataset.filter = normalizedFilter || "all";
        knownFilters.add(button.dataset.filter);
    });

    cards.forEach((card) => {
        const title = card.querySelector(".gallery-card-content h3")?.textContent || "";
        const category = normalizeCategory(card.dataset.category || title);
        card.dataset.category = category || "all";

        if (card.dataset.category !== "all" && !knownFilters.has(card.dataset.category)) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "gallery-filter-btn";
            button.dataset.filter = card.dataset.category;
            button.textContent = formatCategoryLabel(card.dataset.category);
            filterContainer.appendChild(button);
            knownFilters.add(card.dataset.category);
        }
    });

    const buttons = Array.from(filterContainer.querySelectorAll(".gallery-filter-btn"));
    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            const selectedFilter = normalizeCategory(button.dataset.filter) || "all";

            buttons.forEach((item) => item.classList.remove("active"));
            button.classList.add("active");

            cards.forEach((card) => {
                const cardCategory = normalizeCategory(card.dataset.category);
                card.hidden = !(selectedFilter === "all" || cardCategory === selectedFilter);
            });
        });
    });
}

function initializeGalleryLightbox() {
    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightbox-image");
    const lightboxCaption = document.getElementById("lightbox-caption");

    if (!lightbox || !lightboxImage || !lightboxCaption) {
        return;
    }

    const closeButton = lightbox.querySelector(".lightbox-close");

    const openLightbox = (src, caption) => {
        lightboxImage.src = src;
        lightboxCaption.textContent = caption;
        lightbox.classList.add("open");
        lightbox.setAttribute("aria-hidden", "false");
    };

    const closeLightbox = () => {
        lightbox.classList.remove("open");
        lightbox.setAttribute("aria-hidden", "true");
        lightboxImage.src = "";
    };

    document.querySelectorAll(".gallery-item").forEach((item) => {
        item.addEventListener("click", () => {
            const image = item.querySelector("img");
            if (!image) {
                return;
            }
            openLightbox(image.src, item.dataset.caption || image.alt || "Gallery image");
        });
    });

    if (closeButton) {
        closeButton.addEventListener("click", closeLightbox);
    }

    lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && lightbox.classList.contains("open")) {
            closeLightbox();
        }
    });
}

function initializeContactForm() {
    const form = document.getElementById("contact-form");
    const status = document.getElementById("form-status");
    const submitButton = document.getElementById("contact-submit");

    if (!form || !status || !submitButton) {
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        status.textContent = "Sending...";
        status.className = "form-status";
        submitButton.disabled = true;

        try {
            const response = await fetch(form.action, {
                method: "POST",
                body: new FormData(form),
                headers: {
                    Accept: "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Request failed");
            }

            form.reset();
            status.textContent = "Message sent successfully.";
            status.classList.add("success");
        } catch (_error) {
            status.textContent = "Message failed to send. Please try again.";
            status.classList.add("error");
        } finally {
            submitButton.disabled = false;
        }
    });
}

function initializePlaceholderLinks() {
    document.querySelectorAll('a[href="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
        });
    });
}

function initializeSectionReveal() {
    const sections = document.querySelectorAll("section");

    if (sections.length === 0) {
        return;
    }

    sections.forEach((section) => {
        section.classList.add("reveal-section");
        if (section.classList.contains("hero") || section.classList.contains("page-hero")) {
            section.classList.add("is-visible");
        }
    });

    if (!("IntersectionObserver" in window)) {
        sections.forEach((section) => section.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    sections.forEach((section) => {
        if (!section.classList.contains("hero") && !section.classList.contains("page-hero")) {
            observer.observe(section);
        }
    });
}

normalizeHomeUrl();
normalizePageUrls();
initializeNavigation();
initializePlaceholderLinks();
initializeEvents();
initializeGalleryFilters();
initializeGalleryLightbox();
initializeContactForm();
initializeSectionReveal();
setInterval(updateCountdown, 1000);
updateCountdown();
