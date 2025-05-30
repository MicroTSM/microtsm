import {kickstartEngine, twistThrottle} from "../layout/startLayoutEngine";
import {wireEngine} from "../importmaps/insertImportMaps";
import {gearUp} from "../importmaps/loadStyleheets";

/**
 * Type definitions for lifecycle events and route middleware
 */
export type LifecycleEvent = "onLoad" | "onBeforeUnload" | "onUnload" | "onBeforeDestroy" | "onDestroy";
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
    /** Base URL for the application */
    protected baseUrl: string | undefined;

    /** HTML layout string for the application layout */
    private readonly layout: string;

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
    private engineStarted = false;

    /** Flag indicating if the app has been launched */
    private launched = false;

    /**
     * Creates a new MicroTSMRootApp instance
     */
    constructor({layout, baseUrl}: MicroTSMRootAppConfig) {
        this.baseUrl = baseUrl;
        this.layout = layout;
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
        this.on("onLoad", callback);
    }

    onBeforeUnload(callback: () => void): void {
        this.on("onBeforeUnload", callback);
    }

    onUnload(callback: () => void): void {
        this.on("onUnload", callback);
    }

    onBeforeDestroy(callback: () => void): void {
        this.on("onBeforeDestroy", callback);
    }

    onDestroy(callback: () => void): void {
        this.on("onDestroy", callback);
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
     * Initializes custom elements and sets up route watching
     */
    async startEngine() {
        if (this.engineStarted) {
            console.warn("⚠️ Engine already started!");
            return;
        }

        console.log("🏍️ Starting engine...");

        await wireEngine();
        await gearUp()
        await kickstartEngine();
        this.engineStarted = true;
        console.log("✅ Engine ready!");
        this.watchRoad();
    }

    /**
     * Launches the application
     * Triggers initial lifecycle events and renders layout
     */
    async launch() {
        if (!this.engineStarted) {
            return console.warn("⚠️ Engine not started yet! Call startEngine() first.");

        }

        if (this.launched) {
            return console.warn("⚠️ App already launched!");
        }

        console.log("🚀 Launching MicroTSMRootApp...");
        this.trigger("onLoad");
        twistThrottle(this.layout)
        this.launched = true;
        console.log("✅ App is live!");
    }

    /**
     * Triggers a lifecycle event by calling all registered callbacks
     * @param event - Event to trigger
     */
    private trigger(event: LifecycleEvent) {
        this.lifecycleEvents[event].forEach(callback => callback());
    }

    /**
     * Validates a route change through registered middleware
     * @param url - URL to validate
     * @returns Whether route change is allowed
     */
    private async checkRoute(url: string) {
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
     * Sets up route change monitoring
     * Intercepts history API calls and popstate events
     */
    private watchRoad() {
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = async (data, unused, url) => {
            if (typeof url === "string" && await this.checkRoute(url)) {
                originalPushState.call(history, data, unused, url);
            }
        };

        history.replaceState = async (data, unused, url) => {
            if (typeof url === "string" && await this.checkRoute(url)) {
                originalReplaceState.call(history, data, unused, url);
            }
        };

        window.addEventListener("popstate", async () => {
            await this.checkRoute(window.location.href);
        });

        console.log("👀 Watching the road for navigation changes...");
    }
}