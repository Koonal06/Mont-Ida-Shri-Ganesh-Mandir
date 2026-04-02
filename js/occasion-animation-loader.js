(async function initializeOccasionAnimationLoader() {
    const config = window.siteSupabaseConfig;
    const supabaseLib = window.supabase;
    const animationLibrary = window.siteOccasionAnimations;

    if (!config || !supabaseLib || !animationLibrary) {
        return;
    }

    const url = String(config.url || "").trim();
    const anonKey = String(config.anonKey || "").trim();

    if (!url || !anonKey) {
        return;
    }

    const client = supabaseLib.createClient(url, anonKey);
    const today = animationLibrary.getCurrentDateInMauritius();
    const currentPage = animationLibrary.resolvePageId(window.location.pathname);

    const errorText = (error) => String(error?.message || error?.details || "").toLowerCase();
    const isMissingTableError = (error) =>
        errorText(error).includes("occasion_animations") &&
        (errorText(error).includes("does not exist") || errorText(error).includes("relation"));
    const isMissingThemeColumnError = (error) =>
        ["festival_name", "theme_settings", "disable_on_mobile"].some((columnName) =>
            errorText(error).includes(columnName) &&
            (errorText(error).includes("does not exist") || errorText(error).includes("column"))
        );

    const normalizeRecord = (item) =>
        animationLibrary.normalizeOccasionAnimation({
            ...item,
            festival_name: item?.festival_name || "custom",
            theme_settings: item?.theme_settings || {},
            disable_on_mobile: item?.disable_on_mobile ?? false
        });

    let query = client
        .from("occasion_animations")
        .select("id, title, festival_name, animation_type, theme_settings, start_date, end_date, target_pages, intensity, is_enabled, disable_on_mobile, created_at")
        .eq("is_enabled", true)
        .lte("start_date", today)
        .gte("end_date", today)
        .order("start_date", { ascending: false })
        .order("created_at", { ascending: false });

    let { data, error } = await query;

    if (error && isMissingThemeColumnError(error)) {
        ({ data, error } = await client
            .from("occasion_animations")
            .select("id, title, animation_type, start_date, end_date, target_pages, intensity, is_enabled, created_at")
            .eq("is_enabled", true)
            .lte("start_date", today)
            .gte("end_date", today)
            .order("start_date", { ascending: false })
            .order("created_at", { ascending: false }));
    }

    if (error) {
        if (!isMissingTableError(error)) {
            console.warn("Occasion animation loader could not fetch active settings.", error);
        }
        return;
    }

    if (!Array.isArray(data) || data.length === 0) {
        return;
    }

    const normalizedItems = data.map(normalizeRecord);
    const activeAnimation = normalizedItems.find((item) => animationLibrary.matchesTargetPage(item, currentPage));

    if (!activeAnimation) {
        return;
    }

    window.activeOccasionAnimation?.destroy?.();
    window.activeOccasionAnimation = animationLibrary.mount(document.body, activeAnimation);
})();
