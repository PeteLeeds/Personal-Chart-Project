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

export interface PutSessionParams {
    songOrder: SessionSong[]
    placedSongs: SessionSong[]
}

export interface Session extends PutSessionParams {
    seriesName: string,
    chartName: string,
    date: string,
}

export interface SessionSong {
    _id?: Object,
    artistDisplay: string,
    title: string
}