import { ObjectId } from "mongodb";
import { Song } from "./song";

export interface ChartParams extends Chart {
    songs: Song[]
}

export interface Chart {
    name: string;
    date: Date;
}

export interface InteractiveChartParams extends Chart {
    includeSongs: Boolean;
    numberOfCharts: Number;
    songs: string;
    revealOrder: 'random' | 'inOrder'
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
    _id?: ObjectId,
    artistDisplay: string,
    title: string
}