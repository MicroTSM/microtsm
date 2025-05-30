import * as layoutCss from './layout.css?raw';

/**
 * Kick-starts MicroTSM by registering custom elements and injecting styles.
 *
 * @async
 */
export async function kickstartEngine(): Promise<void> {
    console.log("🏍️ Kick-starting engine with layout custom elements:");
    if (!customElements.get("microtsm-layout")) await import("./layoutCustomElement");
    if (!customElements.get("microtsm-application")) await import("./appCustomElement");

    const style = document.createElement("style");
    style.innerHTML = layoutCss.default;
    console.log("🚀 ~ kickstartEngine ~ layoutCss: ", layoutCss);
    document.head.appendChild(style);

    console.log("✅ Engine is running, custom elements registered.");
}

/**
 * Twists the throttle by applying the HTML template to the document body.
 *
 * @param {string} template - The HTML layout template string.
 */
export function twistThrottle(template: string): void {
    document.body.innerHTML = template;
    console.log("🏎️ Throttle twisted, layout applied!");
}