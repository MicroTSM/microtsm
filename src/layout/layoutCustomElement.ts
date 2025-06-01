import { MicroTSMApplication } from './appCustomElement.ts';

export interface AppTemplateInfo {
    template: MicroTSMApplication;
    parent: Node;
    nextSibling: ChildNode | null;
}

const microtsmIdSym = Symbol('microtsmId');

/**
 * Custom element that manages the layout and routing of micro-applications.
 * Handles mounting/unmounting of route-specific applications while maintaining
 * persistent apps.
 */
export class MicroTSMLayout extends HTMLElement {
    private originalPushState = history.pushState;
    private originalReplaceState = history.replaceState;

    // TODO: make the route is object route with other property like query
    private currentRoute: string = window.location.pathname;
    private previousMicroAppRoute: string | null = null;
    private readonly isReadyPromise: Promise<void> | null = null;
    private isReadyPromiseResolve: (() => void) | null = null;

    /** Initializes the layout element */
    constructor() {
        super();
        this.isReadyPromise = new Promise((resolve) => {
            this.isReadyPromiseResolve = resolve;
        });

        this.initialize();
    }

    private _appTemplates: Map<string, AppTemplateInfo> = new Map();

    get appTemplates(): Map<string, AppTemplateInfo> {
        return this._appTemplates;
    }

    /** Called when the element is inserted into the DOM */
    connectedCallback() {
        this.patchHistoryStateEvents();
    }

    /** Called when the element is removed from the DOM */
    disconnectedCallback() {
        console.log('❌ disconnectedCallback: Cleaning up component.');
        this.appTemplates.clear();
        this.restoreHistoryState();
    }

    /**
     * Caches micro-app layout for later use.
     *
     * This element is rendered on memory and not appended to the DOM Tree.
     * See {@link MicroTSMRootApp.registerMicroApps}
     */
    public cacheLayout() {
        console.log('📌 cacheLayout: Storing initial micro-app templates.');
        this.querySelectorAll<MicroTSMApplication>('microtsm-application').forEach((app) => {
            let id = (app as any)[microtsmIdSym];
            if (!id) {
                id = crypto.randomUUID();
                (app as any)[microtsmIdSym] = id;
            }

            this.appTemplates.set(id, {
                template: app,
                parent: app.parentNode as Node,
                nextSibling: app.nextSibling,
            });
        });
    }

    /**
     * TODO: review this implementation, it's not working as expected
     * Attaches route middleware to the layout element
     * @param middleware
     */
    public attachRouteMiddleware(middleware: (url: URL) => boolean | Promise<boolean>) {
        return middleware;
    }

    public async waitForReady() {
        await this.isReadyPromise;
    }

    private initialize() {
        this.cacheLayout();
        this.updateApplications().then(this.isReadyPromiseResolve);
    }

    /**
     * Updates applications based on the current route.
     */
    private async updateApplications() {
        let hasRoutedAppMatch = false;
        let defaultApp: AppTemplateInfo | null = null;

        console.log('🔄 Checking which apps should be mounted/unmounted.');
        for (const [id, { template, parent, nextSibling }] of this.appTemplates) {
            const currentInstance = Array.from(this.querySelectorAll('microtsm-application')).find(
                (child) => (child as any)[microtsmIdSym] === id,
            );

            const { route = template.getAttribute('route'), isDefault = template.hasAttribute('default') } = template;

            if (isDefault) {
                defaultApp = { template, parent, nextSibling };
                currentInstance?.remove();
                continue;
            }

            const isRouteMatched = !route || (!!route && this.isRouteMatched(route));
            const shouldMountHookPassed = template.shouldMount?.({ currentRoute: this.currentRoute }) ?? true;
            const shouldBeMounted = isRouteMatched && shouldMountHookPassed;

            hasRoutedAppMatch = (!!route && shouldBeMounted) || hasRoutedAppMatch;
            console.log(`🔎 Checking route: "${route}" | Should Mount: ${shouldBeMounted}`);

            if (shouldBeMounted && !currentInstance) {
                console.log(`🟢 Mounting app with route: ${route}`);
                parent.insertBefore(template, nextSibling);
            } else if (!shouldBeMounted && currentInstance) {
                console.log(`🔴 Unmounting app with route: ${route}`);
                currentInstance.remove();
            }
        }

        // ✅ Render default app only if no other apps matched
        if (!hasRoutedAppMatch && defaultApp) {
            console.log(`🟢 No matches found—Mounting default app`);
            defaultApp = defaultApp as AppTemplateInfo;
            this.insertBefore(defaultApp.template, defaultApp.nextSibling);
        }
    }

    /** Handles navigation changes */
    private handleRouteChange() {
        console.log(`🚀 handleRouteChange: Route changed to ${window.location.pathname}`);
        this.currentRoute = window.location.pathname;
        (this.microAppChanged(this.currentRoute) && this.updateApplications()) ||
            console.log('⚠️ Skipping application update: No app change detected.');
    }

    /** Restores original history state before unload or disconnection */
    private restoreHistoryState() {
        history.pushState = this.originalPushState;
        history.replaceState = this.originalReplaceState;
        console.log('♻️ restoreHistoryState: History state reset before unload.');
    }

    /** Overrides history methods to track navigation changes */
    private patchHistoryStateEvents() {
        console.log('🔧 patchHistoryStateEvents: Modifying history.pushState and history.replaceState.');

        const historyPushState = history.pushState;
        const historyReplaceState = history.replaceState;

        history.pushState = (...args) => {
            console.log('📢 pushState triggered:', args);
            historyPushState.apply(history, args);
            this.handleRouteChange();
        };

        history.replaceState = (...args) => {
            console.log('📢 replaceState triggered:', args);
            historyReplaceState.apply(history, args);
            this.handleRouteChange();
        };

        window.addEventListener('beforeunload', this.restoreHistoryState.bind(this), { once: true });
    }

    /**
     * Determines if the route change affects a different micro-app.
     * This ensures `updateApplications()` is only triggered when switching between apps,
     * not when navigating internally within the same app.
     */
    private microAppChanged(newRoute: string): boolean {
        const currentMicroAppRoute = this.getMicroAppRoute(newRoute);

        // 🚀 Only update if switching micro-apps
        if (this.previousMicroAppRoute !== currentMicroAppRoute) {
            this.previousMicroAppRoute = currentMicroAppRoute;
            return true;
        }

        return false;
    }

    /**
     * Extracts the micro-app route prefix from a given URL.
     * Adjust this logic based on your app's routing structure.
     */
    private getMicroAppRoute(route: string): string {
        return route.split('/')[1] || ''; // Assumes micro-apps are at the first path segment ("/dashboard", "/settings", etc.)
    }

    /** Checks if the given route matches the current path */
    private isRouteMatched(route: string, options: { exactMatch?: boolean; caseSensitive?: boolean } = {}): boolean {
        const { exactMatch = false, caseSensitive = false } = options;
        let currentPath = this.currentRoute;

        if (!caseSensitive) {
            route = route.toLowerCase();
            currentPath = currentPath.toLowerCase();
        }

        // Remove trailing slashes for consistency
        route = route.replace(/\/$/, '');
        currentPath = currentPath.replace(/\/$/, '');

        if (exactMatch) return currentPath === route;
        return currentPath === route || currentPath.startsWith(route + '/');
    }
}

customElements.define('microtsm-layout', MicroTSMLayout);
