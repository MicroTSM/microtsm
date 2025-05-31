import { kickstartEngine, twistThrottle } from '../layout/startLayoutEngine';
import { wireEngine } from '../importmaps/insertImportMaps';
import { gearUp } from '../importmaps/loadStyleheets';
import { MicroTSMApplication } from '../layout/appCustomElement.ts';
import { MicroTSMLayout } from '../layout/layoutCustomElement.ts';

/**
 * Type definitions for lifecycle events and route middleware
 */
export type LifecycleEvent = 'onLoad' | 'onBeforeUnload' | 'onUnload' | 'onBeforeDestroy' | 'onDestroy';
export type RouteMiddleware = (route: URL) => Promise<boolean> | boolean;

export interface MicroTSMRootAppConfig {
    /**
     * HTML layout string for the application layout
     */
    layout: string;
    /**
     *  Optional base URL for the application
     */
    baseUrl?: string;
}

/**
 * Root application class for MicroTSM framework
 * Handles lifecycle events, routing middleware and application initialization
 */
export default class MicroTSMRootApp {
    /** Stores all micro-app elements referenced from `this.layout` */
    public registeredMicroApps: MicroTSMApplication[] = [];
    /** Base URL for the application */
    protected baseUrl: string | undefined;

    /**
     * The layout element before it is upgraded as a custom element.
     *
     * This holds the initial layout structure but lacks custom element behavior
     * until `customElements.upgrade()` is called.
     */
    private layout: MicroTSMLayout | null = null;

    /** Set of registered route middleware functions */
    private routeMiddlewares: Set<RouteMiddleware> = new Set();
    /** Map of lifecycle event handlers */
    private lifecycleEvents: Record<LifecycleEvent, Set<() => void>> = {
        onLoad: new Set(),
        onBeforeUnload: new Set(),
        onUnload: new Set(),
        onBeforeDestroy: new Set(),
        onDestroy: new Set(),
    };
    /** Flag indicating if the engine has been started */
    private engineStarted: Promise<any> | undefined;
    /** Flag indicating if the app has been launched */
    private launched = false;

    /**
     * Creates a new MicroTSMRootApp instance
     */
    constructor({ layout, baseUrl }: MicroTSMRootAppConfig) {
        this.baseUrl = baseUrl;
        this.registerMicroApps(layout);
    }

    /**
     * Registers a lifecycle callback
     * @param event - Lifecycle event to register for
     * @param callback - Function to call when event occurs
     */
    on(event: LifecycleEvent, callback: () => void): void {
        this.lifecycleEvents[event].add(callback);
    }

    /** Shortcut methods for registering lifecycle event handlers */
    onLoad(callback: () => void): void {
        this.on('onLoad', callback);
    }

    onBeforeUnload(callback: () => void): void {
        this.on('onBeforeUnload', callback);
    }

    onUnload(callback: () => void): void {
        this.on('onUnload', callback);
    }

    onBeforeDestroy(callback: () => void): void {
        this.on('onBeforeDestroy', callback);
    }

    onDestroy(callback: () => void): void {
        this.on('onDestroy', callback);
    }

    /**
     * Registers a middleware function to validate navigation
     * @param middleware - Function to validate route changes
     */
    useRouteMiddleware(middleware: RouteMiddleware): void {
        this.routeMiddlewares.add(middleware);
    }

    /**
     * Starts the application engine
     *
     * This method ensures the framework components are correctly set up,
     * including custom elements and route monitoring. If the engine has
     * already been started, a warning is displayed to prevent duplicate execution.
     *
     * Allows method chaining after starting the engine.
     * @example
     * const app = new MicroTSMRootApp(config);
     * app.startEngine().launch(); // Chain startEngine() with launch()
     */
    startEngine() {
        if (this.engineStarted) {
            console.warn('⚠️ Engine already started!');
            return this;
        }

        console.log('🏍️ Starting engine...');

        this.engineStarted = Promise.all([wireEngine(), gearUp(), kickstartEngine()]);
        this.engineStarted.then(() => console.log('✅ Engine started!'));

        return this; // Allow chaining
    }

