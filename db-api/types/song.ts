import { ObjectId } from "mongodb";
import { Artist } from "./artist";

export interface SongInChart {
    chart: string,
    position: number,
    date: string
    sessionId?: string
}

export interface Song {
    _id: ObjectId;
    title: string;
    artistIds: string[];
    artistDisplay: string;
    position?: number;
    artists?: string[] | Artist[]
    charts?: Record<string, SongInChart[]>
    chartRuns?: SongInChart[][]
    debut?: string
    peak?: number
    weeksOn?: number
    lastWeek?: number
    series?: string[]
}