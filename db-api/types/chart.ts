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

export interface Session {
    seriesName: string,
    chartName: string,
    date: string,
    songOrder: SessionSong[]
}

export interface SessionSong {
    _id?: ObjectId,
    artistDisplay: string,
    title: string
}