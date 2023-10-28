import { Component } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { ChartService } from '../services/chart.service';
import { SongService } from '../services/song.service';
import { ExportToCsv } from 'export-to-csv';
import { getChartRuns, getFullChartRun } from '../shared/get-chart-run';

@Component({
  selector: 'totals',
  templateUrl: './totals.component.html',
  styleUrls: ['../styles/common-styles.css', './totals.component.css']
})
export class TotalsComponent {

  public seriesList = []
  public leaderboard = []
  public seriesBeingUsed = null

  private songService: SongService
  private chartService: ChartService

  public totalsForm = new UntypedFormGroup({
    series: new UntypedFormControl(''),
    from: new UntypedFormControl('', Validators.required),
    to: new UntypedFormControl('', Validators.required),
    includeFullChartRun: new UntypedFormControl(true),
    numberOfResults: new UntypedFormControl(100),
    estimateFuturePoints: new UntypedFormControl(true)
  });

  public constructor(songService: SongService, chartService: ChartService) {
    this.songService = songService
    this.chartService = chartService
  }

  public ngOnInit(): void {
    this.chartService.getSeries().subscribe(res => {
      this.seriesList = res
      this.totalsForm.controls['series'].setValue(res[0].name)
      console.log('series', this.seriesList)
    })
  }

  public onSubmit(): void {
    this.seriesBeingUsed = this.totalsForm.controls['series'].value
    this.songService.getLeaderboard(this.totalsForm.value).subscribe(res => this.leaderboard = res)
  }

  public export(): void {

    const songData = this.leaderboard.map((song, index) => {
      const chartRuns = getChartRuns(song.charts[this.seriesBeingUsed])
      return {
        pos: index + 1,
        artist: song.artistDisplay,
        title: song.title,
        chartRun: getFullChartRun(chartRuns),
        points: song.totalPoints
      }
    })

    const options = { 
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true, 
      showTitle: true,
      title: 'Leaderboard',
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,
    };

    const csvExporter = new ExportToCsv(options);
 
    csvExporter.generateCsv(songData);
    
  }
}
