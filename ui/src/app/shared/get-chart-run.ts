import { SongInChart } from "../types/song";

const DAY_LENGTH = 24 * 60 * 60 * 1000

function getChartRuns(charts: SongInChart[]): SongInChart[][] {
    const runs = []
    let currentRun = []
    for (let i = 0; i < charts.length; i++) {
        if (i === 0) {
            // Doing this here to prevent an error when passed an empty array
            currentRun.push(charts[i])
            continue;
        }
        else {
            if (new Date(charts[i].date) > new Date(new Date(charts[i - 1].date).getTime() + (13 * DAY_LENGTH))) {
                runs.push(currentRun)
                currentRun = [charts[i]]
            } else {
                currentRun.push(charts[i])
            }
        }
    }
    if (currentRun.length > 0) {
        runs.push(currentRun)
    }
    return runs
}

function getBbCodeChartRun(charts: SongInChart[], peak: number, reEntry = false): string {
    const formattedDate = formatDate(new Date(charts[0].date))
    let bbCodeString = `[b]${reEntry ? 'R' : 'N'}E[/b] (${formattedDate}) `
    let currentColour = ''
    for (const chart of charts) {
        const positionColour = getPositionColour(chart.position)
        if (currentColour !== positionColour) {
            bbCodeString += `${currentColour && '[/color]'}[color=${positionColour}]`
            currentColour = positionColour
        }
        if (chart.position === peak) {
            bbCodeString += `[b]${chart.position}[/b]-`
        }
        else {
            bbCodeString += `${chart.position}-`
        }
    }
    bbCodeString += 'xx[/color]'
    return bbCodeString;
}

export function getFullChartRun(charts: SongInChart[]) {
    charts.sort((a, b) => new Date(a.date) > new Date(b.date) ? 1 : -1)
    const peak = JSON.parse(JSON.stringify(charts))
    .sort((a, b) => a.position - b.position)[0]
    .position
    const chartRuns = getChartRuns(charts)
    console.log('runs', chartRuns)
    let bbCodeChartRun = ''
    for (let i = 0; i < chartRuns.length; i++) {
        const lineOfChartRun = getBbCodeChartRun(chartRuns[i], peak, i !== 0)
        bbCodeChartRun += `${bbCodeChartRun.length !== 0 ? '\n' : ''}${lineOfChartRun}`
    }
    return bbCodeChartRun
}

function formatDate(date: Date): string {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

function getPositionColour(pos: number) {
    if (pos === 1) {
        return '#FF0000'
    } else if (pos <= 10) {
        return '#0000FF'
    } else if (pos <= 40) {
        return '#000000'
    }
    return '#708090'
}