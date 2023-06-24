import { Artist } from "../types/artist"

function getFormattedPeak(peak: number) {
    if (peak === 1) {
      return `[color=#FF0000][b]01[/b][/color]`
    }
    if (peak <= 10) {
      return `[color=#0000FF][b]${peak === 10 ? peak : `0${peak}`}[/b][/color]`
    }
    if (peak <= 40) {
      return `[b]${peak}[/b]`
    }
    return `[color=#708090][b]${peak}[/b][/color]`
  }

function getFormattedTitle(songTitle: string, artistDisplay: string, artistName: string) {
const additionalArtistDisplay = artistDisplay !== artistName
let artistDisplaySatisfied = !additionalArtistDisplay
const collaborationStrings = ['ft.', 'with', 'feat.']
for (const string of collaborationStrings) {
        const index = songTitle.indexOf(`(${string}`);
        if (index !== -1) {
        // Assumes the closing bracket will be at the end
        songTitle = songTitle.substring(0, index) + 
                    `[i]${songTitle[index]}${additionalArtistDisplay ? artistDisplay + ' ' : ''}${songTitle.substring(index + 1)}[/i]`
        if (additionalArtistDisplay) {
            artistDisplaySatisfied = true
        }
        break;
        }
    }
    if (!artistDisplaySatisfied) {
        songTitle += ` [i](${artistDisplay})[/i]`
    }
    return songTitle;
}

export function sortSongs(songA, songB, selectedSeries): number {
    // Sort by date, then by highest entry position
    const song1EntryDate = songA.charts[selectedSeries].sort((a, b) => a.date > b.date ? 1 : -1)[0].date
    const song2EntryDate = songB.charts[selectedSeries].sort((a, b) => a.date > b.date ? 1 : -1)[0].date
    if (song1EntryDate.toDateString() === song2EntryDate.toDateString()) {
      return (songA.charts[selectedSeries][0].position - songB.charts[selectedSeries][0].position)
    } else {
      return (song1EntryDate > song2EntryDate ? 1 : -1)
    }
  }

export function getChartHistory(artistInfo: Artist, selectedSeries: string) {
    const songs = JSON.parse(JSON.stringify(artistInfo.songs))
    songs.sort((a,b) => sortSongs(a, b, selectedSeries))
    let bbCodeString = `[b]${artistInfo.name}[/b]\n[size=1]`
    for (const song of songs) {
      const chartInfo = song.charts[selectedSeries]
      song.charts[selectedSeries].sort((a, b) => a.position - b.position);
      song.charts[selectedSeries].peak = song.charts[selectedSeries][0].position
      song.charts[selectedSeries].sort((a, b) => a.date > b.date ? 1 : -1)
      let songString = new Date(chartInfo[0].date).getFullYear() + " " 
                        + getFormattedPeak(song.charts[selectedSeries].peak) + " " 
                        + getFormattedTitle(song.title, song.artistDisplay, artistInfo.name)
      songString += '\n'
      bbCodeString += songString
    }
    bbCodeString += "[/size]"
    return bbCodeString
}
