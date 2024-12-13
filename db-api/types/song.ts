import { Artist } from "./artist";

export interface SongInChart {
    chart: string,
    position: number,
    date: string
}

export interface Song {
    title: string;
    artistIds: string[];
    artistDisplay: string;
    artists?: Artist[]
    charts?: Record<string, SongInChart[]>
    chartRuns?: SongInChart[][]
    debut?: string
    peak?: number
    weeksOn?: number
    lastWeek?: number
    series?: string[]
}