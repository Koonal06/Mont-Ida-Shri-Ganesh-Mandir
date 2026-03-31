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

    const { data, error } = await client
        .from("occasion_animations")
        .select("id, title, animation_type, start_date, end_date, target_pages, intensity, is_enabled, created_at")
        .eq("is_enabled", true)
        .lte("start_date", today)
        .gte("end_date", today)
        .order("start_date", { ascending: false })
        .order("created_at", { ascending: false });

    if (error) {
        if (!isMissingTableError(error)) {
            console.warn("Occasion animation loader could not fetch active settings.", error);
        }
        return;
    }

    if (!Array.isArray(data) || data.length === 0) {
        return;
    }

    const activeAnimation = data.find((item) => animationLibrary.matchesTargetPage(item, currentPage));

    if (!activeAnimation) {
        return;
    }

    window.activeOccasionAnimation?.destroy?.();
    window.activeOccasionAnimation = animationLibrary.mount(document.body, activeAnimation);
})();
