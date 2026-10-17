import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { DeleteItemComponent } from '../modals/delete-series/delete-item.component';
import { ChartService } from '../services/chart.service'
import { AbstractSongInfo } from '../types/song';
import { faPenSquare, faTrash, faPlus, faCopy } from '@fortawesome/free-solid-svg-icons';
import { FullChart } from '../types/chart';
import { ClipboardService } from 'ngx-clipboard';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { MatProgressSpinner } from '@angular/material/progress-spinner';

const CHART_SIZES = [10, 20, 40, 75]

@Component({
    selector: 'app-chart-display',
    templateUrl: './chart-display.component.html',
    styleUrls: ['../styles/common-styles.css', './chart-display.component.css'],
    imports: [FaIconComponent, RouterLink, DeleteItemComponent, MatProgressSpinner]
})

export class ChartDisplayComponent implements OnInit {
  @ViewChild('deleteItemModal') private deleteItemModal: DeleteItemComponent | undefined;

  private chartService: ChartService;
  private clipboardService: ClipboardService;
  private subscriptions: Subscription[] = [];
  private activatedRoute: ActivatedRoute;
  private router: Router;

  public chartData: AbstractSongInfo[] | undefined
  public seriesName: string | undefined;
  public chartName: string | undefined;

  public lastChart: string | undefined;
  public nextChart: string | undefined;

  private songNumberToRetrieve: number | undefined = undefined
  public availableSizes = [] as number[]

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
              return this.chartService.getChart(params.series, params.name, this.songNumberToRetrieve)
            }
            return of({songs: [] as AbstractSongInfo[], lastChart: undefined, nextChart: undefined})
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
    if (!this.deleteItemModal) {
      throw new Error('deleteItemModal is undefined')
    }
    if (!this.seriesName) {
      throw new Error('seriesName is undefined')
    }
    await this.deleteItemModal.open(this.seriesName, this.chartName)
    // When modal closes, navigate to 'series' page
    this.router.navigate(['..'], { relativeTo: this.activatedRoute })
  }

  public copyPlaintext() {
    let chartString = ""
    if (!this.chartData) {
      throw new Error('chartData is undefined')
    }
    for (const song of this.chartData) {
      chartString += `${song.position} [${song.lastWeek || (song.weeksOn > 1 ? 'RE' : 'NEW')}] ${song.artistDisplay} - ${song.title}\n`
    }
    this.clipboardService.copyFromContent(chartString)
  }

  public copyChartSongs() {
    let chartString = ""
    if (!this.chartData) {
      throw new Error('chartData is undefined')
    }
    for (const song of this.chartData) {
      chartString += `${song.artistDisplay} - ${song.title}\n`
    }
    this.clipboardService.copyFromContent(chartString)
  }


  public copyBBCode() {
    if (!this.seriesName) {
      throw new Error('seriesName is undefined')
    }
    if (!this.chartName) {
      throw new Error('chartName is undefined')
    }
    this.chartService.getChartString(this.seriesName, this.chartName).subscribe((chartString: string) => 
      this.clipboardService.copyFromContent(chartString)
    )
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
    this.chartData = undefined
  }
}
