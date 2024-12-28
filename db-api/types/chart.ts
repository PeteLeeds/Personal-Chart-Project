import { ObjectId } from "mongodb";
import { Song } from "./song";

export interface ChartParams extends Chart {
    songs: Song[]
}

export interface Chart {
    name: string;
    date: string;
}

export interface InteractiveChartParams extends Chart {
    includeSongs: Boolean;
    numberOfCharts: Number;
    cutOffNumber: number;
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
    cutOffNumber: number,
}

export interface SessionSong {
    _id?: string,
    artistDisplay: string,
    title: string
    // TODO: Once session migration is complete for both basic and interactive charts,
    // Review whether the below is still needed
    artists?: string[]
}