import { Component } from '@angular/core';
import { Validators, FormControl, FormGroup } from '@angular/forms';
import { ChartService } from '../services/chart.service';
import { SongService } from '../services/song.service';
import { ExportToCsv } from 'export-to-csv';
import { getFullChartRun } from '../shared/get-chart-run';

@Component({
  selector: 'totals',
  templateUrl: './totals.component.html',
  styleUrls: ['../styles/common-styles.css', './totals.component.css']
})
export class TotalsComponent {

  public seriesList = []
  public leaderboard = []
  public seriesBeingUsed = null
  public calculating = false

  private songService: SongService
  private chartService: ChartService

  public totalsForm = new FormGroup({
    series: new FormControl<String>(''),
    from: new FormControl<Date>(new Date(), Validators.required),
    to: new FormControl<Date>(new Date(), Validators.required),
    includeFullChartRun: new FormControl<Boolean>(true),
    numberOfResults: new FormControl<Number>(100),
    estimateFuturePoints: new FormControl<Boolean>(true)
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
    this.calculating = true
    this.seriesBeingUsed = this.totalsForm.controls['series'].value
    const stringForm = {}
    for (const [key, value] of Object.entries(this.totalsForm.value)) {
      if (value) {
        stringForm[key] = value.toString()
      }
    }
    this.songService.getLeaderboard(stringForm).subscribe(res => {
      this.leaderboard = res
      this.calculating = false
    })
  }

  public export(): void {

    const songData = this.leaderboard.map((song, index) => {
      return {
        pos: index + 1,
        artist: song.artistDisplay,
        title: song.title,
        chartRun: getFullChartRun(song.chartRuns),
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
