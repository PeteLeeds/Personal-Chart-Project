import { AbstractSongInfo, FormattedSong } from "./song";

export interface ChartParams extends Chart {
    songs: FormattedSong[]
}

export interface Chart {
    name: string;
    date: Date;
}

export interface FullChart {
    lastChart: string | undefined,
    nextChart: string | undefined,
    songs: AbstractSongInfo[]
}

export interface PutSessionParams {
    songOrder: SessionSong[]
    placedSongs: (SessionSong | null)[]
}

export interface Session extends PutSessionParams {
    seriesName: string,
    chartName: string,
    date: string,
}

export interface SessionSong {
    _id?: object,
    artistDisplay: string,
    title: string
}