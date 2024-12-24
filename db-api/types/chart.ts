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
    numberOfWeeks: Number;
    songs: string;
    revealOrder: 'random' | 'inOrder'
}