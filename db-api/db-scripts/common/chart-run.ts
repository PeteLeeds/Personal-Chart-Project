import { SongInChart } from '../../types/song'

const DROPOUT = -1

/* Break up chart runs based on dropouts */
export function splitChartRun(charts: SongInChart[]): SongInChart[][] {
    charts.sort((a, b) => new Date(a.date) > new Date(b.date) ? 1 : -1)
    const chartRuns = charts.reduce((prevValue: SongInChart[][], current) => {
        if (current.position == DROPOUT) {
          if (prevValue[prevValue.length - 1].length > 0) {
            prevValue.push([])
          }
          return prevValue
        }
        prevValue[prevValue.length - 1].push(current)
        return prevValue
      }, [[]])
      if (chartRuns[chartRuns.length - 1].length === 0) {
        chartRuns.pop()
      }
    return chartRuns
}

export function getTop40ChartRun(chartRuns: SongInChart[][]): string {
  let runString = "("
  let potentialRun = ""
  let top40Reached = false
  for (let i = 0; i < chartRuns.length; i++) {
    const run = chartRuns[i]
    for (const chart of run) {
      if (chart.position <= 40) {
        if (potentialRun.length > 0) {
          runString += `${potentialRun}[/color]`
          potentialRun = ""
        }
        runString += `${chart.position}${runString.length == 0 ? '' : '-'}`
        top40Reached = true
      } else if (top40Reached) {
        potentialRun += `${potentialRun.length == 0 ? '[color=#708090]' : ''}${chart.position}${runString.length == 0 ? '' : '-'}`
      }
    } 
    if (chartRuns.length - 1 > i) {
      potentialRun += `${potentialRun.length == 0 ? '[color=#708090]' : ''}xx-`
    }
  }
  runString += ")"
  return runString
}