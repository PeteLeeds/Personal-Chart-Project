import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators'
import { DeleteItemComponent } from '../modals/delete-series/delete-item.component';
import { ModalConfig } from '../modals/modal.config';
import { ChartService } from '../services/chart.service';
import { Chart } from '../types/chart';

@Component({
  selector: 'app-chart-select',
  templateUrl: './chart-select.component.html',
  styleUrls: ['../styles/common-styles.css', './chart-select.component.css']
})
export class ChartSelectComponent implements OnInit {
  @ViewChild('deleteItemModal') private deleteItemModal: DeleteItemComponent;
  private chartService: ChartService
  private activatedRoute: ActivatedRoute
  private subscriptions: Subscription[] = []
  private router: Router;
  public chartList = []
  public pageNumber = 1;
  public seriesName: string
  public sortOrder = '-1'

  public modalConfig: ModalConfig = { modalTitle: 'Create new Series', dismissButtonLabel: 'dismiss', closeButtonLabel: 'close' }

  constructor(chartService: ChartService, activatedRoute: ActivatedRoute, router: Router) {
    this.chartService = chartService
    this.activatedRoute = activatedRoute
    this.router = router;
  }

  ngOnInit(): void {
    this.reloadSeries()
  }

  public incPageNumber(): void {
    this.pageNumber++;
    this.reloadSeries();
  }

  public decPageNumber(): void {
    this.pageNumber--;
    this.reloadSeries();
  }

  private reloadSeries(): void {
    this.activatedRoute.params.pipe(mergeMap(params => {
      if (params.series) {
        this.seriesName = params.series
        return this.chartService.getChartsInSeries(params.series, this.pageNumber - 1, this.sortOrder)
      }
      return of([])
    })).subscribe((charts: Chart[]) => {
      this.chartList = charts
    })
  }

  public async openModal() {
    console.log('delete series modal', this.deleteItemModal)
    await this.deleteItemModal.open(this.seriesName)
    // When modal closes, navigate to 'series' page
    this.router.navigate(['../..'], { relativeTo: this.activatedRoute })
  }

  public setSortOrder(sortOrder: string) {
    this.sortOrder = sortOrder
    this.pageNumber = 1
    this.reloadSeries()
  }


  public ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

}
