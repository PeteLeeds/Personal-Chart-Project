import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { DeleteItemComponent } from '../modals/delete-series/delete-item.component';
import { ChartService } from '../services/chart.service'
import { Song } from '../types/song';
import { faPenSquare, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-chart-display',
  templateUrl: './chart-display.component.html',
  styleUrls: ['./chart-display.component.css']
})

export class ChartDisplayComponent implements OnInit {
  @ViewChild('deleteItemModal') private deleteItemModal: DeleteItemComponent;

  private chartService: ChartService;
  private subscriptions: Subscription[] = [];
  private activatedRoute: ActivatedRoute;
  private router: Router;

  public chartData: Record<string, unknown>[]
  public seriesName: string;
  public chartName: string;

  public lastChart: string;
  public nextChart: string;

  faPlus = faPlus;
  faTrash = faTrash;
  faPenSquare = faPenSquare;

  public constructor(chartService: ChartService, activatedRoute: ActivatedRoute, router: Router) {
    this.chartService = chartService;
    this.activatedRoute = activatedRoute;
    this.router = router;
  }

  public ngOnInit(): void {
    console.log('ROUTE URL', this.activatedRoute.url)

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
        const prevChartNames = prevCharts.map(chart => chart.name);
        this.chartData = songs.map((song: Song) => {
          console.log('song', song)
          // Index '1' is correct here as '0' will be the current chart
          const currentSeries = song.charts[this.seriesName]
          const charts = currentSeries.filter(chart => prevChartNames.includes(chart.chart));
          const lastChartRecord = currentSeries.find(chart => chart.chart === prevChartNames[1])
          charts.sort((a, b) => a.position - b.position);
          return {
            ...song,
            lastWeek: lastChartRecord?.position,
            weeksOn: charts.length,
            peak: charts[0].position,
          }
        });
        console.log('chart data', this.chartData)
      },
      (err) => {
        console.log('There was an error', err)
      })
    )
  }

  public async openModal() {
    console.log('delete item modal', this.deleteItemModal)
    await this.deleteItemModal.open(this.seriesName, this.chartName)
    // When modal closes, navigate to 'series' page
    this.router.navigate(['..'], { relativeTo: this.activatedRoute })
  }

  public ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }
}
