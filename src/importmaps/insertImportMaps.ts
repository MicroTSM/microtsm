/**
 * Interface representing the structure of import maps configuration.
 */
export interface EngineWiring {
    imports: Record<string, string>;
}

/**
 * Wires the engine by injecting the module import map configuration.
 * Ensures all dependencies are linked before kick-starting the ride.
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
