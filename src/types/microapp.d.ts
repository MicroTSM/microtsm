/**
 * Interface representing the properties that can be passed during lifecycle methods.
 * These properties are used to configure the mounting and behavior of the micro app.
 */
export interface MicroAppProps {
    /**
     * An explicit DOM element where the app should mount.
     * Takes precedence over the el option if provided.
     */
    domElement?: HTMLElement;

    /**
     * Name identifier for the micro app.
     * Used to create a custom element if no mount target is specified.
     */
    name?: string;

    /**
     * Additional custom properties that can be passed to the micro app.
     */
    [key: string]: any;
}

/**
 * Defines the standard lifecycle methods that a micro app must implement.
 * These methods manage the app's lifecycle from bootstrap to unmount.
 */
export interface MicroAppLifecycle {
    /**
     * Initializes the micro app.
     * Currently, it resolves immediately but can be extended for setup needs.
     */
    bootstrap: () => Promise<void>;

    /**
     * Mounts the micro app into the DOM.
     * Creates and configures a Vue app instance, determines mount target,
     * and handles instance customization.
     *
     * @param props - Configuration properties for mounting
     * @returns Promise resolving to the mounted Vue app instance
     */
    mount: (props?: MicroAppProps) => Promise<App>;

    /**
     * Updates the micro app with new properties.
     * Merges new props into the Vue app's global properties.
     *
     * @param props - New properties to apply
     */
    update: (props?: MicroAppProps) => Promise<void>;

    /**
     * Unmounts the micro app and cleans up resources.
     * Removes the app from DOM and clears the stored instance.
     */
    unmount: () => Promise<void>;
}