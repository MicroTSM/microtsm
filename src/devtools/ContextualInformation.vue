<script setup lang="ts">
import { onMounted, ref } from 'vue';

onMounted(async () => {
    if ('serviceWorker' in navigator) {
        try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            if (registrations.length > 0) {
                // Map out details for each registration
                activeServiceWorker.value = registrations
                    .map((reg) => {
                        const scriptURL = reg.active ? reg.active.scriptURL : 'None';
                        return `Scope: ${reg.scope}, Script: ${scriptURL}`;
                    })
                    .join('\n');
            } else {
                activeServiceWorker.value = 'No service worker registrations found';
            }
        } catch (err) {
            activeServiceWorker.value = 'Error retrieving service worker info';
        }
    }
});

const activeServiceWorker = ref('No service worker active');

const baseUrl = import.meta.url;

const userAgent = navigator.userAgent || 'Unknown';

const polyfills = window.MicroTSM?.polyfills || [];
const polyfillsDisplay = polyfills.length ? polyfills.join(', ') : 'None';

const mtsmVersion = window.MicroTSM?.version || 'unknown';
const devtoolsVersion = window.MicroTSM?.version || 'unknown';

function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';
    let osName = 'Unknown';
    let osVersion = 'Unknown';

    // Detect browser name and version
    if (ua.indexOf('Firefox') > -1) {
        browserName = 'Firefox';
        const match = ua.match(/Firefox\/([\d.]+)/);
        if (match) browserVersion = match[1];
    } else if (ua.indexOf('Edg') > -1) {
        browserName = 'Edge';
        const match = ua.match(/Edg\/([\d.]+)/);
        if (match) browserVersion = match[1];
    } else if (ua.indexOf('OPR') > -1) {
        browserName = 'Opera';
        const match = ua.match(/OPR\/([\d.]+)/);
        if (match) browserVersion = match[1];
    } else if (ua.indexOf('Chrome') > -1) {
        browserName = 'Chrome';
        const match = ua.match(/Chrome\/([\d.]+)/);
        if (match) browserVersion = match[1];
    } else if (ua.indexOf('Safari') > -1) {
        browserName = 'Safari';
        const match = ua.match(/Version\/([\d.]+)/);
        if (match) browserVersion = match[1];
    } else if (ua.indexOf('Trident') > -1) {
        browserName = 'Internet Explorer';
        const match = ua.match(/rv:([\d.]+)/);
        if (match) browserVersion = match[1];
    }

    // Detect OS name and version
    if (ua.indexOf('Windows NT 10.0') !== -1) {
        osName = 'Windows';
        osVersion = '10';
    } else if (ua.indexOf('Windows NT 6.3') !== -1) {
        osName = 'Windows';
        osVersion = '8.1';
    } else if (ua.indexOf('Windows NT 6.2') !== -1) {
        osName = 'Windows';
        osVersion = '8';
    } else if (ua.indexOf('Windows NT 6.1') !== -1) {
        osName = 'Windows';
        osVersion = '7';
    } else if (ua.indexOf('Windows NT 6.0') !== -1) {
        osName = 'Windows';
        osVersion = 'Vista';
    } else if (ua.indexOf('Windows NT 5.1') !== -1) {
        osName = 'Windows';
        osVersion = 'XP';
    } else if (ua.indexOf('Mac OS X') !== -1) {
        osName = 'Mac OS';
        const match = ua.match(/Mac OS X ([\d_]+)/);
        if (match) osVersion = match[1].replace(/_/g, '.');
    } else if (ua.indexOf('Android') !== -1) {
        osName = 'Android';
        const match = ua.match(/Android\s([\d.]+)/);
        if (match) osVersion = match[1];
    } else if (ua.indexOf('like Mac OS X') !== -1) {
        osName = 'iOS';
        const match = ua.match(/OS ([\d_]+)/);
        if (match) osVersion = match[1].replace(/_/g, '.');
    }

    return { browserName, browserVersion, osName, osVersion };
}

const browserInfo = getBrowserInfo();
</script>

<template>
    <section class="tab-pane active" id="tab-content-contextual-information">
        <h2 class="section-title mb-3">Contextual Information</h2>
        <div class="info-card space-y-3">
            <div>
                <div class="info-card-label">Base URL (import.meta.url):</div>
                <div class="info-card-value">{{ baseUrl }}</div>
            </div>
            <hr class="border-[var(--border-neutral)]" />
            <div>
                <div class="info-card-label">User Agent:</div>
                <div class="info-card-value">{{ userAgent }}</div>
            </div>
            <hr class="border-[var(--border-neutral)]" />
            <div>
                <div class="info-card-label">Browser Name:</div>
                <div class="info-card-value">{{ browserInfo.browserName }}</div>
            </div>
            <hr class="border-[var(--border-neutral)]" />
            <div>
                <div class="info-card-label">Browser Version:</div>
                <div class="info-card-value">{{ browserInfo.browserVersion }}</div>
            </div>
            <hr class="border-[var(--border-neutral)]" />
            <div>
                <div class="info-card-label">OS Name:</div>
                <div class="info-card-value">{{ browserInfo.osName }}</div>
            </div>
            <hr class="border-[var(--border-neutral)]" />
            <div>
                <div class="info-card-label">OS Version:</div>
                <div class="info-card-value">{{ browserInfo.osVersion }}</div>
            </div>

            <hr class="border-[var(--border-neutral)]" />
            <div>
                <div class="info-card-label">Polyfilled Features:</div>
                <div class="info-card-value">{{ polyfillsDisplay }}</div>
            </div>
            <hr class="border-[var(--border-neutral)]" />
            <div>
                <div class="info-card-label">MicroTSM Framework Version:</div>
                <div class="info-card-value">{{ mtsmVersion }}</div>
            </div>
            <hr class="border-[var(--border-neutral)]" />
            <div>
                <div class="info-card-label">DevTools Version:</div>
                <div class="info-card-value">{{ devtoolsVersion }}</div>
            </div>
            <hr class="border-[var(--border-neutral)]" />
            <div>
                <div class="info-card-label">Active Service Worker:</div>
                <pre class="info-card-value">{{ activeServiceWorker }}</pre>
            </div>
        </div>
    </section>
</template>
