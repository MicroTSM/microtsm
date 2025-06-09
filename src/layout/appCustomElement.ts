import {MicroAppLifecycle} from '../types/microapp';

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
export class MicroTSMApplication extends HTMLElement {
    public readonly name: string | null;
    public readonly route: string | null;
    public readonly isDefault: boolean = false;

    /**
     * Holds the micro app's lifecycle interface once the module is loaded.
     * @private
     */
    private app: MicroAppLifecycle<any> | null = null;

    /**
     * Creates an instance of the MicroTSMApplication element.
     */
    constructor() {
        super();
        this.name = this.getAttribute('name');
        this.route = this.getAttribute('route');
        this.isDefault = this.hasAttribute('default');

        this.removeAttribute('route');
        this.removeAttribute('default');
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
        const name = this.name;
        const route = this.route;

        if (!name) {
            return console.error(`❌ Missing micro app name attribute for route: ${route}`);
        }

        try {
            // Dynamically import the micro app's entry module.
            this.app = await window.MicroTSM.load(name);
            if (this.app?.mount) {
                // Mount the micro app and pass this element as its host.
                await this.app.mount({ domElement: this, name, route });
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

    /**
     * Determines whether the micro app should be mounted.
     *
     * This hook can be customized via {@link MicroTSMRootApp.configureMicroApps} to conditionally
     * enable mounting based on the current route or other criteria.
     *
     * @param {Object} _ - An object containing route details.
     * @param {string} _.currentRoute - The current route.
     * @returns {boolean} True if the application should mount; otherwise, false.
     *
     * @note Only synchronous functions are supported. Using asynchronous implementations may interfere
     * with navigation control via the History API.
     */
    public shouldMount(_: { currentRoute: string }): boolean {
        return true;
    }
}

customElements.define('microtsm-application', MicroTSMApplication);
