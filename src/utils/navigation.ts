/**
 * Navigates to a specified URL. The function accepts a string URL,
 * an event (from which it uses event.currentTarget.href), or, if called with an anchor element as context, it uses that element’s href.
 *
 * It uses the URL constructor for parsing and comparing the current and destination URLs.
 *
 * @param obj - Either a string URL, an event with a currentTarget that is an HTMLAnchorElement, or an anchor element as context.
 * @returns In test mode for external navigation, returns an object indicating a page reload would have happened.
 *
 * @throws Error if the argument is invalid.
 */
export function navigateToUrl(obj: string | Event): void {
    let url: string;

    // 1. If we have a string, assume it's the URL.
    if (typeof obj === 'string') {
        url = obj;
    }

    // 2. If it's an event and the currentTarget is an anchor element, use its href and prevent default.
    else if (
        obj &&
        'currentTarget' in obj &&
        obj.currentTarget instanceof HTMLAnchorElement &&
        typeof obj.preventDefault === 'function'
    ) {
        url = obj.currentTarget.href;
        obj.preventDefault();
    } else {
        throw new Error(
            `navigateToUrl must be called with a string URL, an <a> element as its 'this' context, or with an event whose currentTarget is an <a> tag.`,
        );
    }

    // Build URL objects relative to the current page URL.
    const currentUrl = new URL(window.location.href);
    const destinationUrl = new URL(url, window.location.href);

    const cancelNavigation = () => {
        window.history.replaceState(history.state, '', currentUrl.href.replace(currentUrl.origin, ''));
    };

    window.dispatchEvent(
        new CustomEvent('microtsm:before-navigation-event', {
            detail: { from: currentUrl, to: destinationUrl, cancelNavigation },
        }),
    );

    // Case 1: Navigation is just a hash change.
    if (url.startsWith('#')) {
        window.location.hash = destinationUrl.hash;
    }

    // Case 2: External host – a full page reload.
    else if (currentUrl.host !== destinationUrl.host && destinationUrl.host) {
        window.location.href = url;
    }

    // Case 3: Same pathname and query – only hash change.
    else if (destinationUrl.pathname === currentUrl.pathname && destinationUrl.search === currentUrl.search) {
        window.location.hash = destinationUrl.hash;
    }

    // Case 4: Different path or query – use history API.
    else {
        window.history.pushState(history.state, '', url);
    }

    window.dispatchEvent(
        new CustomEvent('microtsm:navigation-event', {
            detail: { from: currentUrl, to: destinationUrl },
        }),
    );
}

declare global {
    interface WindowEventMap {
        'microtsm:before-navigation-event': CustomEvent<{ to: URL; from: URL; cancelNavigation: () => void }>;
        'microtsm:navigation-event': CustomEvent<{ to: URL; from: URL; cancelNavigation: () => void }>;
    }
}
