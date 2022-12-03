import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ChartService } from '../services/chart.service';
import { SongService } from '../services/song.service';
@Component({
  selector: 'totals',
  templateUrl: './totals.component.html',
  styleUrls: ['./totals.component.css']
})
export class TotalsComponent {

  public seriesList = []
  public leaderboard = []

  private songService: SongService
  private chartService: ChartService

  public totalsForm = new FormGroup({
    series: new FormControl(''),
    from: new FormControl(''),
    to: new FormControl(''),
    includeFullChartRun: new FormControl(true),
    numberOfResults: new FormControl(100),
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
    this.songService.getLeaderboard(this.totalsForm.value).subscribe(res => this.leaderboard = res)
    console.log(this.totalsForm)
  }
}
