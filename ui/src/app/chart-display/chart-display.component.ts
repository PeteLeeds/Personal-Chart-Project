import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { createJSDocAuthorTag } from 'typescript';
import { DeleteSeriesComponent } from '../modals/delete-series/delete-series.component';
import { ChartService } from '../services/chart.service'
import { Song } from '../types/song';

@Component({
  selector: 'app-chart-display',
  templateUrl: './chart-display.component.html',
  styleUrls: ['./chart-display.component.css']
})
// We probably want a ChartSelectComponent at the top level, and this below it
// And pass the name of the chart to this.
export class ChartDisplayComponent implements OnInit {
  @ViewChild('deleteSeriesModal') private deleteSeriesModal: DeleteSeriesComponent;

  private chartService: ChartService;
  private subscriptions: Subscription[] = [];
  private activatedRoute: ActivatedRoute;
  private router: Router;

  public chartData: Record<string, unknown>[]
  public seriesName: string;
  public chartName: string;

  public lastChart: string;
  public nextChart: string;

  public constructor(chartService: ChartService, activatedRoute: ActivatedRoute, router: Router) {
    this.chartService = chartService;
    this.activatedRoute = activatedRoute;
    this.router = router;
  }

  // Idea is to store the chart run in the song
  // and then format it client-side to determine the number of weeks.
  // We can store multiple runs for multiple charts in the song
  // If we need to we can lookup the chart name as there will be very few charts compared to songs

  public ngOnInit(): void {
    /*const chartInfo = {songs: this.activatedRoute.params.pipe(mergeMap(params => {
      if (params.series && params.name) {
        this.seriesName = params.series
        this.chartName = params.name
        return this.chartService.getChart(this.seriesName, this.chartName)
      }
      return of([])
    })),
    prevCharts: this.chartService.getPreviousCharts(this.seriesName, this.chartName)
    }*/

    this.subscriptions.push(
    this.activatedRoute.params.pipe(mergeMap(params => {
          if (params.series && params.name) {
            this.seriesName = params.series
            this.chartName = params.name
            return forkJoin({
              songs: this.chartService.getChartSongs(this.seriesName, this.chartName),
              prevCharts: this.chartService.getPreviousCharts(this.seriesName, this.chartName),
              nextChart: this.chartService.getNextChart(this.seriesName, this.chartName)
            })
          }
          return of({songs: [], prevCharts: [], nextChart: null})
        })).subscribe((res) => {
        this.lastChart = res.prevCharts[1]?.name
        this.nextChart = res.nextChart;
        // Set songs and song stats
        const prevCharts = res.prevCharts;
        const songs = res.songs;
        console.log('prev charts', prevCharts)
        const prevChartNames = prevCharts.map(chart => chart.name);
        console.log('prev charts', prevCharts)
        this.chartData = songs.map((song: Song) => {
          // Index '1' is correct here as '0' will be the current chart
          const currentSeries = song.charts[this.seriesName]
          console.log('b', currentSeries, prevChartNames)
          // Here's our issue - no previous chart dates. So prevChartDates needs to include names as well as dates.
          const charts = currentSeries.filter(chart => prevChartNames.includes(chart.chart));
          const lastChartRecord = currentSeries.find(chart => chart.chart === prevChartNames[1])
          charts.sort((a, b) => a.position - b.position);
          console.log('DISPLAY', song, lastChartRecord, charts);
          console.log(charts)
          console.log(charts[0])
          console.log(charts[0].position)
          return {
            ...song,
            lastWeek: lastChartRecord?.position,
            weeksOn: charts.length,
            peak: charts[0].position,
          }
        });
      },
      (err) => {
        console.log('There was an error', err)
      })
    )
  }

  public async openModal() {
    console.log('delete series modal', this.deleteSeriesModal)
    await this.deleteSeriesModal.open(this.seriesName, this.chartName)
    // When modal closes, navigate to 'series' page
    this.router.navigate(['..'], { relativeTo: this.activatedRoute })
  }

  public ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }
}
