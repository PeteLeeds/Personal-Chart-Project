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

export function getChartHistory(artistInfo: Artist) {
    let bbCodeString = `[b]${artistInfo.name}[/b]\n[size=1]`
    for (const song of artistInfo.songs) {
      let songString = new Date(song.debut).getFullYear() + " " 
                        + getFormattedPeak(song.peak) + " " 
                        + getFormattedTitle(song.title, song.artistDisplay, artistInfo.name)
      songString += '\n'
      bbCodeString += songString
    }
    bbCodeString += "[/size]"
    return bbCodeString
}
