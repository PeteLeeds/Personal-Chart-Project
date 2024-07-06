interface SongInChart {
    chart: string,
    position: number,
    date: Date
}

export interface Song {
    title: string;
    artistIds: string[];
    artistDisplay: string;
    charts?: Record<string, SongInChart[]>
    debut?: string
    peak?: number
    weeksOn?: number
}