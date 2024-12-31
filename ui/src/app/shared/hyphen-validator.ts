import { AbstractControl, ValidatorFn } from "@angular/forms";

export function hyphenValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
    if (control.value.length == 0) {
        return null
    }
    const songs = control.value.split('\n');
    for (const song of (songs as string[])) {
        if (!song.includes('-')) {
        return { 'hyphenValidator': control.value }
        }
    }
    return null
    }
}