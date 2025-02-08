import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartService } from 'src/app/services/chart.service';
import { ModalTemplateComponent } from '../modal-template/modal-template.component';
import { ModalConfig } from '../modal.config';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'create-series-modal',
    templateUrl: './create-series.component.html',
    styleUrls: ['./create-series.component.css'],
    imports: [ModalTemplateComponent, FormsModule]
})
export class CreateSeriesComponent implements OnInit {
  @ViewChild('modal') private baseModal: ModalTemplateComponent;

  public seriesName = '';
  private chartService: ChartService;

  constructor(chartService: ChartService) {
    this.chartService = chartService
  }

  public open(): Promise<unknown> {
    return this.baseModal.open();
  }

  public modalConfig: ModalConfig = {
    modalTitle: 'Create Series',
    dismissButtonLabel: 'Close',
    completeButtonLabel: 'Create',
    onClose: () => new Promise<string>((resolve) => {
      console.log('create', this.seriesName);
      this.chartService.createSeries(this.seriesName).subscribe(() => {
        resolve(this.seriesName);
      })
    })
  }

  ngOnInit(): void {
  }

}
