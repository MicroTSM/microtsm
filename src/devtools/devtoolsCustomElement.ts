import eventBus from '../event-bus';

class MicrotsmDevtools extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        eventBus.emit('devtools:activated');
    }

    disconnectedCallback() {
        eventBus.emit('devtools:deactivated');
    }
}

if (!customElements.get('microtsm-devtools')) {
    customElements.define('microtsm-devtools', MicrotsmDevtools);
}

const activating =
    '<span class="material-symbols-outlined mr-2 align-middle">keyboard_command_key</span> DevTools Activating...';
const activated =
    '<span class="material-symbols-outlined mr-2 align-middle">keyboard_command_key</span> DevTools Activated';
const deactivated =
    '<span class="material-symbols-outlined mr-2 align-middle">keyboard_command_key</span> DevTools Deactivated';

function createActivationIndicator() {
    const materialIconsLink = document.createElement('link');
    materialIconsLink.rel = 'stylesheet';
    materialIconsLink.href =
        'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=keyboard_command_key';
    document.head.appendChild(materialIconsLink);

    const style = document.createElement('style');
    style.textContent = `
        .activation-indicator {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 0.875rem;
            z-index: 100;
            opacity: 0;
            transition:
                opacity 0.3s ease-in-out,
                transform 0.3s ease-in-out;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        .activation-indicator.visible {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    `;
    document.head.appendChild(style);

    const indicator = document.createElement('div');
    indicator.className = 'activation-indicator';
    indicator.id = 'activation-indicator';
    indicator.innerHTML = activating;
    document.body.appendChild(indicator);
    return indicator;
}

const indicator = createActivationIndicator();

eventBus.on('devtools:activated', () => {
    indicator.innerHTML = activated;
    setTimeout(() => {
        indicator.classList.remove('visible');
    }, 1500);
});

eventBus.on('devtools:deactivated', () => {
    showIndicator(deactivated);
    setTimeout(() => {
        indicator.classList.remove('visible');
    }, 1500);
});

function showIndicator(innerHTML?: string) {
    indicator.innerHTML = innerHTML ?? activating;
    indicator.classList.add('visible');
}

export { showIndicator };
