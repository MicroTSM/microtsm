/**
 * Renders the provided HTML template into the document body and registers
 * the custom elements for MicroTSM (layout and application).
 *
 * @param template - The HTML template string imported as a module.
 */
export default async function renderLayout(template: string): Promise<void> {
    // Render the template into the document; here we replace the entire body.
    document.body.innerHTML = template;

    const style = document.createElement("style");
    style.innerHTML = `microtsm-layout, microtsm-application {display: block}`;
    document.body.appendChild(style);

    // Dynamically register custom elements if they are not already defined.
    if (!customElements.get("microtsm-layout")) {
        await import("./layoutCustomElement");
    }

    if (!customElements.get("microtsm-application")) {
        await import("./appCustomElement");
    }
}