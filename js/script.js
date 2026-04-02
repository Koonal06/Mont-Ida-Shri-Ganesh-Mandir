let eventDate = new Date("September 19, 2026 00:00:00").getTime();

function normalizeSiteUrls() {
    const isWebProtocol = window.location.protocol === "http:" || window.location.protocol === "https:";
    if (!isWebProtocol) {
        return;
    }

    const legacyMap = {
        "/about.html": "/about/",
        "/event.html": "/events/",
        "/events.html": "/events/",
        "/gallery.html": "/gallery/",
        "/members.html": "/members/",
        "/contact.html": "/contact/"
    };

    const path = window.location.pathname;

    for (const [from, to] of Object.entries(legacyMap)) {
        if (path.toLowerCase().endsWith(from)) {
            const nextPath = path.slice(0, path.length - from.length) + to;
            const nextUrl = `${nextPath}${window.location.search}${window.location.hash}`;
            window.history.replaceState(null, "", nextUrl);
            return;
        }
    }

    if (/\/index\.html$/i.test(path)) {
        const normalizedPath = path.replace(/\/index\.html$/i, "/");
        const nextUrl = `${normalizedPath}${window.location.search}${window.location.hash}`;
        window.history.replaceState(null, "", nextUrl);
    }
}

function initializeNavbarState() {
    const navbar = document.querySelector(".navbar");

    if (!navbar) {
        return;
    }

    const applyState = () => {
        navbar.classList.toggle("scrolled", window.scrollY > 16);
    };

    applyState();
    window.addEventListener("scroll", applyState, { passive: true });
}

