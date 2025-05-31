import layoutCss from './layout.css?raw';
import { MicroTSMLayout } from './layoutCustomElement';

/**
 * Kick-starts MicroTSM by registering custom elements and injecting styles.
 *
 * @async
 */
export async function kickstartEngine(): Promise<void> {
    console.log('🏍️ Kick-starting engine with layout custom elements:');
    if (!customElements.get('microtsm-layout')) await import('./layoutCustomElement');
    if (!customElements.get('microtsm-application')) await import('./appCustomElement');

    const style = document.createElement('style');
    style.innerHTML = layoutCss;
    document.head.appendChild(style);

    console.log('✅ Engine is running, custom elements registered.');
}

/**
 * 🚀 Twists the throttle by upgrading the provided virtual layout and applying it to the document body.
 *
 * This function ensures that only the necessary applications are mounted by upgrading `virtualLayout`
 * before inserting it into the DOM.
 *
 * @param virtualLayout {MicroTSMLayout} - The pre-rendered layout element that lacks custom element behavior.
 */
export async function twistThrottle(virtualLayout: MicroTSMLayout): Promise<void> {
    customElements.upgrade(virtualLayout);
    await virtualLayout.waitForReady();
    document.body.appendChild(virtualLayout);
    console.log('🏎️ Throttle twisted, layout applied!');
}