    /**
     * Launches the application by rendering the upgraded layout.
     *
     * This method ensures that `virtualLayout` is upgraded **before being attached to the DOM**,
     * preventing unnecessary module execution and ensuring only the filtered micro-apps are mounted.
     */
    async launch() {
        if (!this.engineStarted) {
            return console.warn('⚠️ Engine not started yet! Call startEngine() first.');
        }

        await this.engineStarted;

        if (this.launched) {
            return console.warn('⚠️ App already launched!');
        }

        console.log('🚀 Launching MicroTSMRootApp...');
        this.attachMiddleware();
        await twistThrottle(this.layout!);
        this.launched = true;
        this.trigger('onLoad');
        console.log('✅ App is live!');
    }

    /**
     * Configures all registered micro-apps before the application engine starts.
     *
     * This method allows customization of micro-app instances before they are initialized.
     * It should be called **before `startEngine()`** to ensure configurations are applied
     * before micro-apps begin lifecycle execution.
     *
     * @param callback - A function that receives each micro-app for configuration.
     *
     * @example
     * app.configureMicroApps((microApp) => {
     *     if (microApp.name === '@microtsm/navbar') {
     *         microApp.shouldMount = ({ currentRoute }) => currentRoute != '/login';
     *     }
     * });
     * app.startEngine();
     */
    public configureMicroApps(callback: (microApp: MicroTSMApplication) => void) {
        console.log('🔄 Configuring micro-apps...');

        this.registeredMicroApps.forEach((microApp) => {
            const name = microApp.getAttribute('name');
            const route = microApp.getAttribute('route');
            const isDefault = microApp.hasAttribute('default');

            Object.assign(microApp, { name, route, isDefault });
            callback(microApp);
        });
    }

    /**
     * Parses the provided layout string and updates `registeredMicroApps`.
     *
     * This method extracts all `<microtsm-application>` elements from the given layout string
     * and stores them in `registeredMicroApps`.
     *
     * @param {string} layout - The HTML string defining the application structure.
     * @throws {Error} If no layout is provided, preventing invalid initialization.
     */
    private registerMicroApps(layout: string) {
        let container: HTMLDivElement | null = document.createElement('div');
        container.innerHTML = layout;

        this.layout = container.querySelector('microtsm-layout')?.cloneNode(true) as MicroTSMLayout;

        if (!layout) {
            throw new Error(
                '🚨 MicroTSM initialization failed: No layout provided! ' +
                    'Ensure a <microtsm-layout> element is defined and passed into MicroTSMRootApp.',
            );
        }

        this.registeredMicroApps = Array.from(this.layout.querySelectorAll('microtsm-application'));

        container = null; // Frees up memory
    }

    /**
     * Triggers a lifecycle event by calling all registered callbacks
     * @param event - Event to trigger
     */
    private trigger(event: LifecycleEvent) {
        this.lifecycleEvents[event].forEach((callback) => callback());
    }

    /**
     * Validates a route change through registered middleware
     * @param url - URL to validate
     * @returns Whether route change is allowed
     */
    private async checkRoute(url: URL) {
        const route = new URL(url, window.location.origin);

        for (const middleware of this.routeMiddlewares) {
            const isAllowed = await middleware(route);
            if (!isAllowed) {
                console.warn(`🚫 Route blocked: ${route.pathname}`);
                return false;
            }
        }

        console.log(`✅ Route confirmed: ${route.pathname}`);
        return true;
    }

    /**
     * TODO: review this implementation, it's not working as expected
     * Attaches route middleware to the layout element
     * ERR: chunk-[hash].js:132 Throttling navigation to prevent the browser from hanging.
     * See https://crbug.com/1038223. Command line switch --disable-ipc-flooding-protection
     * can be used to bypass the protection
     * @private
     */
    private attachMiddleware() {
        this.layout?.attachRouteMiddleware?.(this.checkRoute.bind(this));
    }
}
