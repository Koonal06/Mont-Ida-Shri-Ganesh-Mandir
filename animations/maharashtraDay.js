(function registerMaharashtraDayTheme() {
    const registry = window.siteOccasionThemeRegistry = window.siteOccasionThemeRegistry || {};

    registry["maharashtra-day"] = {
        value: "maharashtra-day",
        label: "Maharashtra Day",
        defaultTitle: "Maharashtra Day Tribute",
        defaultAnimationType: "floating-lights",
        description: "A respectful Marathi tribute with a waving Bhagwa Dhwaj, flowing saffron ribbons, soft orange glow, and a faint Shivaji Maharaj silhouette.",
        effects: [
            "Bhagwa Dhwaj wave",
            "Flowing saffron ribbons",
            "Soft orange glow",
            "Low-opacity Shivaji Maharaj silhouette"
        ],
        buildLayers() {
            return [
                {
                    kind: "floating-particles",
                    palette: ["rgba(255, 157, 45, 0.36)", "rgba(255, 188, 92, 0.26)", "rgba(255, 237, 205, 0.18)"],
                    count: { light: 6, medium: 9, heavy: 12 },
                    size: [0.55, 1.18],
                    duration: [14, 24],
                    drift: [-4, 4],
                    opacity: [0.09, 0.28]
                },
                {
                    kind: "ribbons",
                    palette: ["#f18825", "#ffb14d", "#f2a746"],
                    count: { light: 2, medium: 3, heavy: 3 },
                    width: [1.3, 2.1],
                    duration: [11, 17],
                    area: "sides"
                },
                {
                    kind: "flag",
                    palette: ["#ee7a1f", "#f39a2d"],
                    poleColor: "rgba(103, 58, 29, 0.58)",
                    top: "4.25rem",
                    left: "1rem",
                    width: "clamp(5rem, 10vw, 8rem)",
                    height: "clamp(3.9rem, 8vw, 5.7rem)"
                },
                {
                    kind: "watermark",
                    asset: "assets/images/shivaji.avif",
                    opacity: 0.058,
                    width: "clamp(7rem, 15vw, 10.5rem)",
                    bottom: "0.8rem",
                    right: "0.7rem",
                    top: "auto",
                    filter: "grayscale(1) sepia(1) saturate(2.4) hue-rotate(-12deg) brightness(0.8) contrast(1.18)"
                }
            ];
        }
    };
})();
