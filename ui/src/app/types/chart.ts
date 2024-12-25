import { AbstractSongInfo, FormattedSong } from "./song";

export interface ChartParams extends Chart {
    songs: FormattedSong[]
}

export interface Chart {
    name: string;
    date: Date;
}

export interface FullChart {
    lastChart: string,
    nextChart: string,
    songs: AbstractSongInfo[]
}

export interface Session {
    seriesName: string,
    chartName: string,
    date: string,
    songOrder: SessionSong[]
}

export interface SessionSong {
    _id?: Object,
    artistDisplay: string,
    title: string
}