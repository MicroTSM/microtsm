export default {
    randomUUID(length = 32) {
        return Array.from({ length }, () => Math.random().toString(36)[2]).join('');
    },
};
