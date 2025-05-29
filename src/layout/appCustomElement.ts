import {MicroAppLifecycle} from "../types/microapp";

/**
 * Custom element that loads and renders a micro app.
 *
 * This element dynamically imports the micro app module (using its `name`
 * attribute) and calls its lifecycle methods (`mount` and `unmount`). Once the
 * element is disconnected, it ensures the micro app is unmounted and removes
 * itself from the DOM.
 *
 * @example
 * <microtsm-application name="@microtsm/navbar"></microtsm-application>
 */
class MicroTSMApplication extends HTMLElement {
    /**
     * Holds the micro app's lifecycle interface once the module is loaded.
     * @private
     */
    private app: MicroAppLifecycle | null = null;

    /**
     * Creates an instance of the MicroTSMApplication element.
     */
    constructor() {
        super();
    }

    /**
     * Called when the element is connected to the DOM.
     *
     * It triggers the rendering (mounting) of the micro app.
     *
     * @async
     * @returns {Promise<void>}
     */
    async connectedCallback(): Promise<void> {
        await this.renderMicroApp();
    }

    /**
     * Called when the element is disconnected from the DOM.
     *
     * It unmounts the micro app and removes the element from the DOM.
     *
     * @async
     * @returns {Promise<void>}
     */
    async disconnectedCallback(): Promise<void> {
        await this.unmountMicroApp();
    }

    /**
     * Dynamically imports and mounts the micro app.
     *
     * The method looks for the `name` attribute. If it is missing,
     * an error is logged; otherwise, it imports the micro app entry module
     * and invokes its mount method, passing this custom element as the host.
     *
     * @async
     * @returns {Promise<void>}
     */
    async renderMicroApp(): Promise<void> {
        const name = this.getAttribute("name");
        const route = this.getAttribute("route");

        if (!name) {
            return console.error(`❌ Missing micro app name attribute for route: ${route}`);
        }

        try {
            // Dynamically import the micro app's entry module.
            this.app = await import(/* @vite-ignore */ name);
            if (this.app?.mount) {
                // Mount the micro app and pass this element as its host.
                await this.app.mount({domElement: this, name});
            }
        } catch (error) {
            console.error(`❌ Failed to load Micro App: ${name}`, error);
        }
    }

    /**
     * Unmounts the micro app and removes this element from the DOM.
     *
     * If the micro app provides an unmount method, it is invoked first.
     * After unmounting, the element removes itself to ensure complete cleanup.
     *
     * @async
     * @returns {Promise<void>}
     */
    async unmountMicroApp(): Promise<void> {
        if (this.app?.unmount) {
            await this.app.unmount();
            this.app = null;
            console.log(`🚀 Unmounted Micro App`);
        }

        // Completely remove this element from the DOM.
        this.remove();
    }
}

customElements.define("microtsm-application", MicroTSMApplication);