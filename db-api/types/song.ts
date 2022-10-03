export interface Song {
    title: string;
    artistIds: string[];
    artistDisplay: string;
    charts: Record<string, Record<string, number>[]>
}