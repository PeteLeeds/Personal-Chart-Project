import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { DeleteItemComponent } from '../modals/delete-series/delete-item.component';
import { ChartService } from '../services/chart.service'
import { AbstractSongInfo } from '../types/song';
import { faPenSquare, faTrash, faPlus, faCopy } from '@fortawesome/free-solid-svg-icons';
import { FullChart } from '../types/chart';
import { ClipboardService } from 'ngx-clipboard';

const CHART_SIZES = [10, 20, 40, 75]

@Component({
  selector: 'app-chart-display',
  templateUrl: './chart-display.component.html',
  styleUrls: [ '../styles/common-styles.css', './chart-display.component.css']
})

export class ChartDisplayComponent implements OnInit {
  @ViewChild('deleteItemModal') private deleteItemModal: DeleteItemComponent;

  private chartService: ChartService;
  private clipboardService: ClipboardService;
  private subscriptions: Subscription[] = [];
  private activatedRoute: ActivatedRoute;
  private router: Router;

  public chartData: AbstractSongInfo[]
  public seriesName: string;
  public chartName: string;

  public lastChart: string;
  public nextChart: string;

  private songNumberToRetrieve = undefined
  public availableSizes = []

  faPlus = faPlus;
  faTrash = faTrash;
  faPenSquare = faPenSquare;
  faCopy = faCopy;

  public constructor(chartService: ChartService, 
    clipboardService: ClipboardService,
    activatedRoute: ActivatedRoute, 
    router: Router) {
    this.chartService = chartService;
    this.clipboardService = clipboardService;
    this.activatedRoute = activatedRoute;
    this.router = router;
  }

  public ngOnInit(): void {
    console.log('ROUTE URL', this.activatedRoute.url)
    this.reloadChart()
  }

  private reloadChart(): void {
    this.subscriptions.push(
      this.activatedRoute.params.pipe(mergeMap(params => {
            if (params.series && params.name) {
              this.seriesName = params.series
              this.chartName = params.name
              return this.chartService.getChart(this.seriesName, this.chartName, this.songNumberToRetrieve)
            }
            return of({songs: [], lastChart: null, nextChart: null})
          })).subscribe((chart: FullChart) => {
          this.lastChart = chart.lastChart
          this.nextChart = chart.nextChart;
          // Set songs and song stats
          this.chartData = chart.songs
          if (!this.songNumberToRetrieve) {
            const chartSize = this.chartData.length
            this.availableSizes = CHART_SIZES.filter(size => size < chartSize)
          }
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

  public copyPlaintext() {
    let chartString = ""
    for (const song of this.chartData) {
      chartString += `${song.position} [${song.lastWeek || (song.weeksOn > 1 ? 'RE' : 'NEW')}] ${song.artistDisplay} - ${song.title}\n`
    }
    this.clipboardService.copyFromContent(chartString)
    this.chartService.getChartString(this.seriesName, this.chartName).subscribe((chartString: string) => console.log(chartString))
  }

  public ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  public setChartSize(count?: number): void {
    this.songNumberToRetrieve = count
    this.reloadChart()
  }

  public resetData() {
    this.chartData = null
  }
}
