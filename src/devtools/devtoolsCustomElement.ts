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

const keyboardCommandIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff"><path d="M260-120q-58 0-99-41t-41-99q0-58 41-99t99-41h60v-160h-60q-58 0-99-41t-41-99q0-58 41-99t99-41q58 0 99 41t41 99v60h160v-60q0-58 41-99t99-41q58 0 99 41t41 99q0 58-41 99t-99 41h-60v160h60q58 0 99 41t41 99q0 58-41 99t-99 41q-58 0-99-41t-41-99v-60H400v60q0 58-41 99t-99 41Zm0-80q25 0 42.5-17.5T320-260v-60h-60q-25 0-42.5 17.5T200-260q0 25 17.5 42.5T260-200Zm440 0q25 0 42.5-17.5T760-260q0-25-17.5-42.5T700-320h-60v60q0 25 17.5 42.5T700-200ZM400-400h160v-160H400v160ZM260-640h60v-60q0-25-17.5-42.5T260-760q-25 0-42.5 17.5T200-700q0 25 17.5 42.5T260-640Zm380 0h60q25 0 42.5-17.5T760-700q0-25-17.5-42.5T700-760q-25 0-42.5 17.5T640-700v60Z"/></svg>';

const activating = `${keyboardCommandIcon} DevTools Activating...`;
const activated = `${keyboardCommandIcon} DevTools Activated`;
const deactivated = `${keyboardCommandIcon} DevTools Deactivated`;

function createActivationIndicator() {
    const style = document.createElement('style');
    style.textContent = `
        .activation-indicator {
            position: fixed;
            top: 20px;
            left: 50%;
            display: inline-flex;
            align-items: center;
            line-height: 1;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 0.875rem;
            z-index: -1;
            opacity: 0;
            transition:
                opacity 0.3s ease-in-out,
                transform 0.3s ease-in-out;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        
        .activation-indicator svg {
            display: inline-block;
            margin-right: 10px;
        }

        .activation-indicator.visible {
            opacity: 1;
            z-index: 100;
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
