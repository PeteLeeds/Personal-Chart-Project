import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators'
import { DeleteSeriesComponent } from '../modals/delete-series/delete-series.component';
import { ModalTemplateComponent } from '../modals/modal-template/modal-template.component';
import { ModalConfig } from '../modals/modal.config';
import { ChartService } from '../services/chart.service';
import { Series } from '../types/series';

@Component({
  selector: 'app-chart-select',
  templateUrl: './chart-select.component.html',
  styleUrls: ['./chart-select.component.css']
})
export class ChartSelectComponent implements OnInit {
  @ViewChild('deleteSeriesModal') private deleteSeriesModal: DeleteSeriesComponent;
  private chartService: ChartService
  private activatedRoute: ActivatedRoute
  private subscriptions: Subscription[] = []
  private router: Router;
  public chartList = []
  public seriesName: string

  public modalConfig: ModalConfig = { modalTitle: 'Create new Series', dismissButtonLabel: 'dismiss', closeButtonLabel: 'close' }

  constructor(chartService: ChartService, activatedRoute: ActivatedRoute, router: Router) {
    this.chartService = chartService
    this.activatedRoute = activatedRoute
    this.router = router;
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.activatedRoute.params.pipe(mergeMap(params => {
        if (params.series) {
          this.seriesName = params.series
          return this.chartService.getSeriesByName(params.series)
        }
        return of([])
      })).subscribe((series: Series) => {
        this.chartList = series.charts.sort((a, b) => a.date > b.date ? 1 : -1)
      }))
  }

  public async openModal() {
    console.log('delete series modal', this.deleteSeriesModal)
    await this.deleteSeriesModal.open(this.seriesName)
    // When modal closes, navigate to 'series' page
    this.router.navigate(['../..'], { relativeTo: this.activatedRoute })
  }


  public ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

}
