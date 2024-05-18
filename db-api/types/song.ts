interface SongInChart {
    chart: string,
    position: number
}

export interface Song {
    title: string;
    artistIds: string[];
    artistDisplay: string;
    charts: Record<string, SongInChart[]>
}