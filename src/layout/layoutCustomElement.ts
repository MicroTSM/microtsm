import { MicroTSMApplication } from '../app/appCustomElement.ts';
import crypto from '../utils/crypto.ts';

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

            const {
                route = template.getAttribute('route'),
                name = template.getAttribute('name'),
                isDefault = template.hasAttribute('default'),
            } = template;

            if (isDefault) {
                defaultApp = { template, parent, nextSibling };
                currentInstance?.remove();
                continue;
            }

            const isRouteMatched = !route || (!!route && this.isRouteMatched(route));
            const shouldMountHookPassed = template.shouldMount?.({ currentRoute: this.currentRoute }) ?? true;
            const shouldBeMounted = isRouteMatched && shouldMountHookPassed;

            hasRoutedAppMatch = (!!route && shouldBeMounted) || hasRoutedAppMatch;
            if (hasRoutedAppMatch && route) this.previousMicroAppRoute = route;

            console.log(`🔎 Checking route: "${route}" | Name: "${name}" | Should Mount: ${shouldBeMounted}`);

            if (shouldBeMounted && !currentInstance) {
                console.log(`🟢 Mounting app with route: ${route}`);
                parent.insertBefore(template, nextSibling);
            } else if (!shouldBeMounted && currentInstance) {
                console.log(`🔴 Unmounting app with route: ${route}`);
                currentInstance.remove();
                name && window.MicroTSM.unload(name);
            }
        }

        // ✅ Render default app only if no other apps matched
        if (!hasRoutedAppMatch && defaultApp) {
            console.log(`🟢 No matches found—Mounting default app`);
            defaultApp = defaultApp as AppTemplateInfo;
            defaultApp.parent.insertBefore(defaultApp.template, defaultApp.nextSibling);
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

        window.addEventListener('popstate', (e: PopStateEvent) => {
            // Prevent popstate events from triggering route changes, it can cause unexpected redirect to not-found
            history.replaceState(
                e.state,
                '',
                e.state.current ?? e.state.url ?? location.href.replace(location.origin, ''),
            );
        });

        window.addEventListener('beforeunload', this.restoreHistoryState.bind(this), { once: true });
    }

    /**
     * Determines if the route change affects a different micro-app.
     * This ensures `updateApplications()` is only triggered when switching between apps,
     * not when navigating internally within the same app.
     */
    private microAppChanged(currentMicroAppRoute: string): boolean {
        // 🚀 Only update if switching micro-apps
        if (this.previousMicroAppRoute !== currentMicroAppRoute) {
            return true;
        }

        return false;
    }

    /**
     * 🚀 **Checks if a given route matches the current application path.**
     *
     * This function handles:
     * - **Leading slash normalization** (ensures "path" matches "/path").
     * - **Case sensitivity** options.
     * - **Exact vs. partial route matching** (supports nested paths).
     * - **Trailing slash consistency**.
     *
     * 🔹 **Matching Behavior:**
     * - `"path"` will correctly match `"/path"` even if the leading slash is missing.
     * - Supports **exact matching** (`exactMatch: true`).
     * - Supports **partial matching** (e.g., `"dashboard"` matches `"/dashboard/settings"`).
     * - Automatically removes unnecessary trailing slashes.
     *
     * @param {string} route - The route to check (may or may not start with `/`).
     * @param {Object} options - Matching options.
     * @param {boolean} [options.exactMatch=false] - If true, requires an exact match.
     * @param {boolean} [options.caseSensitive=false] - If false, ignores case when comparing.
     * @returns {boolean} **`true`** if the route matches, otherwise **`false`**.
     */
    private isRouteMatched(route: string, options: { exactMatch?: boolean; caseSensitive?: boolean } = {}): boolean {
        const { exactMatch = false, caseSensitive = false } = options;
        let currentPath = this.currentRoute;

        if (!caseSensitive) {
            route = route.toLowerCase();
            currentPath = currentPath.toLowerCase();
        }

        // Ensure both paths start with a slash for consistency
        if (!route.startsWith('/')) route = `/${route}`;

        // Normalize paths by removing trailing slashes
        route = route.replace(/\/$/, '');
        currentPath = currentPath.replace(/\/$/, '');

        // Exact match condition
        if (exactMatch) return currentPath === route;

        // Match any valid sub-path (e.g., "dashboard" matches "/dashboard/settings")
        return currentPath.startsWith(route + '/') || currentPath === route;
    }
}

customElements.define('microtsm-layout', MicroTSMLayout);
