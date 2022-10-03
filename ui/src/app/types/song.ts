import { Chart } from './chart'

export interface Song {
    _id: string;
    title: string;
    artists?: string[];
    artistDisplay: string;
    charts: Record<string, Chart>[];
    peak?: number;
}

export interface CheckedSong {
    // Should either have one or the other
    song?: Song;
    songString?: string;
    pos?: number;
    exists: boolean;
}

export interface NewSong extends CheckedSong {
    artists?: string[];
    title?: string;
}

export interface ExistingSong {
    id: string;
    pos?: number;
    exists: boolean;
}

export type FormattedSong = NewSong | ExistingSong