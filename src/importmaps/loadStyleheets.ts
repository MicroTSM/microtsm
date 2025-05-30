/**
 * Gears up the ride by injecting an array of stylesheets.
 * Ensures the motorcycle is fully dressed before hitting the road.
 *
 * @throws Logs an error if the styles cannot be loaded.
 */
export async function gearUp(): Promise<void> {
    const stylesPath = "/importmaps/stylesheets.json"; // 🔒 Fixed path for now, future update may allow customization
    const styles: string[] = await import( /* @vite-ignore */ stylesPath, {
        with: {type: "json"}
    });

    if (!Array.isArray(styles) || styles.length === 0) {
        return console.warn("⚠️ No styles provided for the ride.");
    }

    styles.forEach((href) => {
        if (document.querySelector(`link[href="${href}"]`)) return; // Avoid duplicates

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        link.crossOrigin = "anonymous"; // Optional CORS handling
        document.head.appendChild(link);

        console.log(`✨ Ride geared up with style: ${href}`);
    });
}