import { Song } from "../../types/song";

export function sortSongs(songA: Song, songB: Song, selectedSeries: string): number {
    // Sort by date, then by highest entry position
    if (!songA.charts || !songB.charts) {
        throw new Error(`Trying to sort songs with no charts!`);
    }
    const song1EntryDate = getEarliestDate(songA, selectedSeries)
    const song2EntryDate = getEarliestDate(songB, selectedSeries)
    if (song1EntryDate.toDateString() === song2EntryDate.toDateString()) {
      return (songA.charts[selectedSeries][0].position - songB.charts[selectedSeries][0].position)
    } else {
      return (song1EntryDate > song2EntryDate ? 1 : -1)
    }
}

function getEarliestDate(song: Song, selectedSeries: string) {
    if (!song.charts) {
        throw new Error(`Song ${song.title} has no charts!`);
    }
    const chartsSortedByDate = song.charts[selectedSeries].sort((a, b) => new Date(a.date) > new Date(b.date) ? 1 : -1)
    return new Date(chartsSortedByDate[0].date)
}