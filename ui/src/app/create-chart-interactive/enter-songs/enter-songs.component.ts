import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ChartService } from 'src/app/services/chart.service';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { hyphenValidator } from 'src/app/shared/hyphen-validator';

@Component({
    selector: 'app-enter-songs',
    templateUrl: './enter-songs.component.html',
    styleUrls: ['../../styles/common-styles.css', './enter-songs.component.css'],
    standalone: false
})
export class EnterSongsComponent {

    public chartService: ChartService
    public useDateAsTitle = false

    public chartForm = new FormGroup({
      name: new FormControl<string>({ value: '', disabled: this.useDateAsTitle }),
      date: new FormControl<Date>(new Date()),
      includeSongs: new FormControl<Boolean>(false),
      numberOfCharts: new FormControl<Number>(1),
      cutOffNumber: new FormControl<Number>(40),
      songs: new FormControl<string>('', hyphenValidator()),
      revealOrder: new FormControl<'random' | 'inOrder'>('random')
    });

    private router: Router
    private activatedRoute: ActivatedRoute

    public seriesName: string

    public constructor(chartService: ChartService, router: Router, activatedRoute: ActivatedRoute) {
      this.chartService = chartService
      this.router = router
      this.activatedRoute = activatedRoute
    }

    ngOnInit(): void {
      this.activatedRoute.parent.params.subscribe((params => {
        if (params.series) {
          this.seriesName = params.series
        }
    }))}

    // If we're using reactive forms we are unable to use the [disabled] attribute
    // therefore we need to explicitly disable/enable the textbox
    public onCheckboxChange(): void {
      if (this.useDateAsTitle) {
        this.chartForm.controls.name.setValue("");
        this.chartForm.controls.name.disable();
      }
      else {
        this.chartForm.controls.name.enable();
      }
    }

    public onSubmit(): void {
      const chartParams = {...this.chartForm.getRawValue()}
      if (this.useDateAsTitle) {
        chartParams.date = moment(chartParams.date).toDate()
        chartParams.name = chartParams.date.toDateString();
      }
      this.chartService.initiateInteractiveChartCreation(this.seriesName, chartParams).subscribe(res => {
        this.router.navigate([res.sessionId, 'rank'], {relativeTo: this.activatedRoute})
      })
    }

}
