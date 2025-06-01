/**
 * Interface representing the structure of import maps configuration.
 */
export interface EngineWiring {
    imports: Record<string, string>;
}

/**
 * Wires the engine by injecting the module import map configuration.
 * Ensures all dependencies are linked before kick-starting the ride.
 *
 * FIXME:
 * There is bug: Uncaught (in promise) TypeError: The specifier "axios" was a bare specifier, but was not remapped to anything.
 * Relative module specifiers must start with "./", "../" or "/". session.service-D2tprv2V.js:1:35
 *
 * On "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:139.0) Gecko/20100101 Firefox/139.0"
 *
 * Solved by injecting the import map on built time.
 */
export async function wireEngine(): Promise<void> {
    const path = '/importmaps/imports.json'; // 🔒 Fixed path for now, future update may allow customization
    const wiring: EngineWiring = await fetch(path).then((res) => res.json());

    const script = document.createElement('script');
    script.type = 'importmap';
    script.textContent = JSON.stringify(wiring, null, 2);
    document.head.appendChild(script);

    console.log('⚙️ Engine wired, dependencies mapped!');
}
