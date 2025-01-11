import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CreateSeriesComponent } from '../modals/create-series/create-series.component';
import { ModalConfig } from '../modals/modal.config';
import { ChartService } from '../services/chart.service';

@Component({
    selector: 'app-series-select',
    templateUrl: './series-select.component.html',
    styleUrls: ['../styles/common-styles.css', './series-select.component.css'],
    standalone: false
})
export class SeriesSelectComponent implements OnInit {
  @ViewChild('createSeriesModal') private createSeriesModal: CreateSeriesComponent;
  private chartService: ChartService
  private subscriptions: Subscription[] = []
  private activatedRoute: ActivatedRoute
  private router: Router;
  public seriesList = []

  public modalConfig: ModalConfig = {modalTitle: 'Create new Series', dismissButtonLabel: 'dismiss', completeButtonLabel: 'close'}

  constructor(chartService: ChartService, activatedRoute: ActivatedRoute, router: Router) {
    this.chartService = chartService
    this.activatedRoute = activatedRoute
    this.router = router;
  }

  public async openModal() {
    console.log('create series modal', this.createSeriesModal);
    let newSeriesTitle = await this.createSeriesModal.open();
    // When modal closes, navigate to newly created series
    this.router.navigate([newSeriesTitle, 'chart'], { relativeTo: this.activatedRoute })
  }

  ngOnInit(): void {
    this.subscriptions.push(this.chartService.getSeries().subscribe(series => {
      console.log('series', series);
      this.seriesList = series;
    }))
  }

  public ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

}
