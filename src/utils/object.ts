/**
 * Performs a deep equality check between two values.
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @returns `true` if both values are deeply equal, `false` otherwise
 */
export function deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (a == null || b == null) return false;

    if (typeof a === 'object') {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);

        if (keysA.length !== keysB.length) return false;

        return keysA.every((key) => deepEqual(a[key], b[key]));
    }

    return false;
}
