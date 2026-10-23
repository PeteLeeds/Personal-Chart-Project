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

function getMarkdownFormattedPeak(peak: number) {
    if (peak <= 10) {
      return `**${peak === 10 ? peak : `0${peak}`}**`
    }
    if (peak <= 40) {
      return peak
    }
    return `*${peak}*`
  }

function getFormattedTitle(songTitle: string, artistDisplay: string, artistName: string, format: 'bbcode' | 'markdown') {
const additionalArtistDisplay = artistDisplay !== artistName
let artistDisplaySatisfied = !additionalArtistDisplay
const collaborationStrings = ['ft.', 'with', 'feat.']
for (const string of collaborationStrings) {
        const index = songTitle.indexOf(`(${string}`);
        if (index !== -1) {
        // Assumes the closing bracket will be at the end
        const formattedString = `${songTitle[index]}${additionalArtistDisplay ? artistDisplay + ' ' : ''}${songTitle.substring(index + 1)}`
        songTitle = songTitle.substring(0, index) + (format === 'bbcode' ? `[i]${formattedString}[/i]` : `*${formattedString}*`)
        if (additionalArtistDisplay) {
            artistDisplaySatisfied = true
        }
        break;
        }
    }
    if (!artistDisplaySatisfied) {
        songTitle += (format === 'bbcode' ? ` [i](${artistDisplay})[/i]` : ` *(${artistDisplay})*`)
    }
    return songTitle;
}

export function getChartHistory(artistInfo: Artist) {
    let bbCodeString = `[b]${artistInfo.name}[/b]\n[size=1]`
    for (const song of artistInfo.songs) {
      let songString = new Date(song.debut).getFullYear() + " " 
                        + getFormattedPeak(song.peak || 0) + " " 
                        + getFormattedTitle(song.title, song.artistDisplay, artistInfo.name, 'bbcode')
      songString += '\n'
      bbCodeString += songString
    }
    bbCodeString += "[/size]"
    return bbCodeString
}

export function getMarkdownChartHistory(artistInfo: Artist) {
    let bbCodeString = `**${artistInfo.name}**\n\n`
    for (const song of artistInfo.songs) {
      let songString = new Date(song.debut).getFullYear() + " " 
                        + getMarkdownFormattedPeak(song.peak || 0) + " " 
                        + getFormattedTitle(song.title, song.artistDisplay, artistInfo.name, 'markdown')
      songString += '\n\n'
      bbCodeString += songString
    }
    return bbCodeString
}