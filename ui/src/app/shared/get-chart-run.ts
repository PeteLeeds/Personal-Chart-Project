import { ChartPosition } from "../types/song";

function getBbCodeChartRun(charts: ChartPosition[], peak: number, reEntry = false): string {
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

export function getFullChartRun(chartRuns: ChartPosition[][]) {
    let peak = 101;
    for (const chartRun of chartRuns) {
        for (const chart of chartRun) {
            if (chart.position < peak) {
                peak = chart.position
            }
            if (peak == 1) {
                break;
            }
        }
    }
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