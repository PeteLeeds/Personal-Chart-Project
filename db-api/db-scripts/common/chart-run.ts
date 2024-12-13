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
