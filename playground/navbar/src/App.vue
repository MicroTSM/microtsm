<script setup>
import { ref } from 'vue';

const fontFamily = `"Work Sans", "Noto Sans", sans-serif`;
const searchQuery = ref('');

const navigateHome = () => {
    history.pushState(history.state, '', '/');
};
</script>

<template>
    <div
        class="relative flex size-full flex-col bg-slate-50 group/design-root overflow-x-hidden"
        :style="{ fontFamily: fontFamily }"
    >
        <div class="layout-container flex h-full grow flex-col">
            <header
                class="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf4] px-10 py-3"
            >
                <div class="flex items-center gap-4 text-[#0d141c] cursor-pointer" @click="navigateHome">
                    <div class="size-4">
                        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_6_319)">
                                <path
                                    d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z"
                                    fill="currentColor"
                                />
                            </g>
                            <defs>
                                <clipPath id="clip0_6_319">
                                    <rect width="48" height="48" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                    </div>
                    <h2 class="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em]">Acme Co</h2>
                </div>
                <div class="flex flex-1 justify-end gap-8">
                    <label class="flex flex-col min-w-40 !h-10 max-w-64">
                        <div class="flex w-full flex-1 items-stretch rounded-lg h-full">
                            <div
                                class="text-[#49709c] flex border-none bg-[#e7edf4] items-center justify-center pl-4 rounded-l-lg border-r-0"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24px"
                                    height="24px"
                                    fill="currentColor"
                                    viewBox="0 0 256 256"
                                >
                                    <path
                                        d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"
                                    />
                                </svg>
                            </div>
                            <input
                                placeholder="Search"
                                class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border-none bg-[#e7edf4] focus:border-none h-full placeholder:text-[#49709c] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                                v-model="searchQuery"
                            />
                        </div>
                    </label>
                    <button
                        class="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-[#e7edf4] text-[#0d141c] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
                    >
                        <div class="text-[#0d141c]">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20px"
                                height="20px"
                                fill="currentColor"
                                viewBox="0 0 256 256"
                            >
                                <path
                                    d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"
                                />
                            </svg>
                        </div>
                    </button>
                </div>
            </header>
        </div>
    </div>
</template>
