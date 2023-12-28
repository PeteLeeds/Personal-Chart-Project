export function escapeRegex(regex: string) {
    return regex.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}