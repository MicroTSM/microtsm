const panel = document.getElementById('devtools-panel')!;
const toggleButton = panel.querySelector<HTMLButtonElement>('#toggle-fullscreen-btn')!;
const iconElement = toggleButton.querySelector('iconify-icon')!;
const closeButton = panel.querySelector<HTMLButtonElement>('#close-panel-btn')!;
const searchInput = panel.querySelector<HTMLInputElement>('#search-modules-input')!;
const modulesTbody = panel.querySelector<HTMLTableSectionElement>('#modules-tbody')!;
const persistedStatus = panel.querySelector('#persisted-status')!;

toggleButton.addEventListener('click', () => {
    if (panel.classList.contains('devtools-panel-compact')) {
        panel.classList.remove(
            'w-[850px]',
            'max-h-[calc(100vh-32px)]',
            'fixed',
            'bottom-4',
            'right-4',
            'rounded-xl',
            'shadow-2xl',
            'devtools-panel-compact',
        );
        panel.classList.add(
            'w-screen',
            'h-screen',
            'fixed',
            'top-0',
            'left-0',
            'rounded-none',
            'shadow-none',
            'devtools-panel-fullscreen',
        );
        iconElement.setAttribute('icon', 'mdi:fullscreen-exit'); // Changed icon
        toggleButton.title = 'Exit Fullscreen';
    } else {
        panel.classList.remove(
            'w-screen',
            'h-screen',
            'fixed',
            'top-0',
            'left-0',
            'rounded-none',
            'shadow-none',
            'devtools-panel-fullscreen',
        );
        panel.classList.add(
            'w-[850px]',
            'max-h-[calc(100vh-32px)]',
            'fixed',
            'bottom-4',
            'right-4',
            'rounded-xl',
            'shadow-2xl',
            'devtools-panel-compact',
        );
        iconElement.setAttribute('icon', 'mdi:fullscreen'); // Changed icon
        toggleButton.title = 'Toggle Fullscreen';
    }
});

closeButton.addEventListener('click', () => {
    panel.style.display = 'none'; // Or remove from DOM if preferred
    // You might want to add logic here to persist panel state (e.g., closed) in localStorage
});

const tabButtons = panel.querySelectorAll<HTMLButtonElement>('aside nav button');
const tabPanes = panel.querySelectorAll<HTMLDivElement>('main .tab-pane');
tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
        tabButtons.forEach((btn) => {
            btn.classList.remove('tab-active');
            btn.classList.add('text-slate-700', 'hover:bg-slate-100', 'border-transparent');
        });
        tabPanes.forEach((pane) => {
            pane.classList.add('hidden');
        });
        button.classList.add('tab-active');
        button.classList.remove('text-slate-700', 'hover:bg-slate-100', 'border-transparent');
        const tabId = button.dataset.tab;
        const activePane = panel.querySelector(`#tab-content-${tabId}`);
        if (activePane) {
            activePane.classList.remove('hidden');
        }
    });
});

// Search functionality
searchInput.addEventListener('input', (event) => {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    const rows = modulesTbody.querySelectorAll('tr');
    rows.forEach((row) => {
        const moduleName = row.querySelector('td:first-child')?.textContent?.toLowerCase() ?? '';
        const originalUrl = row.querySelector('td:nth-child(2)')?.textContent?.toLowerCase() ?? '';
        if (moduleName.includes(searchTerm) || originalUrl.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});

// Action buttons functionality (Save and Reset)
modulesTbody.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest('button');
    if (!target) return;
    const row = target.closest('tr');
    const moduleName = row?.querySelector('td:first-child')?.textContent ?? '';
    const overrideInput = row?.querySelector<HTMLInputElement>('.module-override-url');

    if (target.classList.contains('save-override-btn')) {
        const overrideUrl = overrideInput?.value ?? '';

        // Add your actual save logic here (e.g., update localStorage, send to backend)
        alert(`Override for ${moduleName} saved to: ${overrideUrl || ' (cleared)'}`);
        persistedStatus.classList.remove('bg-yellow-100', 'text-yellow-700');
        persistedStatus.classList.add('bg-green-100', 'text-green-700');
        persistedStatus.innerHTML = `<iconify-icon icon="mdi:content-save-check-outline" class="text-base mr-1"></iconify-icon> Overrides Persisted`;
        // Simulate a successful save by changing the icon
        const saveIcon = target.querySelector('iconify-icon');
        saveIcon?.setAttribute('icon', 'mdi:content-save-check-outline');
        saveIcon?.classList.add('text-green-600');
        setTimeout(() => {
            saveIcon?.setAttribute('icon', 'mdi:content-save-outline');
            saveIcon?.classList.remove('text-green-600');
        }, 1500);
    } else if (target.classList.contains('reset-override-btn')) {
        alert(`Override for ${moduleName} reset.`);
        if (overrideInput) overrideInput.value = ''; // Or set to the original URL if you have it stored
        persistedStatus.classList.remove('bg-green-100', 'text-green-700');
        persistedStatus.classList.add('bg-yellow-100', 'text-yellow-700');
        persistedStatus.innerHTML = `<iconify-icon icon="mdi:alert-circle-outline" class="text-base mr-1"></iconify-icon> Changes Not Persisted`;
    }
});

// Monitor changes in override inputs to update the persisted status
modulesTbody.addEventListener('input', (event) => {
    if ((event.target as HTMLInputElement).classList.contains('module-override-url')) {
        persistedStatus.classList.remove('bg-green-100', 'text-green-700');
        persistedStatus.classList.add('bg-yellow-100', 'text-yellow-700');
        persistedStatus.innerHTML = `<iconify-icon icon="mdi:alert-circle-outline" class="text-base mr-1"></iconify-icon> Changes Not Persisted`;
    }
});
