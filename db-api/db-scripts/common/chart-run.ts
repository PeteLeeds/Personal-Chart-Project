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
  let run = "("
  let potentialRun = ""
  let top40Reached = false
  for (let i = 0; i < chartRuns[0].length; i++) {
    const chart = chartRuns[0][i]
    if (chart.position <= 40) {
      if (potentialRun.length > 0) {
        run += `${potentialRun.length}[/color]`
        potentialRun = ""
      }
      run += `${chart.position}${run.length == 0 ? '' : '-'}`
      top40Reached = true
    } else if (top40Reached) {
      potentialRun += `${potentialRun.length == 0 ? '' : '[color=#708090]'}${chart.position}`
    }
  }
  run += ")"
  return run
}