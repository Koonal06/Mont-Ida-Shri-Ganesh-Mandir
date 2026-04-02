(function initializeAdminApp() {
    const config = window.siteSupabaseConfig;
    const supabaseLib = window.supabase;

    const loginPanel = document.getElementById("admin-login-panel");
    const dashboardPanel = document.getElementById("admin-dashboard");
    const loginForm = document.getElementById("admin-login-form");
    const logoutButton = document.getElementById("admin-logout");
    const loginStatus = document.getElementById("admin-login-status");
    const configStatus = document.getElementById("admin-config-status");
    const dashboardStatus = document.getElementById("admin-dashboard-status");
    const adminEmail = document.getElementById("admin-email");
    const eventForm = document.getElementById("event-form");
    const galleryForm = document.getElementById("gallery-form");
    const occasionForm = document.getElementById("occasion-form");
    const eventStatus = document.getElementById("event-form-status");
    const galleryStatus = document.getElementById("gallery-form-status");
    const occasionStatus = document.getElementById("occasion-form-status");
    const eventsList = document.getElementById("admin-events-list");
    const galleryList = document.getElementById("admin-gallery-list");
    const occasionList = document.getElementById("admin-occasion-list");
    const galleryPagination = document.getElementById("admin-gallery-pagination");
    const eventCountValue = document.getElementById("admin-event-count");
    const galleryCountValue = document.getElementById("admin-gallery-count");
    const occasionCountValue = document.getElementById("admin-occasion-count");
    const lastSyncValue = document.getElementById("admin-last-sync");
    const passwordInput = document.getElementById("admin-password-input");
    const passwordToggle = document.getElementById("admin-password-toggle");
    const galleryImageInput = document.getElementById("gallery-image");
    const eventPublishCheckbox = document.getElementById("event-published");
    const eventScheduleField = document.getElementById("event-schedule-field");
    const eventPublishAtInput = document.getElementById("event-publish-at");
    const galleryPublishCheckbox = document.getElementById("gallery-published");
    const galleryScheduleField = document.getElementById("gallery-schedule-field");
    const galleryPublishAtInput = document.getElementById("gallery-publish-at");
    const occasionIdInput = document.getElementById("occasion-id");
    const occasionTitleInput = document.getElementById("occasion-title");
    const occasionFestivalInput = document.getElementById("occasion-festival-name");
    const occasionTypeInput = document.getElementById("occasion-animation-type");
    const occasionStartInput = document.getElementById("occasion-start-date");
    const occasionEndInput = document.getElementById("occasion-end-date");
    const occasionEnabledCheckbox = document.getElementById("occasion-enabled");
    const occasionDisableMobileCheckbox = document.getElementById("occasion-disable-mobile");
    const occasionPreviewButton = document.getElementById("occasion-preview-button");
    const occasionCancelButton = document.getElementById("occasion-cancel-button");
    const occasionPreviewStage = document.getElementById("occasion-preview-stage");
    const occasionPreviewTitle = document.getElementById("occasion-preview-title");
    const occasionPreviewMeta = document.getElementById("occasion-preview-meta");
    const occasionThemeHeading = document.getElementById("occasion-theme-heading");
    const occasionThemeDescription = document.getElementById("occasion-theme-description");
    const occasionThemeEffects = document.getElementById("occasion-theme-effects");
    const occasionCustomFields = document.getElementById("occasion-custom-fields");
    const occasionTargetInputs = Array.from(document.querySelectorAll('input[name="target_pages"]'));
    const occasionIntensityInputs = Array.from(document.querySelectorAll('input[name="intensity"]'));
    const occasionCustomSettingInputs = Array.from(document.querySelectorAll("[data-occasion-setting]"));
    const adminRoute = document.body?.dataset?.adminRoute || "login";
    const isDashboardRoute = adminRoute === "dashboard";
    const isLoginRoute = adminRoute === "login";
    const dashboardUrl = new URL("/admin/", window.location.origin).toString();
    const loginUrl = new URL("/admin/login.html", window.location.origin).toString();
    const notFoundUrl = new URL("/404.html", window.location.origin).toString();

    if (!loginPanel || !dashboardPanel || !loginForm || !logoutButton || !configStatus) {
        return;
    }

    const markAdminReady = () => {
        if (document.body) {
            document.body.dataset.adminReady = "true";
        }
    };

    const redirectToNotFound = () => {
        window.location.replace(notFoundUrl);
    };

    const setStatus = (element, message, type = "") => {
        if (!element) {
            return;
        }

        element.className = "status-note";
        if (type) {
            element.classList.add(type);
        }
        element.textContent = message;
    };

    const setMetricValue = (element, value) => {
        if (element) {
            element.textContent = value;
        }
    };

    if (!config || !supabaseLib || !config.url || !config.anonKey) {
        setStatus(
            configStatus,
            "Add your Supabase URL and anon key in js/supabase-config.js before using the admin page.",
            "error"
        );
        markAdminReady();
        return;
    }

    const client = supabaseLib.createClient(config.url, config.anonKey);
    const bucket = String(config.bucket || "site-media").trim() || "site-media";
    const occasionAnimationLibrary = window.siteOccasionAnimations;
    const galleryCategories = [
        { value: "festival-decorations", label: "Festival Decorations" },
        { value: "cultural-dance", label: "Cultural Dance" },
        { value: "prayer-ceremony", label: "Prayer Ceremony" },
        { value: "community-gathering", label: "Community Gathering" },
        { value: "diwali-lights", label: "Diwali Lights" },
        { value: "youth-programs", label: "Youth Programs" }
    ];
    const allowedGalleryCategories = new Set(galleryCategories.map((item) => item.value));
    const occasionFestivalThemes = occasionAnimationLibrary?.festivalThemes || [];
    const occasionAnimationTypes = occasionAnimationLibrary?.customAnimationTypes || occasionAnimationLibrary?.animationTypes || [];
    const occasionIntensityLevels = occasionAnimationLibrary?.intensityLevels || [];
    const occasionTargetPages = occasionAnimationLibrary?.targetPages || [];
    const allowedOccasionFestivalNames = new Set(occasionFestivalThemes.map((item) => item.value));
    const allowedOccasionAnimationTypes = new Set(occasionAnimationTypes.map((item) => item.value));
    const allowedOccasionIntensityLevels = new Set(occasionIntensityLevels.map((item) => item.value));
    const galleryPostsPerPage = 6;
    let galleryPage = 1;
    const expandedGalleryPosts = new Set();
    let occasionPreviewController = null;

    const escapeHtml = (value) =>
        String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

    const formatDateTime = (isoValue) => {
        if (!isoValue) {
            return "";
        }

        return new Intl.DateTimeFormat("en-MU", {
            dateStyle: "medium",
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

    const getMediaTypeFromFile = (file) => {
        const mimeType = String(file?.type || "").toLowerCase();

        if (mimeType.startsWith("video/")) {
            return "video";
        }

        if (mimeType.startsWith("image/")) {
            return "image";
        }

        return getMediaTypeFromPath(file?.name || "");
    };

    const renderAdminMedia = (path, altText, fallbackText = "No media") => {
        const mediaUrl = getPublicImageUrl(path);

        if (!mediaUrl) {
            return `<div class="admin-item-media-fallback">${escapeHtml(fallbackText)}</div>`;
        }

        const mediaType = getMediaTypeFromPath(path);

        if (mediaType === "video") {
            return `
                <video src="${escapeHtml(mediaUrl)}" muted playsinline preload="metadata" aria-label="${escapeHtml(altText)}"></video>
                <span class="admin-media-badge">Video</span>
            `;
        }

        return `<img src="${escapeHtml(mediaUrl)}" alt="${escapeHtml(altText)}">`;
    };

    const formatCategoryLabel = (value) => {
        const normalizedValue = normalizeCategorySlug(value);
        const matchedCategory = galleryCategories.find((item) => item.value === normalizedValue);

        if (matchedCategory) {
            return matchedCategory.label;
        }

        return normalizedValue
            .split("-")
            .filter(Boolean)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ") || "Community Gathering";
    };

    const formatDateLabel = (value) => {
        if (!value) {
            return "";
        }

        return new Intl.DateTimeFormat("en-MU", {
            dateStyle: "medium",
            timeZone: "Indian/Mauritius"
        }).format(new Date(`${value}T00:00:00`));
    };

    const getCheckedOccasionPages = () =>
        occasionTargetInputs
            .filter((input) => input.checked)
            .map((input) => input.value);

    const getSelectedOccasionIntensity = () =>
        occasionIntensityInputs.find((input) => input.checked)?.value || "medium";

    const getSelectedOccasionFestival = () =>
        String(occasionFestivalInput?.value || "").trim();

    const getOccasionThemeSettings = () => {
        const settings = {};

        occasionCustomSettingInputs.forEach((input) => {
            const key = input.getAttribute("data-occasion-setting");

            if (key) {
                settings[key] = Boolean(input.checked);
            }
        });

        return settings;
    };

    const setOccasionThemeSettings = (value) => {
        const normalizedSettings = occasionAnimationLibrary?.normalizeThemeSettings(value || {}) || {};

        occasionCustomSettingInputs.forEach((input) => {
            const key = input.getAttribute("data-occasion-setting");

            if (key) {
                input.checked = Boolean(normalizedSettings[key]);
            }
        });
    };

    const setOccasionTargetSelection = (values) => {
        const normalizedPages = occasionAnimationLibrary?.normalizeTargetPages(values || []) || ["all"];
        const selectedValues = new Set(normalizedPages.length > 0 ? normalizedPages : ["all"]);

        occasionTargetInputs.forEach((input) => {
            input.checked = selectedValues.has(input.value);
        });

        if (!occasionTargetInputs.some((input) => input.checked)) {
            const allInput = occasionTargetInputs.find((input) => input.value === "all");

            if (allInput) {
                allInput.checked = true;
            }
        }
    };

    const syncOccasionTargetSelection = (changedInput) => {
        if (!changedInput) {
            return;
        }

        if (changedInput.value === "all" && changedInput.checked) {
            occasionTargetInputs.forEach((input) => {
                if (input !== changedInput) {
                    input.checked = false;
                }
            });
            return;
        }

        if (changedInput.value !== "all" && changedInput.checked) {
            const allInput = occasionTargetInputs.find((input) => input.value === "all");

            if (allInput) {
                allInput.checked = false;
            }
        }

        if (!occasionTargetInputs.some((input) => input.checked)) {
            const allInput = occasionTargetInputs.find((input) => input.value === "all");

            if (allInput) {
                allInput.checked = true;
            }
        }
    };

    const syncOccasionFestivalUi = (festivalNameInput, options = {}) => {
        const festivalName = String(festivalNameInput || "").trim();
        const isCustom = festivalName === "custom";
        const theme = festivalName ? occasionAnimationLibrary?.getFestivalTheme(festivalName) : null;
        const themeEffects = theme?.effects || [];

        occasionCustomFields?.classList.toggle("admin-hidden", !isCustom);

        if (occasionTypeInput) {
            occasionTypeInput.disabled = !isCustom;

            if (!isCustom) {
                occasionTypeInput.value = theme?.defaultAnimationType || "";
            } else if (!occasionTypeInput.value) {
                occasionTypeInput.value = "floating-lights";
            }
        }

        if (!festivalName) {
            if (occasionThemeHeading) {
                occasionThemeHeading.textContent = "Choose a festival theme to preview its atmosphere";
            }

            if (occasionThemeDescription) {
                occasionThemeDescription.textContent = "Pick a predefined occasion for a ready-made spiritual animation, or switch to Custom to mix your own motion and accents.";
            }

            if (occasionThemeEffects) {
                occasionThemeEffects.innerHTML = "";
            }

            return;
        }

        if (occasionThemeHeading) {
            occasionThemeHeading.textContent = theme?.label || "Festival Theme";
        }

        if (occasionThemeDescription) {
            occasionThemeDescription.textContent = theme?.description || "Adjust the settings below, then preview the motion before saving.";
        }

        if (occasionThemeEffects) {
            occasionThemeEffects.innerHTML = themeEffects
                .map((effect) => `<span>${escapeHtml(effect)}</span>`)
                .join("");
        }

        if (
            options.autofillTitle &&
            occasionTitleInput &&
            !String(occasionTitleInput.value || "").trim() &&
            String(theme?.defaultTitle || "").trim()
        ) {
            occasionTitleInput.value = theme.defaultTitle;
        }
    };

    const getOccasionFormValue = () => {
        const festivalName = getSelectedOccasionFestival();
        const isCustom = festivalName === "custom";

        return {
            id: String(occasionIdInput?.value || "").trim(),
            title: String(occasionTitleInput?.value || "").trim(),
            festival_name: festivalName,
            animation_type: isCustom
                ? String(occasionTypeInput?.value || "").trim()
                : (occasionAnimationLibrary?.getFestivalDefaultAnimationType(festivalName) || ""),
            theme_settings: isCustom
                ? getOccasionThemeSettings()
                : (occasionAnimationLibrary?.customThemeSettingDefaults || {}),
            start_date: String(occasionStartInput?.value || "").trim(),
            end_date: String(occasionEndInput?.value || "").trim(),
            target_pages: getCheckedOccasionPages(),
            intensity: getSelectedOccasionIntensity(),
            is_enabled: Boolean(occasionEnabledCheckbox?.checked),
            disable_on_mobile: Boolean(occasionDisableMobileCheckbox?.checked)
        };
    };

    const updateOccasionPreviewCopy = (headline, meta) => {
        if (occasionPreviewTitle) {
            occasionPreviewTitle.textContent = headline;
        }

        if (occasionPreviewMeta) {
            occasionPreviewMeta.textContent = meta;
        }
    };

    const destroyOccasionPreview = () => {
        occasionPreviewController?.destroy?.();
        occasionPreviewController = null;
    };

    const previewOccasionAnimation = (value, options = {}) => {
        if (!occasionPreviewStage || !occasionAnimationLibrary) {
            return false;
        }

        destroyOccasionPreview();

        const normalizedValue = {
            ...value,
            target_pages: occasionAnimationLibrary.normalizeTargetPages(value?.target_pages || []),
            intensity: String(value?.intensity || "medium"),
            is_enabled: Boolean(value?.is_enabled ?? true),
            disable_on_mobile: Boolean(value?.disable_on_mobile ?? false),
            theme_settings: occasionAnimationLibrary.normalizeThemeSettings(value?.theme_settings || {})
        };

        const validationError = occasionAnimationLibrary.validateOccasionAnimation(normalizedValue);

        if (validationError) {
            updateOccasionPreviewCopy(
                "Preview the festive effect before saving",
                "Choose a festival theme, pages, and intensity, then click Preview Animation."
            );

            if (!options.silent) {
                setStatus(occasionStatus, validationError, "error");
            }

            return false;
        }

        const previewConfig = occasionAnimationLibrary.normalizeOccasionAnimation(normalizedValue);
        occasionPreviewController = occasionAnimationLibrary.mount(occasionPreviewStage, previewConfig, { preview: true });
        const targetLabels = previewConfig.target_pages
            .map((page) => occasionAnimationLibrary.getPageLabel(page))
            .join(", ");
        const animationLabel = previewConfig.festival_name === "custom"
            ? `${occasionAnimationLibrary.getFestivalLabel(previewConfig.festival_name)}: ${occasionAnimationLibrary.getAnimationLabel(previewConfig.animation_type)}`
            : occasionAnimationLibrary.getFestivalLabel(previewConfig.festival_name);

        updateOccasionPreviewCopy(
            previewConfig.title,
            `${animationLabel} on ${targetLabels} with ${occasionAnimationLibrary.getIntensityLabel(previewConfig.intensity).toLowerCase()} intensity.${previewConfig.disable_on_mobile ? " Hidden on mobile." : ""}`
        );

        if (!options.silent && options.successMessage) {
            setStatus(occasionStatus, options.successMessage, "success");
        }

        return true;
    };

    const resetOccasionForm = () => {
        occasionForm?.reset();

        if (occasionIdInput) {
            occasionIdInput.value = "";
        }

        if (occasionEnabledCheckbox) {
            occasionEnabledCheckbox.checked = true;
        }

        if (occasionDisableMobileCheckbox) {
            occasionDisableMobileCheckbox.checked = false;
        }

        const mediumIntensityInput = occasionIntensityInputs.find((input) => input.value === "medium");
        if (mediumIntensityInput) {
            mediumIntensityInput.checked = true;
        }

        setOccasionThemeSettings(occasionAnimationLibrary?.customThemeSettingDefaults || {});
        setOccasionTargetSelection(["all"]);
        syncOccasionFestivalUi("", { autofillTitle: false });
        destroyOccasionPreview();
        updateOccasionPreviewCopy(
            "Preview the festive effect before saving",
            "Choose a festival theme, pages, and intensity, then click Preview Animation."
        );
        occasionCancelButton?.classList.add("admin-hidden");
    };

    const populateOccasionForm = (item) => {
        if (!occasionForm || !item) {
            return;
        }

        const normalizedItem = occasionAnimationLibrary?.normalizeOccasionAnimation({
            ...item,
            festival_name: item?.festival_name || "custom",
            theme_settings: item?.theme_settings || {},
            disable_on_mobile: item?.disable_on_mobile ?? false
        }) || item;

        occasionIdInput.value = normalizedItem.id || "";
        occasionTitleInput.value = normalizedItem.title || "";

        if (occasionFestivalInput) {
            occasionFestivalInput.value = normalizedItem.festival_name || "";
        }

        syncOccasionFestivalUi(normalizedItem.festival_name, { autofillTitle: false });

        if (occasionTypeInput) {
            occasionTypeInput.value = normalizedItem.animation_type || "";
        }

        occasionStartInput.value = normalizedItem.start_date || "";
        occasionEndInput.value = normalizedItem.end_date || "";
        occasionEnabledCheckbox.checked = Boolean(normalizedItem.is_enabled);

        if (occasionDisableMobileCheckbox) {
            occasionDisableMobileCheckbox.checked = Boolean(normalizedItem.disable_on_mobile);
        }

        setOccasionThemeSettings(normalizedItem.theme_settings || {});
        setOccasionTargetSelection(normalizedItem.target_pages || ["all"]);

        const selectedIntensity = String(normalizedItem.intensity || "medium");
        occasionIntensityInputs.forEach((input) => {
            input.checked = input.value === selectedIntensity;
        });

        occasionCancelButton?.classList.remove("admin-hidden");
        previewOccasionAnimation(normalizedItem, { silent: true });
    };

    const maskEmail = (value) => {
        const normalizedValue = String(value || "").trim();

        if (!normalizedValue.includes("@")) {
            return "";
        }

        const [localPart, domain] = normalizedValue.split("@");

        if (!localPart || !domain) {
            return "";
        }

        const visibleStart = localPart.slice(0, 2);
        const visibleEnd = localPart.length > 4 ? localPart.slice(-1) : "";
        const hiddenLength = Math.max(2, localPart.length - visibleStart.length - visibleEnd.length);

        return `(${visibleStart}${"*".repeat(hiddenLength)}${visibleEnd}@${domain})`;
    };

    const uniquePaths = (paths) => Array.from(new Set((paths || []).filter(Boolean)));

    const errorText = (error) => String(error?.message || error?.details || "").toLowerCase();

    const isMissingPublishAtColumnError = (error) =>
        errorText(error).includes("publish_at") &&
        (errorText(error).includes("does not exist") || errorText(error).includes("column"));

    const isMissingOccasionAnimationsTableError = (error) =>
        errorText(error).includes("occasion_animations") &&
        (errorText(error).includes("does not exist") ||
            errorText(error).includes("relation") ||
            errorText(error).includes("could not find the table"));

    const isMissingOccasionAnimationThemeColumnsError = (error) =>
        ["festival_name", "theme_settings", "disable_on_mobile"].some((columnName) =>
            errorText(error).includes(columnName) &&
            (errorText(error).includes("does not exist") || errorText(error).includes("column"))
        );

    const syncScheduleField = (checkbox, field, input) => {
        if (!checkbox || !field) {
            return;
        }

        const publishImmediately = checkbox.checked;
        field.classList.toggle("admin-hidden", publishImmediately);

        if (input) {
            input.disabled = publishImmediately;
        }
    };

    const resolvePublishSettings = (publishImmediately, publishAtRaw) => {
        const normalizedValue = String(publishAtRaw || "").trim();

        if (publishImmediately) {
            return {
                published: true,
                publish_at: null
            };
        }

        if (!normalizedValue) {
            return {
                published: false,
                publish_at: null
            };
        }

        const parsedDate = new Date(normalizedValue);

        if (Number.isNaN(parsedDate.getTime())) {
            throw new Error("Please choose a valid publish date and time.");
        }

        return {
            published: true,
            publish_at: parsedDate.toISOString()
        };
    };

    const describePublicationState = (item) => {
        const publishAtTimestamp = item?.publish_at ? new Date(item.publish_at).getTime() : null;

        if (!item?.published) {
            return {
                label: "Draft",
                detail: null
            };
        }

        if (publishAtTimestamp && publishAtTimestamp > Date.now()) {
            return {
                label: "Scheduled",
                detail: `Publishes ${formatDateTime(item.publish_at)}`
            };
        }

        return {
            label: "Published",
            detail: item?.publish_at ? `Published ${formatDateTime(item.publish_at)}` : null
        };
    };

    const normalizePhotoRows = (item, photoRows) => {
        const seenPaths = new Set();
        const normalizedRows = Array.isArray(photoRows)
            ? photoRows.filter((photo) => {
                const path = String(photo?.image_path || "").trim();

                if (!path || seenPaths.has(path)) {
                    return false;
                }

                seenPaths.add(path);
                return true;
            })
            : [];

        if (normalizedRows.length > 0) {
            return normalizedRows;
        }

        if (item?.image_path) {
            return [{
                id: "",
                image_path: item.image_path,
                sort_order: 0,
                created_at: item.created_at || null
            }];
        }

        return [];
    };

    const formatAdminLoadError = (error, itemType) => {
        const fallbackMessage = `Unable to load ${itemType} right now.`;

        if (!error) {
            return fallbackMessage;
        }

        const rawMessage = String(error.message || error.details || "").trim();
        const normalizedMessage = rawMessage.toLowerCase();

        if (
            normalizedMessage.includes("could not find the table") ||
            normalizedMessage.includes("relation") ||
            normalizedMessage.includes("does not exist")
        ) {
            return `The ${itemType} table is missing in Supabase. Run the full supabase/schema.sql setup, then refresh this page.`;
        }

        if (normalizedMessage.includes("row-level security")) {
            return `Supabase is blocking access to ${itemType}. Run the full supabase/schema.sql setup so the admin policies are created.`;
        }

        return rawMessage || fallbackMessage;
    };

    const lastSyncFormatter = new Intl.DateTimeFormat("en-MU", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Indian/Mauritius"
    });

    const stampLastSync = () => {
        setMetricValue(lastSyncValue, lastSyncFormatter.format(new Date()));
    };

    const togglePanels = (isAuthed) => {
        loginPanel.classList.toggle("admin-hidden", isAuthed);
        dashboardPanel.classList.toggle("admin-hidden", !isAuthed);
    };

    const fileNameSafe = (value) =>
        String(value || "file")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 50) || "file";

    const uploadAsset = async (file, folder) => {
        const extension = (file.name.split(".").pop() || "jpg").toLowerCase();
        const filePath = `${folder}/${Date.now()}-${fileNameSafe(file.name.replace(/\.[^.]+$/, ""))}.${extension}`;
        const { error } = await client.storage.from(bucket).upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type || undefined
        });

        if (error) {
            throw error;
        }

        return filePath;
    };

    const removeAssetsIfPresent = async (filePaths) => {
        const normalizedPaths = uniquePaths(Array.isArray(filePaths) ? filePaths : [filePaths]);

        if (normalizedPaths.length === 0) {
            return;
        }

        await client.storage.from(bucket).remove(normalizedPaths);
    };

    const removeAssetIfPresent = async (filePath) => {
        await removeAssetsIfPresent(filePath);
    };

    const checkAdminAccess = async () => {
        const { data, error } = await client.from("admin_users").select("email").limit(1);

        if (error) {
            return false;
        }

        return Array.isArray(data) && data.length > 0;
    };

    const renderEmptyState = (element, message) => {
        if (!element) {
            return;
        }

        element.innerHTML = `<div class="admin-empty"><p>${escapeHtml(message)}</p></div>`;
    };

    const renderGalleryPagination = (totalItems, totalPages) => {
        if (!galleryPagination) {
            return;
        }

        if (totalItems === 0) {
            galleryPagination.innerHTML = "";
            return;
        }

        const startItem = (galleryPage - 1) * galleryPostsPerPage + 1;
        const endItem = Math.min(galleryPage * galleryPostsPerPage, totalItems);

        if (totalPages <= 1) {
            galleryPagination.innerHTML = `
                <p class="admin-pagination-summary">Showing all ${totalItems} gallery ${totalItems === 1 ? "post" : "posts"}.</p>
            `;
            return;
        }

        galleryPagination.innerHTML = `
            <p class="admin-pagination-summary">Showing ${startItem}-${endItem} of ${totalItems} gallery posts.</p>
            <div class="admin-pagination-controls">
                <button class="btn btn-outline btn-small" type="button" data-gallery-page="prev" ${galleryPage === 1 ? "disabled" : ""}>
                    Previous
                </button>
                ${Array.from({ length: totalPages }, (_value, index) => {
                    const pageNumber = index + 1;
                    return `
                        <button class="btn btn-outline btn-small${pageNumber === galleryPage ? " is-active" : ""}" type="button"
                            data-gallery-page="${pageNumber}" ${pageNumber === galleryPage ? "aria-current=\"page\"" : ""}>
                            ${pageNumber}
                        </button>
                    `;
                }).join("")}
                <button class="btn btn-outline btn-small" type="button" data-gallery-page="next" ${galleryPage === totalPages ? "disabled" : ""}>
                    Next
                </button>
            </div>
        `;
    };

    const loadGalleryPhotoMap = async (itemIds) => {
        if (!Array.isArray(itemIds) || itemIds.length === 0) {
            return new Map();
        }

        const { data, error } = await client
            .from("gallery_item_photos")
            .select("id, gallery_item_id, image_path, sort_order, created_at")
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

            photoMap.get(photo.gallery_item_id).push(photo);
        });

        return photoMap;
    };

    const loadEvents = async () => {
        let { data, error } = await client
            .from("events")
            .select("id, title, location, start_at, image_path, published, publish_at")
            .order("start_at", { ascending: true });

        if (error && isMissingPublishAtColumnError(error)) {
            ({ data, error } = await client
                .from("events")
                .select("id, title, location, start_at, image_path, published")
                .order("start_at", { ascending: true }));
        }

        if (error) {
            setMetricValue(eventCountValue, "0");
            renderEmptyState(eventsList, formatAdminLoadError(error, "events"));
            return;
        }

        setMetricValue(eventCountValue, String(data.length));

        if (!data || data.length === 0) {
            renderEmptyState(eventsList, "No events yet. Use the form above to add your first event.");
            return;
        }

        eventsList.innerHTML = data
            .map(
                (event) => {
                    const imageUrl = getPublicImageUrl(event.image_path);
                    const publicationState = describePublicationState(event);
                    const eventMeta = [
                        publicationState.label,
                        formatDateTime(event.start_at),
                        publicationState.detail
                    ].filter(Boolean);

                    return `
                    <article class="admin-item admin-item--media">
                        <div class="admin-item-media">
                            ${imageUrl
                                ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(event.title || "Event image")}">`
                                : `<div class="admin-item-media-fallback">No image</div>`}
                        </div>
                        <div class="admin-item-body">
                            <div class="admin-item-head">
                                <div>
                                    <h3>${escapeHtml(event.title)}</h3>
                                    <p>${escapeHtml(event.location || "Temple event")}</p>
                                </div>
                                <div class="admin-meta">
                                    ${eventMeta.map((meta) => `<span>${escapeHtml(meta)}</span>`).join("")}
                                </div>
                            </div>
                            <div class="admin-actions">
                                <button class="btn btn-outline btn-small" type="button" data-delete-event="${escapeHtml(event.id)}"
                                    data-image-path="${escapeHtml(event.image_path || "")}">
                                    Delete Event
                                </button>
                            </div>
                        </div>
                    </article>
                `
                }
            )
            .join("");
    };

    const loadGallery = async () => {
        let { data, error } = await client
            .from("gallery_items")
            .select("id, title, category, image_path, published, publish_at, created_at")
            .order("created_at", { ascending: false });

        if (error && isMissingPublishAtColumnError(error)) {
            ({ data, error } = await client
                .from("gallery_items")
                .select("id, title, category, image_path, published, created_at")
                .order("created_at", { ascending: false }));
        }

        if (error) {
            setMetricValue(galleryCountValue, "0");
            if (galleryPagination) {
                galleryPagination.innerHTML = "";
            }
            renderEmptyState(galleryList, formatAdminLoadError(error, "gallery items"));
            return;
        }

        if (!data || data.length === 0) {
            setMetricValue(galleryCountValue, "0");
            if (galleryPagination) {
                galleryPagination.innerHTML = "";
            }
            renderEmptyState(galleryList, "No gallery items yet. Use the form above to upload your first image.");
            return;
        }

        const photoMap = await loadGalleryPhotoMap(data.map((item) => item.id));
        const totalPhotoCount = data.reduce((count, item) => count + normalizePhotoRows(item, photoMap.get(item.id)).length, 0);
        setMetricValue(galleryCountValue, String(totalPhotoCount));
        const totalPages = Math.max(1, Math.ceil(data.length / galleryPostsPerPage));
        galleryPage = Math.min(Math.max(galleryPage, 1), totalPages);
        const startIndex = (galleryPage - 1) * galleryPostsPerPage;
        const visibleItems = data.slice(startIndex, startIndex + galleryPostsPerPage);

        galleryList.innerHTML = visibleItems
            .map(
                (item) => {
                    const photoRows = normalizePhotoRows(item, photoMap.get(item.id));
                    const photoPaths = photoRows.map((photo) => photo.image_path);
                    const photoCount = photoPaths.length || 1;
                    const mediaLabel = `${photoCount} ${photoCount === 1 ? "item" : "items"}`;
                    const publicationState = describePublicationState(item);
                    const isExpanded = expandedGalleryPosts.has(item.id);
                    const coverPath = photoRows[0]?.image_path || item.image_path;
                    const photoStripMarkup = photoRows.length > 0
                        ? `
                            <div class="admin-gallery-photo-strip">
                                <div class="admin-gallery-cover-panel">
                                    <div class="admin-gallery-cover-media">
                                        ${renderAdminMedia(photoRows[0].image_path, `${item.title || "Gallery item"} cover`)}
                                    </div>
                                    <div class="admin-gallery-cover-copy">
                                        <span class="admin-gallery-photo-badge">Current Cover</span>
                                        <strong>Cover media is shown first on the public gallery.</strong>
                                        <span>Choose any thumbnail below and use <em>Set Cover</em> if you want another file to replace it.</span>
                                    </div>
                                </div>
                                <div class="admin-gallery-thumb-strip">
                                    ${photoRows.map((photo, index) => `
                                        <div class="admin-gallery-thumb-card${index === 0 ? " is-cover" : ""}">
                                            <div class="admin-gallery-thumb-media">
                                                ${renderAdminMedia(photo.image_path, `${item.title || "Gallery item"} ${index + 1}`)}
                                            </div>
                                            <div class="admin-gallery-thumb-meta">
                                                <strong>${index === 0 ? "Cover" : `Item ${index + 1}`}</strong>
                                                <span>Position ${index + 1}</span>
                                            </div>
                                            <div class="admin-gallery-thumb-actions">
                                                <button class="btn btn-outline btn-small" type="button"
                                                    data-move-gallery-photo="cover"
                                                    data-gallery-item-id="${escapeHtml(item.id)}"
                                                    data-gallery-photo-id="${escapeHtml(photo.id || "")}"
                                                    ${index === 0 || !photo.id ? "disabled" : ""}>
                                                    ${index === 0 ? "Current" : "Set Cover"}
                                                </button>
                                                <button class="btn btn-outline btn-small" type="button"
                                                    data-move-gallery-photo="earlier"
                                                    data-gallery-item-id="${escapeHtml(item.id)}"
                                                    data-gallery-photo-id="${escapeHtml(photo.id || "")}"
                                                    ${index === 0 || !photo.id ? "disabled" : ""}>
                                                    Earlier
                                                </button>
                                                <button class="btn btn-outline btn-small" type="button"
                                                    data-move-gallery-photo="later"
                                                    data-gallery-item-id="${escapeHtml(item.id)}"
                                                    data-gallery-photo-id="${escapeHtml(photo.id || "")}"
                                                    ${index === photoRows.length - 1 || !photo.id ? "disabled" : ""}>
                                                    Later
                                                </button>
                                            </div>
                                        </div>
                                    `).join("")}
                                </div>
                            </div>
                        `
                        : "";

                    return `
                    <article class="admin-item admin-gallery-post${isExpanded ? " is-expanded" : ""}" data-gallery-post-id="${escapeHtml(item.id)}">
                        <div class="admin-gallery-post-overview">
                            <div class="admin-gallery-post-summary-media">
                                ${renderAdminMedia(coverPath, item.title || "Gallery cover media")}
                            </div>
                            <div class="admin-gallery-post-summary">
                                <div class="admin-item-head">
                                    <div>
                                        <h3>${escapeHtml(item.title)}</h3>
                                        <p>${escapeHtml(formatCategoryLabel(item.category || "community-gathering"))}</p>
                                    </div>
                                    <div class="admin-meta">
                                        <span>${escapeHtml(mediaLabel)}</span>
                                        <span>${escapeHtml(publicationState.label)}</span>
                                        ${publicationState.detail ? `<span>${escapeHtml(publicationState.detail)}</span>` : ""}
                                        <span>${escapeHtml(normalizeCategorySlug(item.category || "community-gathering"))}</span>
                                    </div>
                                </div>
                                <p class="admin-gallery-post-note">
                                    Open this post only when you want to change the cover media or reorder its files.
                                </p>
                            </div>
                            <div class="admin-gallery-post-controls">
                                <button class="btn btn-outline btn-small" type="button"
                                    data-toggle-gallery-post="${escapeHtml(item.id)}"
                                    aria-expanded="${String(isExpanded)}"
                                    aria-controls="gallery-post-details-${escapeHtml(item.id)}">
                                    ${isExpanded ? "Hide Media" : "Manage Media"}
                                </button>
                                <button class="btn btn-outline btn-small" type="button" data-delete-gallery="${escapeHtml(item.id)}"
                                    data-image-path="${escapeHtml(item.image_path || "")}">
                                    Delete Post
                                </button>
                            </div>
                        </div>
                        <div class="admin-gallery-post-details" id="gallery-post-details-${escapeHtml(item.id)}" ${isExpanded ? "" : "hidden"}>
                            ${photoStripMarkup}
                        </div>
                    </article>
                `;
                }
            )
            .join("");

        renderGalleryPagination(data.length, totalPages);
    };

    const fetchOccasionAnimationEntries = async (occasionId = "") => {
        let query = client
            .from("occasion_animations")
            .select("id, title, festival_name, animation_type, theme_settings, start_date, end_date, target_pages, intensity, is_enabled, disable_on_mobile, created_at, updated_at");

        if (occasionId) {
            query = query.eq("id", occasionId).maybeSingle();
        } else {
            query = query
                .order("start_date", { ascending: false })
                .order("created_at", { ascending: false });
        }

        let { data, error } = await query;

        if (error && isMissingOccasionAnimationThemeColumnsError(error)) {
            let fallbackQuery = client
                .from("occasion_animations")
                .select("id, title, animation_type, start_date, end_date, target_pages, intensity, is_enabled, created_at, updated_at");

            if (occasionId) {
                fallbackQuery = fallbackQuery.eq("id", occasionId).maybeSingle();
            } else {
                fallbackQuery = fallbackQuery
                    .order("start_date", { ascending: false })
                    .order("created_at", { ascending: false });
            }

            ({ data, error } = await fallbackQuery);
        }

        if (error) {
            return { data: occasionId ? null : [], error };
        }

        const normalizeItem = (item) =>
            occasionAnimationLibrary?.normalizeOccasionAnimation({
                ...item,
                festival_name: item?.festival_name || "custom",
                theme_settings: item?.theme_settings || {},
                disable_on_mobile: item?.disable_on_mobile ?? false
            }) || item;

        if (occasionId) {
            return {
                data: data ? normalizeItem(data) : null,
                error: null
            };
        }

        return {
            data: Array.isArray(data) ? data.map(normalizeItem) : [],
            error: null
        };
    };

    const loadOccasionAnimations = async () => {
        if (!occasionList) {
            return;
        }

        const { data, error } = await fetchOccasionAnimationEntries();

        if (error) {
            setMetricValue(occasionCountValue, "0");
            renderEmptyState(
                occasionList,
                isMissingOccasionAnimationsTableError(error)
                    ? "Occasion animation support is not enabled in Supabase yet. Run the occasion animation SQL upgrade, then refresh this page."
                    : (error.message || "Unable to load occasion animations right now.")
            );
            return;
        }

        const items = Array.isArray(data) ? data : [];
        setMetricValue(occasionCountValue, String(items.length));

        if (items.length === 0) {
            renderEmptyState(occasionList, "No occasion animations yet. Create one above when you are ready to add a festive effect.");
            return;
        }

        const today = occasionAnimationLibrary?.getCurrentDateInMauritius?.() || "";

        occasionList.innerHTML = items.map((item) => {
            const normalizedPages = occasionAnimationLibrary?.normalizeTargetPages(item.target_pages || []) || ["all"];
            const matchesToday = Boolean(item.is_enabled && item.start_date <= today && item.end_date >= today);
            const rangeLabel = `${formatDateLabel(item.start_date)} to ${formatDateLabel(item.end_date)}`;
            const festivalLabel = occasionAnimationLibrary?.getFestivalLabel(item.festival_name || "custom") || item.festival_name || "Custom Theme";
            const motionLabel = item.festival_name === "custom"
                ? `${festivalLabel}: ${occasionAnimationLibrary?.getAnimationLabel(item.animation_type) || item.animation_type}`
                : festivalLabel;
            const statusLabel = !item.is_enabled
                ? "Paused"
                : item.end_date < today
                    ? "Ended"
                    : item.start_date > today
                        ? "Upcoming"
                        : "Live";

            return `
                <article class="admin-item admin-occasion-card">
                    <div class="admin-item-body">
                        <div class="admin-item-head">
                            <div>
                                <h3>${escapeHtml(item.title)}</h3>
                                <p>${escapeHtml(motionLabel)}</p>
                            </div>
                            <div class="admin-meta">
                                <span>${escapeHtml(statusLabel)}</span>
                                <span>${escapeHtml(occasionAnimationLibrary?.getIntensityLabel(item.intensity) || item.intensity)}</span>
                                <span>${escapeHtml(rangeLabel)}</span>
                                ${item.disable_on_mobile ? "<span>Mobile Hidden</span>" : ""}
                                ${matchesToday ? `<span>Showing now</span>` : ""}
                            </div>
                        </div>

                        <div class="admin-occasion-targets">
                            ${normalizedPages.map((page) => `<span>${escapeHtml(occasionAnimationLibrary?.getPageLabel(page) || page)}</span>`).join("")}
                        </div>

                        <div class="admin-actions">
                            <button class="btn btn-outline btn-small" type="button" data-edit-occasion="${escapeHtml(item.id)}">
                                Edit Animation
                            </button>
                            <button class="btn btn-outline btn-small" type="button"
                                data-toggle-occasion="${escapeHtml(item.id)}"
                                data-next-enabled="${item.is_enabled ? "false" : "true"}">
                                ${item.is_enabled ? "Disable" : "Enable"}
                            </button>
                            <button class="btn btn-outline btn-small" type="button" data-delete-occasion="${escapeHtml(item.id)}">
                                Delete
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join("");
    };

    const toggleGalleryPost = (itemId) => {
        if (!itemId) {
            return;
        }

        if (expandedGalleryPosts.has(itemId)) {
            expandedGalleryPosts.delete(itemId);
            return;
        }

        expandedGalleryPosts.add(itemId);
    };

    const reorderGalleryPhotos = async (itemId, photoId, direction) => {
        const { data, error } = await client
            .from("gallery_item_photos")
            .select("id, image_path, sort_order, created_at")
            .eq("gallery_item_id", itemId)
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: true });

        if (error) {
            throw error;
        }

        const orderedRows = Array.isArray(data) ? [...data] : [];
        const currentIndex = orderedRows.findIndex((photo) => photo.id === photoId);

        if (currentIndex === -1) {
            throw new Error("That file could not be found in this gallery post.");
        }

        const targetIndex = direction === "cover"
            ? 0
            : direction === "earlier"
                ? currentIndex - 1
                : currentIndex + 1;

        if (targetIndex < 0 || targetIndex >= orderedRows.length) {
            return false;
        }

        if (direction === "cover" && currentIndex === 0) {
            return false;
        }

        const [movedPhoto] = orderedRows.splice(currentIndex, 1);
        orderedRows.splice(targetIndex, 0, movedPhoto);

        const updateResults = await Promise.all(
            orderedRows.map((photo, index) =>
                client.from("gallery_item_photos").update({ sort_order: index }).eq("id", photo.id)
            )
        );

        const failedUpdate = updateResults.find((result) => result.error);

        if (failedUpdate?.error) {
            throw failedUpdate.error;
        }

        const nextCoverPath = orderedRows[0]?.image_path || null;

        if (nextCoverPath) {
            const { error: coverError } = await client
                .from("gallery_items")
                .update({ image_path: nextCoverPath })
                .eq("id", itemId);

            if (coverError) {
                throw coverError;
            }
        }

        return true;
    };

    const loadDashboard = async () => {
        await Promise.all([loadEvents(), loadGallery(), loadOccasionAnimations()]);
        stampLastSync();
    };

    const syncSession = async () => {
        const {
            data: { session }
        } = await client.auth.getSession();

        if (!session) {
            if (isDashboardRoute) {
                redirectToNotFound();
                return;
            }

            togglePanels(false);
            adminEmail.textContent = "";
            setMetricValue(eventCountValue, "0");
            setMetricValue(galleryCountValue, "0");
            setMetricValue(occasionCountValue, "0");
            setMetricValue(lastSyncValue, "Waiting");
            galleryPage = 1;
            expandedGalleryPosts.clear();
            if (galleryPagination) {
                galleryPagination.innerHTML = "";
            }
            resetOccasionForm();
            markAdminReady();
            return;
        }

        const isAdmin = await checkAdminAccess();

        if (!isAdmin) {
            await client.auth.signOut();

            if (isDashboardRoute) {
                redirectToNotFound();
                return;
            }

            togglePanels(false);
            setStatus(loginStatus, "This account is not authorized for admin access.", "error");
            setMetricValue(occasionCountValue, "0");
            markAdminReady();
            return;
        }

        if (isLoginRoute) {
            window.location.replace(dashboardUrl);
            return;
        }

        adminEmail.textContent = maskEmail(session.user.email);
        togglePanels(true);
        setStatus(dashboardStatus, "Signed in and ready to manage website content.", "success");
        await loadDashboard();
        markAdminReady();
    };

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        setStatus(loginStatus, "Signing in...");

        const formData = new FormData(loginForm);
        const email = String(formData.get("email") || "").trim();
        const password = String(formData.get("password") || "");

        const { error } = await client.auth.signInWithPassword({ email, password });

        if (error) {
            setStatus(loginStatus, error.message || "Unable to sign in.", "error");
            return;
        }

        loginForm.reset();
        if (passwordInput) {
            passwordInput.type = "password";
        }
        if (passwordToggle) {
            passwordToggle.textContent = "Show";
            passwordToggle.setAttribute("aria-pressed", "false");
            passwordToggle.setAttribute("aria-label", "Show password");
        }
        setStatus(loginStatus, "Signed in successfully.", "success");
        await syncSession();
    });

    passwordToggle?.addEventListener("click", () => {
        if (!passwordInput) {
            return;
        }

        const isVisible = passwordInput.type === "text";
        passwordInput.type = isVisible ? "password" : "text";
        passwordToggle.textContent = isVisible ? "Show" : "Hide";
        passwordToggle.setAttribute("aria-pressed", String(!isVisible));
        passwordToggle.setAttribute("aria-label", isVisible ? "Show password" : "Hide password");
    });

    eventPublishCheckbox?.addEventListener("change", () => {
        syncScheduleField(eventPublishCheckbox, eventScheduleField, eventPublishAtInput);
    });

    galleryPublishCheckbox?.addEventListener("change", () => {
        syncScheduleField(galleryPublishCheckbox, galleryScheduleField, galleryPublishAtInput);
    });

    syncScheduleField(eventPublishCheckbox, eventScheduleField, eventPublishAtInput);
    syncScheduleField(galleryPublishCheckbox, galleryScheduleField, galleryPublishAtInput);
    resetOccasionForm();

    occasionForm?.addEventListener("change", (event) => {
        const changedFestivalInput = event.target.closest("#occasion-festival-name");
        const changedTargetInput = event.target.closest('input[name="target_pages"]');

        if (changedFestivalInput) {
            syncOccasionFestivalUi(changedFestivalInput.value, { autofillTitle: true });
        }

        if (changedTargetInput) {
            syncOccasionTargetSelection(changedTargetInput);
        }
    });

    occasionPreviewButton?.addEventListener("click", () => {
        previewOccasionAnimation(getOccasionFormValue(), {
            successMessage: "Preview updated."
        });
    });

    occasionCancelButton?.addEventListener("click", () => {
        resetOccasionForm();
        setStatus(occasionStatus, "Occasion animation edit cancelled.", "success");
    });

    logoutButton.addEventListener("click", async () => {
        await client.auth.signOut();
        togglePanels(false);
        setStatus(loginStatus, "Signed out.", "success");
        setStatus(dashboardStatus, "");
        resetOccasionForm();

        if (isDashboardRoute) {
            window.location.replace(loginUrl);
            return;
        }

        markAdminReady();
    });

    occasionForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        setStatus(occasionStatus, "Saving occasion animation...");

        try {
            if (!occasionAnimationLibrary) {
                throw new Error("The occasion animation library could not be loaded.");
            }

            const formValue = getOccasionFormValue();
            const validationError = occasionAnimationLibrary.validateOccasionAnimation(formValue);

            if (validationError) {
                throw new Error(validationError);
            }

            if (!allowedOccasionFestivalNames.has(formValue.festival_name)) {
                throw new Error("Please choose one of the available festival themes.");
            }

            if (formValue.festival_name === "custom" && !allowedOccasionAnimationTypes.has(formValue.animation_type)) {
                throw new Error("Please choose one of the available custom motion styles.");
            }

            if (!allowedOccasionIntensityLevels.has(formValue.intensity)) {
                throw new Error("Please choose a valid intensity level.");
            }

            const payload = {
                title: formValue.title,
                festival_name: formValue.festival_name,
                animation_type: formValue.animation_type,
                theme_settings: occasionAnimationLibrary.normalizeThemeSettings(formValue.theme_settings),
                start_date: formValue.start_date,
                end_date: formValue.end_date,
                target_pages: occasionAnimationLibrary.normalizeTargetPages(formValue.target_pages),
                intensity: formValue.intensity,
                is_enabled: formValue.is_enabled,
                disable_on_mobile: formValue.disable_on_mobile
            };

            let error = null;

            if (formValue.id) {
                ({ error } = await client.from("occasion_animations").update(payload).eq("id", formValue.id));
            } else {
                ({ error } = await client.from("occasion_animations").insert(payload));
            }

            if (error) {
                if (isMissingOccasionAnimationsTableError(error) || isMissingOccasionAnimationThemeColumnsError(error)) {
                    throw new Error("Occasion animation support is not enabled in Supabase yet. Run the occasion animation SQL upgrade, then try again.");
                }

                throw error;
            }

            resetOccasionForm();
            setStatus(
                occasionStatus,
                formValue.id
                    ? "Occasion animation updated successfully."
                    : "Occasion animation created successfully.",
                "success"
            );
            await loadOccasionAnimations();
            stampLastSync();
        } catch (error) {
            setStatus(occasionStatus, error.message || "Unable to save the occasion animation.", "error");
        }
    });

    eventForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        setStatus(eventStatus, "Uploading event...");

        try {
            const formData = new FormData(eventForm);
            const imageFile = formData.get("image");
            const publishSettings = resolvePublishSettings(
                eventPublishCheckbox?.checked ?? true,
                formData.get("publish_at")
            );

            if (!(imageFile instanceof File) || imageFile.size === 0) {
                throw new Error("Please choose an event image.");
            }

            const imagePath = await uploadAsset(imageFile, "events");
            const payload = {
                title: String(formData.get("title") || "").trim(),
                description: String(formData.get("description") || "").trim(),
                location: String(formData.get("location") || "").trim(),
                start_at: new Date(String(formData.get("start_at"))).toISOString(),
                end_at: formData.get("end_at")
                    ? new Date(String(formData.get("end_at"))).toISOString()
                    : null,
                image_path: imagePath,
                published: publishSettings.published,
                publish_at: publishSettings.publish_at
            };

            let { error } = await client.from("events").insert(payload);

            if (error && isMissingPublishAtColumnError(error)) {
                if (publishSettings.publish_at) {
                    await removeAssetIfPresent(imagePath);
                    throw new Error("Scheduled publishing is not enabled in Supabase yet. Run the scheduled publishing SQL upgrade, then try again.");
                }

                const { publish_at, ...legacyPayload } = payload;
                ({ error } = await client.from("events").insert(legacyPayload));
            }

            if (error) {
                await removeAssetIfPresent(imagePath);
                throw error;
            }

            eventForm.reset();
            if (eventPublishCheckbox) {
                eventPublishCheckbox.checked = true;
            }
            syncScheduleField(eventPublishCheckbox, eventScheduleField, eventPublishAtInput);

            setStatus(
                eventStatus,
                publishSettings.publish_at
                    ? "Event scheduled successfully."
                    : publishSettings.published
                        ? "Event added successfully."
                        : "Event saved as draft.",
                "success"
            );
            await loadEvents();
            stampLastSync();
        } catch (error) {
            setStatus(eventStatus, error.message || "Unable to add the event.", "error");
        }
    });

    galleryForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        setStatus(galleryStatus, "Uploading gallery post...");

        try {
            const formData = new FormData(galleryForm);
            const mediaFiles = galleryImageInput
                ? Array.from(galleryImageInput.files || []).filter((file) => file.size > 0)
                : [];
            const publishSettings = resolvePublishSettings(
                galleryPublishCheckbox?.checked ?? true,
                formData.get("publish_at")
            );

            if (mediaFiles.length === 0) {
                throw new Error("Please choose at least one gallery photo or video.");
            }

            const unsupportedFile = mediaFiles.find((file) => !["image", "video"].includes(getMediaTypeFromFile(file)));

            if (unsupportedFile) {
                throw new Error(`Unsupported gallery file: ${unsupportedFile.name}. Please use an image or video file.`);
            }

            const normalizedCategory = normalizeCategorySlug(formData.get("category"));

            if (!allowedGalleryCategories.has(normalizedCategory)) {
                throw new Error("Please choose one of the available gallery categories.");
            }

            const uploadedPaths = [];

            for (const mediaFile of mediaFiles) {
                uploadedPaths.push(await uploadAsset(mediaFile, "gallery"));
            }

            const payload = {
                title: String(formData.get("title") || "").trim(),
                description: String(formData.get("description") || "").trim(),
                category: normalizedCategory,
                image_path: uploadedPaths[0],
                published: publishSettings.published,
                publish_at: publishSettings.publish_at
            };

            let { data: insertedItem, error } = await client
                .from("gallery_items")
                .insert(payload)
                .select("id")
                .single();

            if (error && isMissingPublishAtColumnError(error)) {
                if (publishSettings.publish_at) {
                    await removeAssetsIfPresent(uploadedPaths);
                    throw new Error("Scheduled publishing is not enabled in Supabase yet. Run the scheduled publishing SQL upgrade, then try again.");
                }

                const { publish_at, ...legacyPayload } = payload;
                ({ data: insertedItem, error } = await client
                    .from("gallery_items")
                    .insert(legacyPayload)
                    .select("id")
                    .single());
            }

            if (error) {
                await removeAssetsIfPresent(uploadedPaths);
                throw error;
            }

            const galleryPhotoRows = uploadedPaths.map((imagePath, index) => ({
                gallery_item_id: insertedItem.id,
                image_path: imagePath,
                sort_order: index
            }));

            const { error: photoInsertError } = await client.from("gallery_item_photos").insert(galleryPhotoRows);

            if (photoInsertError) {
                await client.from("gallery_items").delete().eq("id", insertedItem.id);
                await removeAssetsIfPresent(uploadedPaths);

                const normalizedMessage = String(photoInsertError.message || "").toLowerCase();
                if (
                    normalizedMessage.includes("could not find the table") ||
                    normalizedMessage.includes("relation") ||
                    normalizedMessage.includes("does not exist")
                ) {
                    throw new Error("Gallery album support is not enabled in Supabase yet. Run the updated schema or gallery album upgrade SQL, then try again.");
                }

                throw photoInsertError;
            }

            galleryForm.reset();
            if (galleryPublishCheckbox) {
                galleryPublishCheckbox.checked = true;
            }
            syncScheduleField(galleryPublishCheckbox, galleryScheduleField, galleryPublishAtInput);

            setStatus(
                galleryStatus,
                publishSettings.publish_at
                    ? `Gallery post scheduled successfully with ${uploadedPaths.length} ${uploadedPaths.length === 1 ? "item" : "items"}.`
                    : publishSettings.published
                        ? `Gallery post added successfully with ${uploadedPaths.length} ${uploadedPaths.length === 1 ? "item" : "items"}.`
                        : `Gallery post saved as draft with ${uploadedPaths.length} ${uploadedPaths.length === 1 ? "item" : "items"}.`,
                "success"
            );
            galleryPage = 1;
            expandedGalleryPosts.clear();
            expandedGalleryPosts.add(insertedItem.id);
            await loadGallery();
            stampLastSync();
        } catch (error) {
            setStatus(galleryStatus, error.message || "Unable to add the gallery item.", "error");
        }
    });

    eventsList?.addEventListener("click", async (event) => {
        const button = event.target.closest("[data-delete-event]");

        if (!button) {
            return;
        }

        const eventId = button.getAttribute("data-delete-event");
        const imagePath = button.getAttribute("data-image-path");

        if (!eventId || !window.confirm("Delete this event?")) {
            return;
        }

        button.disabled = true;
        setStatus(dashboardStatus, "Deleting event...");

        const { error } = await client.from("events").delete().eq("id", eventId);

        if (!error) {
            await removeAssetIfPresent(imagePath);
            setStatus(dashboardStatus, "Event deleted.", "success");
            await loadEvents();
            stampLastSync();
            return;
        }

        button.disabled = false;
        setStatus(dashboardStatus, error.message || "Unable to delete the event.", "error");
    });

    galleryList?.addEventListener("click", async (event) => {
        const toggleButton = event.target.closest("[data-toggle-gallery-post]");

        if (toggleButton) {
            const itemId = toggleButton.getAttribute("data-toggle-gallery-post");

            if (!itemId) {
                return;
            }

            toggleGalleryPost(itemId);
            await loadGallery();
            return;
        }

        const moveButton = event.target.closest("[data-move-gallery-photo]");

        if (moveButton) {
            const itemId = moveButton.getAttribute("data-gallery-item-id");
            const photoId = moveButton.getAttribute("data-gallery-photo-id");
            const direction = moveButton.getAttribute("data-move-gallery-photo");

            if (!itemId || !photoId || !direction) {
                return;
            }

            moveButton.disabled = true;
            setStatus(
                dashboardStatus,
                direction === "cover"
                    ? "Setting media as cover..."
                    : direction === "earlier"
                        ? "Moving media earlier..."
                        : "Moving media later..."
            );

            try {
                const didReorder = await reorderGalleryPhotos(itemId, photoId, direction);

                if (didReorder) {
                    setStatus(dashboardStatus, "Media order updated.", "success");
                    await loadGallery();
                    stampLastSync();
                } else {
                    setStatus(dashboardStatus, "That file is already in the right position.", "success");
                }
            } catch (error) {
                moveButton.disabled = false;
                setStatus(dashboardStatus, error.message || "Unable to update the media order.", "error");
            }

            return;
        }

        const button = event.target.closest("[data-delete-gallery]");

        if (!button) {
            return;
        }

        const itemId = button.getAttribute("data-delete-gallery");
        const imagePath = button.getAttribute("data-image-path");

        if (!itemId || !window.confirm("Delete this gallery post and all its files?")) {
            return;
        }

        button.disabled = true;
        setStatus(dashboardStatus, "Deleting gallery post...");

        const { data: photoRows } = await client
            .from("gallery_item_photos")
            .select("image_path")
            .eq("gallery_item_id", itemId);

        const { error } = await client.from("gallery_items").delete().eq("id", itemId);

        if (!error) {
            await removeAssetsIfPresent([
                imagePath,
                ...(photoRows || []).map((row) => row.image_path)
            ]);
            expandedGalleryPosts.delete(itemId);
            setStatus(dashboardStatus, "Gallery post deleted.", "success");
            await loadGallery();
            stampLastSync();
            return;
        }

        button.disabled = false;
        setStatus(dashboardStatus, error.message || "Unable to delete the gallery post.", "error");
    });

    occasionList?.addEventListener("click", async (event) => {
        const editButton = event.target.closest("[data-edit-occasion]");

        if (editButton) {
            const occasionId = editButton.getAttribute("data-edit-occasion");

            if (!occasionId) {
                return;
            }

            setStatus(occasionStatus, "Loading animation settings...");

            const { data, error } = await fetchOccasionAnimationEntries(occasionId);

            if (error || !data) {
                setStatus(occasionStatus, error?.message || "Unable to load that occasion animation.", "error");
                return;
            }

            populateOccasionForm(data);
            setStatus(occasionStatus, "Occasion animation loaded into the form.", "success");
            occasionForm?.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
        }

        const toggleButton = event.target.closest("[data-toggle-occasion]");

        if (toggleButton) {
            const occasionId = toggleButton.getAttribute("data-toggle-occasion");
            const nextEnabled = toggleButton.getAttribute("data-next-enabled") === "true";

            if (!occasionId) {
                return;
            }

            toggleButton.disabled = true;
            setStatus(dashboardStatus, nextEnabled ? "Enabling occasion animation..." : "Disabling occasion animation...");

            const { error } = await client
                .from("occasion_animations")
                .update({ is_enabled: nextEnabled })
                .eq("id", occasionId);

            if (error) {
                toggleButton.disabled = false;
                setStatus(dashboardStatus, error.message || "Unable to update the occasion animation.", "error");
                return;
            }

            setStatus(dashboardStatus, nextEnabled ? "Occasion animation enabled." : "Occasion animation disabled.", "success");
            await loadOccasionAnimations();
            stampLastSync();
            return;
        }

        const deleteButton = event.target.closest("[data-delete-occasion]");

        if (!deleteButton) {
            return;
        }

        const occasionId = deleteButton.getAttribute("data-delete-occasion");

        if (!occasionId || !window.confirm("Delete this occasion animation?")) {
            return;
        }

        deleteButton.disabled = true;
        setStatus(dashboardStatus, "Deleting occasion animation...");

        const { error } = await client.from("occasion_animations").delete().eq("id", occasionId);

        if (error) {
            deleteButton.disabled = false;
            setStatus(dashboardStatus, error.message || "Unable to delete the occasion animation.", "error");
            return;
        }

        if (occasionIdInput?.value === occasionId) {
            resetOccasionForm();
            setStatus(occasionStatus, "Occasion animation removed from the form.", "success");
        }

        setStatus(dashboardStatus, "Occasion animation deleted.", "success");
        await loadOccasionAnimations();
        stampLastSync();
    });

    galleryPagination?.addEventListener("click", async (event) => {
        const button = event.target.closest("[data-gallery-page]");

        if (!button || button.disabled) {
            return;
        }

        const action = button.getAttribute("data-gallery-page");
        const requestedPage = action === "prev"
            ? galleryPage - 1
            : action === "next"
                ? galleryPage + 1
                : Number(action);

        if (!Number.isFinite(requestedPage) || requestedPage < 1 || requestedPage === galleryPage) {
            return;
        }

        galleryPage = requestedPage;
        await loadGallery();
    });

    client.auth.onAuthStateChange(() => {
        void syncSession();
    });

    setStatus(
        configStatus,
        "Secure admin portal is ready. Sign in to manage website content."
    );
    void syncSession();
})();
