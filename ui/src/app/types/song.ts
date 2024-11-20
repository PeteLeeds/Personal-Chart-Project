import { Artist } from './artist';
import { Chart } from './chart'

export interface Song {
    _id: string;
    title: string;
    artists?: Artist[];
    artistDisplay: string;
}

export interface FullSongInfo extends Song {
    charts: Record<string, ChartPosition[]>;
    peak?: number;
}

export interface CheckedSong {
    // Should either have one or the other
    song?: FullSongInfo;
    songString?: string;
    pos?: number;
    exists?: boolean;
}

export interface NewSong extends CheckedSong {
    artists?: string[];
    artistDisplay?: string;
    title?: string;
}

export interface ExistingSong {
    id: string;
    pos?: number;
    exists: boolean;
}

export interface ChartPosition {
    chart?: string
    date?: string;
    position: number;
}

export type FormattedSong = NewSong | ExistingSong