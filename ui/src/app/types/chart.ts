import { FormattedSong } from "./song";

export interface ChartParams extends Chart {
    songs: FormattedSong[]
}

export interface Chart {
    name: string;
    date: Date;
}