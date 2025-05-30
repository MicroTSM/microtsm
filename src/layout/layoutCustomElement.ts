import {deepEqual} from "../utils/object.ts";

interface AppTemplateInfo {
    template: HTMLElement;
    parent: Node;
    nextSibling: ChildNode | null;
}

/**
 * Custom element that manages the layout and routing of micro-applications.
 * Handles mounting/unmounting of route-specific applications while maintaining
 * persistent apps.
 */
class MicroTSMLayout extends HTMLElement {
    private originalPushState = history.pushState;
    private originalReplaceState = history.replaceState;

    private microtsmIdSym = Symbol("microtsmId");
    private currentRoute: string = window.location.pathname;
    private appTemplates: Map<string, AppTemplateInfo> = new Map();

    private lastPushStateArgs: any[] | null = null;
    private lastReplaceStateArgs: any[] | null = null;
    private cachedRouteForUpdateApp: string | null = null


    /** Initializes the layout element */
    constructor() {
        super();
        console.log("🛠 MicroTSMLayout Initialized.");
    }

    /** Called when the element is inserted into the DOM */
    connectedCallback() {
        console.log("✅ connectedCallback: Component mounted.");
        this.cacheTemplates();
        this.updateApplications();
        this.patchHistoryStateEvents();
    }

    /** Called when the element is removed from the DOM */
    disconnectedCallback() {
        console.log("❌ disconnectedCallback: Cleaning up component.");
        this.appTemplates.clear();
        this.restoreHistoryState();
    }

    /** Updates applications based on the current route */
    updateApplications() {
        // Prevent unnecessary app update on the same route
        if (this.cachedRouteForUpdateApp === this.currentRoute) {
            return console.log("⚠️ Skipping application update: Route has not changed.");
        }

        this.cachedRouteForUpdateApp = this.currentRoute;
        let matchAppFound = false;
        let defaultApp: AppTemplateInfo | null = null;

        console.log("🔄 Checking which apps should be mounted/unmounted.");
        this.appTemplates.forEach(({template, parent, nextSibling}, id) => {
            const currentInstance = Array.from(this.children).find(
                (child) => (child as any)[this.microtsmIdSym] === id
            );

            const route = template.getAttribute("route");
            const isDefault = template.hasAttribute("default"); // ✅ Fixes boolean check
            const name = template.getAttribute("name");

            if (isDefault && currentInstance) {
                defaultApp = {template, parent, nextSibling};
                return currentInstance.remove();
            }

            if (!route || !name) return; // Skip persistent apps

            const shouldBeMounted = this.isRouteMatched(route);
            matchAppFound = shouldBeMounted || matchAppFound;
            console.log(`🔎 Checking route: "${route}" | Should Mount: ${shouldBeMounted}`);

            if (shouldBeMounted && !currentInstance) {
                console.log(`🟢 Mounting app with route: ${route}`);
                parent.insertBefore(template, nextSibling);
            } else if (!shouldBeMounted && currentInstance) {
                console.log(`🔴 Unmounting app with route: ${route}`);
                currentInstance.remove();
            }
        });

        // ✅ Render default app only if no other apps matched
        if (!matchAppFound && defaultApp) {
            console.log(`🟢 No matches found—Mounting default app`);
            defaultApp = (defaultApp as AppTemplateInfo);
            this.insertBefore(defaultApp.template, defaultApp.nextSibling);
        }
    }

    /** Caches micro-app templates */
    private cacheTemplates() {
        console.log("📌 cacheTemplates: Storing initial micro-app templates.");
        this.querySelectorAll("microtsm-application").forEach((app) => {
            const route = app.getAttribute("route");
            const isDefault = app.hasAttribute("default");
            if (!route && !isDefault) return; // Skip persistent apps

            let id = (app as any)[this.microtsmIdSym];
            if (!id) {
                id = crypto.randomUUID();
                (app as any)[this.microtsmIdSym] = id;
            }

            this.appTemplates.set(id, {
                template: app as HTMLElement,
                parent: app.parentNode as Node,
                nextSibling: app.nextSibling,
            });
        });
    }

    /** Handles navigation changes */
    private handleRouteChange() {
        console.log(`🚀 handleRouteChange: Route changed to ${window.location.pathname}`);
        this.currentRoute = window.location.pathname;
        this.updateApplications();
    }

    /** Restores original history state before unload or disconnection */
    private restoreHistoryState() {
        history.pushState = this.originalPushState;
        history.replaceState = this.originalReplaceState;
        console.log("♻️ restoreHistoryState: History state reset before unload.");
    }

    /** Overrides history methods to track navigation changes */
    private patchHistoryStateEvents() {
        console.log("🔧 patchHistoryStateEvents: Modifying history.pushState and history.replaceState.");

        const historyPushState = history.pushState;
        const historyReplaceState = history.replaceState;

        history.pushState = (...args) => {
            console.log("📢 pushState triggered:", args);
            historyPushState.apply(history, args);
            if (!deepEqual(args, this.lastPushStateArgs)) {
                this.lastPushStateArgs = args;
                this.handleRouteChange();
            }
        };

        history.replaceState = (...args) => {
            console.log("📢 replaceState triggered:", args);
            historyReplaceState.apply(history, args);
            if (!deepEqual(args, this.lastReplaceStateArgs)) {
                this.lastReplaceStateArgs = args;
                this.handleRouteChange();
            }
        };

        window.addEventListener("beforeunload", this.restoreHistoryState.bind(this), {once: true});
    }

    /** Checks if the given route matches the current path */
    private isRouteMatched(route: string, options: { exactMatch?: boolean; caseSensitive?: boolean } = {}): boolean {
        const {exactMatch = false, caseSensitive = false} = options;
        let currentPath = this.currentRoute;

        if (!caseSensitive) {
            route = route.toLowerCase();
            currentPath = currentPath.toLowerCase();
        }

        // Remove trailing slashes for consistency
        route = route.replace(/\/$/, "");
        currentPath = currentPath.replace(/\/$/, "");

        if (exactMatch) return currentPath === route;
        return currentPath === route || currentPath.startsWith(route + "/");
    }
}

customElements.define("microtsm-layout", MicroTSMLayout);