import { Component } from '@angular/core';
import { ChartService } from '../services/chart.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { FullChart } from '../types/chart';

@Component({
  selector: 'app-create-chart-finalise',
  templateUrl: './create-chart-finalise.component.html',
  styleUrls: ['../styles/common-styles.css', './create-chart-finalise.component.css']
})
export class CreateChartFinaliseComponent {
  private chartService: ChartService
  private activatedRoute: ActivatedRoute
  private sessionId: string
  public chartPreview: FullChart;

  constructor(chartService: ChartService, activatedRoute: ActivatedRoute) {
    this.chartService = chartService
    this.activatedRoute = activatedRoute
  }

  public ngOnInit(): void {
    this.activatedRoute.params.pipe(mergeMap(params => {
      if (params.session) {
        this.sessionId = params.session
        return this.chartService.getChartPreview(this.sessionId)
      }
      return of({} as FullChart)
    })).subscribe(res => {
      this.chartPreview = res
    })
  }
}
