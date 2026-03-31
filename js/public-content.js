(async function initializePublicSupabaseContent() {
    const config = window.siteSupabaseConfig;
    const supabaseLib = window.supabase;

    if (!config || !supabaseLib) {
        return;
    }

    const url = String(config.url || "").trim();
    const anonKey = String(config.anonKey || "").trim();

    if (!url || !anonKey) {
        return;
    }

    const bucket = String(config.bucket || "site-media").trim() || "site-media";
    const client = supabaseLib.createClient(url, anonKey);

    const escapeHtml = (value) =>
        String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

    const getPublicImageUrl = (path) => {
        if (!path) {
            return "";
        }

        if (/^https?:\/\//i.test(path)) {
            return path;
        }

        return client.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    };

    const videoExtensions = new Set(["mp4", "webm", "ogg", "ogv", "mov", "m4v"]);
    const getPathExtension = (value) => String(value || "").split("?")[0].split(".").pop().toLowerCase();

    const getMediaTypeFromPath = (path) =>
        videoExtensions.has(getPathExtension(path))
            ? "video"
            : "image";

    const buildGalleryMediaItem = (path) => {
        const url = getPublicImageUrl(path);

        if (!url) {
            return null;
        }

        return {
            url,
            type: getMediaTypeFromPath(path)
        };
    };

    const formatEventDate = (isoValue) => {
        if (!isoValue) {
            return "";
        }

        return new Intl.DateTimeFormat("en-MU", {
            dateStyle: "long",
            timeStyle: "short",
            timeZone: "Indian/Mauritius"
        }).format(new Date(isoValue));
    };

    const normalizeCategorySlug = (value) =>
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

    const uniquePaths = (paths) => Array.from(new Set(paths.filter(Boolean)));
    const errorText = (error) => String(error?.message || error?.details || "").toLowerCase();
    const isMissingPublishAtColumnError = (error) =>
        errorText(error).includes("publish_at") &&
        (errorText(error).includes("does not exist") || errorText(error).includes("column"));

    const renderEventCard = (event) => {
        const startIso = new Date(event.start_at).toISOString();
        const imageUrl = getPublicImageUrl(event.image_path);
        const description = escapeHtml(event.description || "Temple celebration");
        const location = escapeHtml(event.location || "Mont-Ida Shri Ganesh Mandir, Mauritius");
        const title = escapeHtml(event.title || "Temple Event");

        return `
            <article class="event-card" data-date="${escapeHtml(startIso)}" data-title="${title}"
                data-description="${description}" data-location="${location}">
                ${imageUrl ? `<img class="event-image" src="${escapeHtml(imageUrl)}" alt="${title}" loading="lazy">` : ""}
                <div class="event-card-body">
                    <div class="event-head">
                        <h3>${title}</h3>
                        <span class="event-status">Upcoming</span>
                    </div>
                    <div class="event-meta">
                        <p><span class="meta-label">Date</span><time datetime="${escapeHtml(startIso)}">${escapeHtml(formatEventDate(event.start_at))}</time></p>
                        <p><span class="meta-label">Location</span>${location}</p>
                    </div>
                    <p>${description}</p>
                    <div class="event-actions">
                        <a class="btn btn-outline btn-small calendar-link" href="#" target="_blank" rel="noopener">Add To Calendar</a>
                    </div>
                </div>
            </article>
        `;
    };

    const updateNextEventCopy = (event) => {
        if (!event) {
            return;
        }

        const heading = document.querySelector("[data-next-event-heading]");
        const copy = document.querySelector("[data-next-event-copy]");

        if (heading) {
            heading.textContent = "Next major celebration";
        }

        if (!copy) {
            return;
        }

        const title = String(event.title || "the next celebration").trim();
        copy.textContent = `The community is counting down to ${title}.`;
    };

    const renderGalleryTile = (media, title, index, extraCount = 0) => `
        <div class="gallery-photo-tile${media?.type === "video" ? " has-video" : ""}" data-gallery-index="${index}">
            ${media?.type === "video"
                ? `<video muted playsinline preload="metadata" aria-label="${title}">
                        <source src="${escapeHtml(media.url)}">
                    </video>
                    <span class="gallery-media-kind">Video</span>`
                : `<img src="${escapeHtml(media?.url || "")}" alt="${title}" loading="lazy">`}
            ${extraCount > 0 ? `<span class="gallery-photo-more">+${extraCount}</span>` : ""}
        </div>
    `;

    const renderGalleryMosaic = (previewMedia, title, mediaCount) => {
        const count = previewMedia.length || 1;

        if (count === 1) {
            return `
                <div class="gallery-mosaic gallery-mosaic--count-1">
                    ${renderGalleryTile(previewMedia[0], title, 0)}
                </div>
            `;
        }

        if (count === 2) {
            return `
                <div class="gallery-mosaic gallery-mosaic--count-2">
                    ${previewMedia.map((media, index) => renderGalleryTile(media, title, index)).join("")}
                </div>
            `;
        }

        if (count >= 3) {
            return `
                <div class="gallery-mosaic gallery-mosaic--count-3plus">
                    ${renderGalleryTile(previewMedia[0], title, 0)}
                    ${renderGalleryTile(previewMedia[1], title, 1)}
                    ${renderGalleryTile(previewMedia[2], title, 2, mediaCount > 3 ? mediaCount - 3 : 0)}
                </div>
            `;
        }
    };

    const renderGalleryCard = (item, photoPaths = []) => {
        const mediaItems = uniquePaths(photoPaths).map(buildGalleryMediaItem).filter(Boolean);
        const title = escapeHtml(item.title || "Gallery Image");
        const description = escapeHtml(item.description || "");
        const caption = escapeHtml(item.description || item.title || "Gallery image");
        const category = escapeHtml(normalizeCategorySlug(item.category) || "community-gathering");
        const categoryLabel = escapeHtml(formatCategoryLabel(category));
        const previewMedia = mediaItems.slice(0, 3);
        const mediaCount = mediaItems.length || 1;
        const mediaCountLabel = `${mediaCount} ${mediaCount === 1 ? "item" : "items"}`;
        const galleryMedia = escapeHtml(JSON.stringify(mediaItems));

        return `
            <article class="gallery-card" data-category="${category}">
                <button class="gallery-item" type="button" data-caption="${caption}" data-gallery-media="${galleryMedia}">
                    ${renderGalleryMosaic(previewMedia, title, mediaCount)}
                    <div class="gallery-card-content">
                        <div class="gallery-card-meta">
                            <span class="gallery-card-pill">${escapeHtml(mediaCountLabel)}</span>
                            <span class="gallery-card-pill">${categoryLabel}</span>
                        </div>
                        <h3>${title}</h3>
                        <p>${description}</p>
                    </div>
                </button>
            </article>
        `;
    };

    const loadGalleryPhotoMap = async (itemIds) => {
        if (!Array.isArray(itemIds) || itemIds.length === 0) {
            return new Map();
        }

        const { data, error } = await client
            .from("gallery_item_photos")
            .select("gallery_item_id, image_path, sort_order, created_at")
            .in("gallery_item_id", itemIds)
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: true });

        if (error || !data) {
            return new Map();
        }

        const photoMap = new Map();

        data.forEach((photo) => {
            if (!photoMap.has(photo.gallery_item_id)) {
                photoMap.set(photo.gallery_item_id, []);
            }

            photoMap.get(photo.gallery_item_id).push(photo.image_path);
        });

        return photoMap;
    };

    const loadEvents = async () => {
        const nowIso = new Date().toISOString();
        let { data, error } = await client
            .from("events")
            .select("id, title, description, location, start_at, end_at, image_path, published, publish_at")
            .eq("published", true)
            .or(`publish_at.is.null,publish_at.lte.${nowIso}`)
            .order("start_at", { ascending: true });

        if (error && isMissingPublishAtColumnError(error)) {
            ({ data, error } = await client
                .from("events")
                .select("id, title, description, location, start_at, end_at, image_path, published")
                .eq("published", true)
                .order("start_at", { ascending: true }));
        }

        if (error || !data || data.length === 0) {
            return;
        }

        const now = Date.now();
        const upcomingEvents = data.filter((event) => new Date(event.start_at).getTime() >= now);
        const nextEvent = upcomingEvents[0] || data[0];
        const homeEvents = (upcomingEvents.length > 0 ? upcomingEvents : data).slice(0, 2);

        window.setCountdownTarget?.(nextEvent.start_at);
        updateNextEventCopy(nextEvent);

        const homeGrid = document.querySelector('[data-dynamic-events="home"]');
        if (homeGrid) {
            homeGrid.innerHTML = homeEvents.map(renderEventCard).join("");
        }

        const eventsGrid = document.querySelector('[data-dynamic-events="events"]');
        if (eventsGrid) {
            eventsGrid.innerHTML = data.map(renderEventCard).join("");
        }

        window.reinitializeEvents?.();
    };

    const loadGallery = async () => {
        const nowIso = new Date().toISOString();
        let { data, error } = await client
            .from("gallery_items")
            .select("id, title, description, category, image_path, published, publish_at, created_at")
            .eq("published", true)
            .or(`publish_at.is.null,publish_at.lte.${nowIso}`)
            .order("created_at", { ascending: false });

        if (error && isMissingPublishAtColumnError(error)) {
            ({ data, error } = await client
                .from("gallery_items")
                .select("id, title, description, category, image_path, published, created_at")
                .eq("published", true)
                .order("created_at", { ascending: false }));
        }

        if (error || !data || data.length === 0) {
            return;
        }

        const galleryGrid = document.querySelector("[data-dynamic-gallery]");
        if (!galleryGrid) {
            return;
        }

        const photoMap = await loadGalleryPhotoMap(data.map((item) => item.id));

        galleryGrid.innerHTML = data
            .map((item) => {
                const photoPaths = uniquePaths([
                    item.image_path,
                    ...(photoMap.get(item.id) || [])
                ]);

                return renderGalleryCard(item, photoPaths);
            })
            .join("");
        window.reinitializeGalleryFilters?.();
        window.reinitializeGalleryLightbox?.();
    };

    await Promise.all([loadEvents(), loadGallery()]);
})();