function initializeNavigation() {
    const navToggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (!navToggle || !navLinks) {
        return;
    }

    const setMenuState = (isOpen) => {
        navLinks.classList.toggle("open", isOpen);
        navToggle.setAttribute("aria-expanded", String(isOpen));
        document.body.classList.toggle("nav-open", isOpen);
    };

    const closeMenu = () => setMenuState(false);

    navToggle.addEventListener("click", () => {
        const isOpen = !navLinks.classList.contains("open");
        setMenuState(isOpen);
    });

    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
        if (!navLinks.classList.contains("open")) {
            return;
        }

        if (!navLinks.contains(event.target) && !navToggle.contains(event.target)) {
            closeMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) {
            closeMenu();
        }
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
        daysEl.textContent = "00";
        hoursEl.textContent = "00";
        minutesEl.textContent = "00";
        secondsEl.textContent = "00";
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

function setCountdownTarget(nextDate) {
    const timestamp = new Date(nextDate).getTime();

    if (Number.isNaN(timestamp)) {
        return;
    }

    eventDate = timestamp;
    updateCountdown();
}

function formatDateForGoogleCalendar(dateString) {
    const start = new Date(dateString);
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
        const eventDateValue = new Date(card.dataset.date);
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
    const galleryGrid = document.getElementById("gallery-grid") || document.querySelector(".gallery-grid");
    const hiddenFilters = new Set(["festival-decorations", "diwali-lights", "youth-programs"]);

    if (!filterContainer || !galleryGrid) {
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

    const syncFilterButtons = () => {
        const knownFilters = new Set();
        const buttons = Array.from(filterContainer.querySelectorAll(".gallery-filter-btn"));

        buttons.forEach((button) => {
            const normalizedFilter = normalizeCategory(button.dataset.filter || button.textContent);

            if (normalizedFilter !== "all" && hiddenFilters.has(normalizedFilter)) {
                button.remove();
                return;
            }

            button.dataset.filter = normalizedFilter || "all";
            button.setAttribute("aria-pressed", String(button.classList.contains("active")));
            knownFilters.add(button.dataset.filter);
        });

        Array.from(galleryGrid.querySelectorAll(".gallery-card")).forEach((card) => {
            const title = card.querySelector(".gallery-card-content h3")?.textContent || "";
            const category = normalizeCategory(card.dataset.category || title);
            card.dataset.category = category || "all";

            if (
                card.dataset.category !== "all" &&
                !hiddenFilters.has(card.dataset.category) &&
                !knownFilters.has(card.dataset.category)
            ) {
                const button = document.createElement("button");
                button.type = "button";
                button.className = "gallery-filter-btn";
                button.dataset.filter = card.dataset.category;
                button.textContent = formatCategoryLabel(card.dataset.category);
                button.setAttribute("aria-pressed", "false");
                filterContainer.appendChild(button);
                knownFilters.add(card.dataset.category);
            }
        });
    };

    const activateFilter = (selectedFilter) => {
        const normalizedFilter = normalizeCategory(selectedFilter) || "all";
        const resolvedFilter =
            normalizedFilter !== "all" && hiddenFilters.has(normalizedFilter)
                ? "all"
                : normalizedFilter;

        Array.from(filterContainer.querySelectorAll(".gallery-filter-btn")).forEach((button) => {
            const isActive = (normalizeCategory(button.dataset.filter) || "all") === resolvedFilter;
            button.classList.toggle("active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });

        Array.from(galleryGrid.querySelectorAll(".gallery-card")).forEach((card) => {
            const cardCategory = normalizeCategory(card.dataset.category);
            card.hidden = !(resolvedFilter === "all" || cardCategory === resolvedFilter);
        });
    };

    syncFilterButtons();

    if (filterContainer.dataset.filterReady !== "true") {
        filterContainer.addEventListener("click", (event) => {
            const button = event.target.closest(".gallery-filter-btn");

            if (!button || !filterContainer.contains(button)) {
                return;
            }

            activateFilter(button.dataset.filter || button.textContent);
        });

        filterContainer.dataset.filterReady = "true";
    }

    const activeButton = filterContainer.querySelector(".gallery-filter-btn.active");
    activateFilter(activeButton?.dataset.filter || "all");
}

function initializeGalleryLightbox() {
    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightbox-image");
    const lightboxVideo = document.getElementById("lightbox-video");
    const lightboxCaption = document.getElementById("lightbox-caption");
    const lightboxCounter = document.getElementById("lightbox-counter");

    if (!lightbox || !lightboxImage || !lightboxVideo || !lightboxCaption || !lightboxCounter) {
        return;
    }

    const closeButton = lightbox.querySelector(".lightbox-close");
    const prevButton = document.getElementById("lightbox-prev");
    const nextButton = document.getElementById("lightbox-next");
    const videoExtensions = new Set(["mp4", "webm", "ogg", "ogv", "mov", "m4v"]);
    const getPathExtension = (value) => String(value || "").split("?")[0].split(".").pop().toLowerCase();
    const normalizeMediaType = (value) => value === "video" ? "video" : "image";
    const inferMediaTypeFromUrl = (value) => videoExtensions.has(getPathExtension(value)) ? "video" : "image";
    const normalizeMediaEntry = (entry) => {
        if (!entry) {
            return null;
        }

        if (typeof entry === "string") {
            return {
                url: entry,
                type: inferMediaTypeFromUrl(entry)
            };
        }

        const url = String(entry.url || entry.src || "").trim();

        if (!url) {
            return null;
        }

        return {
            url,
            type: normalizeMediaType(entry.type || inferMediaTypeFromUrl(url))
        };
    };

    const extractDatasetMedia = (item) => {
        const normalizedMedia = [];

        if (item.dataset.galleryMedia) {
            try {
                const parsedMedia = JSON.parse(item.dataset.galleryMedia);
                if (Array.isArray(parsedMedia)) {
                    normalizedMedia.push(...parsedMedia.map(normalizeMediaEntry).filter(Boolean));
                }
            } catch (error) {
                // Ignore invalid dataset payloads and fall back to embedded elements.
            }
        }

        if (normalizedMedia.length === 0 && item.dataset.galleryImages) {
            try {
                const parsedImages = JSON.parse(item.dataset.galleryImages);
                if (Array.isArray(parsedImages)) {
                    normalizedMedia.push(...parsedImages.map(normalizeMediaEntry).filter(Boolean));
                }
            } catch (error) {
                // Ignore invalid legacy payloads and fall back to embedded elements.
            }
        }

        return normalizedMedia;
    };

    const extractEmbeddedMedia = (item) =>
        Array.from(item.querySelectorAll("img, video"))
            .map((element) => {
                const url = element.currentSrc || element.src || element.getAttribute("src") || "";

                if (!url) {
                    return null;
                }

                return {
                    url,
                    type: element.tagName.toLowerCase() === "video" ? "video" : "image"
                };
            })
            .filter(Boolean);

    const uniqueMedia = (items) => {
        const seen = new Set();

        return items.filter((item) => {
            const key = `${item.type}:${item.url}`;

            if (!item.url || seen.has(key)) {
                return false;
            }

            seen.add(key);
            return true;
        });
    };

    const resetLightboxVideo = () => {
        lightboxVideo.pause();
        lightboxVideo.removeAttribute("src");
        lightboxVideo.load();
        lightboxVideo.hidden = true;
    };

    const lightboxState = window.siteLightboxState || (window.siteLightboxState = {
        currentMedia: [],
        activeMediaIndex: 0,
        currentCaption: ""
    });

    const updateLightbox = () => {
        const activeMedia = lightboxState.currentMedia[lightboxState.activeMediaIndex] || null;

        if (!activeMedia) {
            return;
        }

        if (activeMedia.type === "video") {
            lightboxImage.hidden = true;
            lightboxImage.src = "";
            lightboxImage.alt = "Expanded gallery media";
            lightboxVideo.hidden = false;
            lightboxVideo.src = activeMedia.url;
            lightboxVideo.load();
            void lightboxVideo.play().catch(() => {});
        } else {
            resetLightboxVideo();
            lightboxImage.hidden = false;
            lightboxImage.src = activeMedia.url;
            lightboxImage.alt = lightboxState.currentCaption || "Expanded gallery image";
        }

        lightboxCaption.textContent = lightboxState.currentCaption;
        lightboxCounter.textContent = lightboxState.currentMedia.length > 1
            ? `Media ${lightboxState.activeMediaIndex + 1} of ${lightboxState.currentMedia.length}`
            : "Media";
        if (prevButton) {
            prevButton.hidden = lightboxState.currentMedia.length <= 1;
        }
        if (nextButton) {
            nextButton.hidden = lightboxState.currentMedia.length <= 1;
        }
    };

    const openLightbox = (mediaItems, caption, startIndex = 0) => {
        lightboxState.currentMedia = mediaItems.filter((item) => item?.url);

        if (lightboxState.currentMedia.length === 0) {
            return;
        }

        lightboxState.activeMediaIndex = Math.min(Math.max(startIndex, 0), lightboxState.currentMedia.length - 1);
        lightboxState.currentCaption = caption;
        updateLightbox();
        lightbox.classList.add("open");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.classList.add("lightbox-open");
        closeButton?.focus();
    };

    const closeLightbox = () => {
        lightbox.classList.remove("open");
        lightbox.setAttribute("aria-hidden", "true");
        lightboxImage.src = "";
        lightboxImage.alt = "Expanded gallery image";
        lightboxImage.hidden = false;
        resetLightboxVideo();
        lightboxCaption.textContent = "";
        lightboxCounter.textContent = "";
        lightboxState.currentMedia = [];
        lightboxState.activeMediaIndex = 0;
        lightboxState.currentCaption = "";
        document.body.classList.remove("lightbox-open");
    };

    const changeImage = (direction) => {
        if (lightboxState.currentMedia.length <= 1) {
            return;
        }

        lightboxState.activeMediaIndex = (
            lightboxState.activeMediaIndex + direction + lightboxState.currentMedia.length
        ) % lightboxState.currentMedia.length;
        updateLightbox();
    };

    document.querySelectorAll(".gallery-item").forEach((item) => {
        if (item.dataset.lightboxReady === "true") {
            return;
        }

        item.addEventListener("click", (event) => {
            const mediaItems = uniqueMedia([
                ...extractDatasetMedia(item),
                ...extractEmbeddedMedia(item)
            ]);

            if (mediaItems.length === 0) {
                return;
            }

            const clickedTile = event.target.closest("[data-gallery-index]");
            const requestedIndex = clickedTile ? Number(clickedTile.getAttribute("data-gallery-index")) : 0;
            const safeIndex = Number.isFinite(requestedIndex) ? requestedIndex : 0;

            openLightbox(
                mediaItems,
                item.dataset.caption || "Gallery image",
                safeIndex
            );
        });

        item.dataset.lightboxReady = "true";
    });

    if (closeButton && closeButton.dataset.lightboxReady !== "true") {
        closeButton.addEventListener("click", closeLightbox);
        closeButton.dataset.lightboxReady = "true";
    }

    if (prevButton && prevButton.dataset.lightboxReady !== "true") {
        prevButton.addEventListener("click", () => changeImage(-1));
        prevButton.dataset.lightboxReady = "true";
    }

    if (nextButton && nextButton.dataset.lightboxReady !== "true") {
        nextButton.addEventListener("click", () => changeImage(1));
        nextButton.dataset.lightboxReady = "true";
    }

    if (lightbox.dataset.lightboxReady !== "true") {
        lightbox.addEventListener("click", (event) => {
            if (event.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && lightbox.classList.contains("open")) {
                closeLightbox();
                return;
            }

            if (event.key === "ArrowLeft" && lightbox.classList.contains("open")) {
                changeImage(-1);
                return;
            }

            if (event.key === "ArrowRight" && lightbox.classList.contains("open")) {
                changeImage(1);
            }
        });

        lightbox.dataset.lightboxReady = "true";
    }
}

function initializeContactForm() {
    const form = document.getElementById("contact-form");
    const status = document.getElementById("form-status");
    const submitButton = document.getElementById("contact-submit");

    if (!form || !status || !submitButton || form.dataset.formReady === "true") {
        return;
    }

    const defaultButtonText = submitButton.textContent;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        status.textContent = "Sending your message...";
        status.className = "form-status";
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";

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
            status.textContent = "Message sent successfully. Thank you for reaching out.";
            status.classList.add("success");
        } catch (_error) {
            status.textContent = "Message failed to send. Please try again.";
            status.classList.add("error");
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = defaultButtonText;
        }
    });

    form.dataset.formReady = "true";
}

function initializePlaceholderLinks() {
    document.querySelectorAll('a[href="#"]').forEach((link) => {
        if (link.dataset.placeholderReady === "true") {
            return;
        }

        link.addEventListener("click", (event) => {
            const href = (link.getAttribute("href") || "").trim();
            if (href === "#" || href === "") {
                event.preventDefault();
            }
        });

        link.dataset.placeholderReady = "true";
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

window.setCountdownTarget = setCountdownTarget;
window.reinitializeEvents = initializeEvents;
window.reinitializeGalleryFilters = initializeGalleryFilters;
window.reinitializeGalleryLightbox = initializeGalleryLightbox;

normalizeSiteUrls();
initializeNavbarState();
initializeNavigation();
initializePlaceholderLinks();
initializeEvents();
initializeGalleryFilters();
initializeGalleryLightbox();
initializeContactForm();
initializeSectionReveal();
setInterval(updateCountdown, 1000);
updateCountdown();
