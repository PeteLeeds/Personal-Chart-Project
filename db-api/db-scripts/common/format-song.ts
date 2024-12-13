import { Song } from "../../types/song";

const DROPOUT = -1

export function formatSong(song: Song, seriesName: string): void {
    if (song.charts && song.charts[seriesName]) {
        song.series = Object.keys(song.charts)
        song.charts[seriesName] = song.charts[seriesName].filter(chart => chart.position != DROPOUT)
        // Sort in ascending order so that peak is at position 0
        song.charts[seriesName].sort((a, b) => a.position - b.position);
        song.peak = song.charts[seriesName][0].position
        song.weeksOn = song.charts[seriesName].length
        song.debut = song.charts[seriesName][0].chart
        // Then sort in date order
        song.charts[seriesName].sort((a, b) => a.date > b.date ? 1 : -1)    
    }
    delete song.charts
}