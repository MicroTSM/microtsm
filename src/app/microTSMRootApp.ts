import { kickstartEngine, twistThrottle } from '../layout/startLayoutEngine';
import { gearUp } from '../importmaps/loadStyleheets';
import { MicroTSMApplication } from './appCustomElement.ts';
import { MicroTSMLayout } from '../layout/layoutCustomElement.ts';

/**
 * Type definitions for lifecycle events and route middleware
 */
export type LifecycleEvent =
    | 'onBeforeLaunch'
    | 'onLaunch'
    | 'onBeforeUpdate'
    | 'onUpdate'
    | 'onBeforeDestroy'
    | 'onDestroy';

export type RouteMiddleware = (route: URL) => Promise<boolean> | boolean;
export type LifeCycleCallback = () => Promise<void> | void;
export type MicroAppConfigurationCallback = (microApp: MicroTSMApplication) => void;

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
    static _layoutString: string = '';
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
        onBeforeLaunch: new Set(),
        onLaunch: new Set(),
        onBeforeUpdate: new Set(),
        onUpdate: new Set(),
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
        MicroTSMRootApp._layoutString = layout.replace(/>([\s\r\n]+)</g, '><').trim();
        this.createLayoutElement();
        this.registerMicroApps();
    }

    /**
     * Registers a lifecycle callback
     * @param event - Lifecycle event to register for
     * @param callback - Function to call when event occurs
     */
    on(event: LifecycleEvent, callback: LifeCycleCallback): void {
        this.lifecycleEvents[event].add(callback);
    }

    /** 🔄 **Initialization Stage** */
    onBeforeLaunch(callback: LifeCycleCallback): void {
        // Runs before anything loads
        this.on('onBeforeLaunch', callback);
    }

    onLaunch(callback: LifeCycleCallback): void {
        // When the app is fully loaded
        this.on('onLaunch', callback);
    }

    /** ⚡ **Active Runtime Stage** */
    onBeforeUpdate(callback: LifeCycleCallback): void {
        // Before state or props update
        this.on('onBeforeUpdate', callback);
    }

    onUpdate(callback: LifeCycleCallback): void {
        // When an update occurs
        this.on('onUpdate', callback);
    }

    /** 🔻 **Cleanup & Teardown Stage** */
    onBeforeDestroy(callback: LifeCycleCallback): void {
        this.on('onBeforeDestroy', callback);
    }

    onDestroy(callback: LifeCycleCallback): void {
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

        this.engineStarted = Promise.all([gearUp(), kickstartEngine()]);
        this.engineStarted.then(() => console.log('✅ Engine started!'));

        window.MicroTSM.rootApp = this;
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
        await this.trigger('onBeforeLaunch');

        if (this.launched) {
            return console.warn('⚠️ App already launched!');
        }

        console.log('🚀 Launching MicroTSMRootApp...');
        await twistThrottle(this.layout!);
        this.attachMiddleware();
        this.launched = true;
        await this.trigger('onLaunch');
        console.log('✅ App is live!');
    }

    /**
     * Relaunches the app when importmaps are updated.
     */
    async relaunch() {
        window.dispatchEvent(new CustomEvent('microtsm:root-app-relaunch')); // Also used in Register Worker script to update importmap on service worker
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
    public configureMicroApps(callback: MicroAppConfigurationCallback): void {
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
     */
    private createLayoutElement(): void {
        let container: HTMLDivElement | null = document.createElement('div');
        container.innerHTML = MicroTSMRootApp._layoutString;

        this.layout = container.querySelector('microtsm-layout')?.cloneNode(true) as MicroTSMLayout;
        container = null; // Frees up memory
    }

    /**
     * This method extracts all `<microtsm-application>` elements from the given layout string
     * and stores them in `registeredMicroApps`.
     *
     * @throws {Error} If no layout is provided, preventing invalid initialization.
     */
    private registerMicroApps(): void {
        if (!this.layout) {
            throw new Error(
                '🚨 MicroTSM initialization failed: No layout provided! ' +
                    'Ensure a <microtsm-layout> element is defined and passed into MicroTSMRootApp.',
            );
        }

        this.registeredMicroApps = Array.from(this.layout.querySelectorAll('microtsm-application'));
    }

    /**
     * Triggers a lifecycle event by calling all registered callbacks
     * @param event - Event to trigger
     */
    private async trigger(event: LifecycleEvent): Promise<void> {
        const callbacks = this.lifecycleEvents[event];
        await Promise.all([...callbacks].map(async (callback) => callback()));
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
     * RESOLVED! TODO: Add integration with vue-router
     * @private
     */
    private attachMiddleware() {
        this.layout?.attachRouteMiddleware?.(this.checkRoute.bind(this));
    }
}
