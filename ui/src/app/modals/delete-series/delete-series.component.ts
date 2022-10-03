import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartService } from 'src/app/services/chart.service';
import { ModalTemplateComponent } from '../modal-template/modal-template.component';
import { ModalConfig } from '../modal.config';

@Component({
  selector: 'delete-series-modal',
  templateUrl: './delete-series.component.html',
  styleUrls: ['./delete-series.component.css']
})
export class DeleteSeriesComponent implements OnInit {
  @ViewChild('modal') private baseModal: ModalTemplateComponent;

  public seriesName = '';
  private chartService: ChartService;

  constructor(chartService: ChartService) {
    this.chartService = chartService
  }

  public open(seriesName: string): Promise<unknown> {
    this.seriesName = seriesName;
    return this.baseModal.open();
  }

  public modalConfig: ModalConfig = {
    modalTitle: 'Delete Series',
    dismissButtonLabel: 'Cancel',
    // An 'x' in the corner should eventually be sufficient
    closeButtonLabel: 'Delete',
    onClose: () => new Promise<void>((resolve) => {
      console.log('delete');
      this.chartService.deleteSeries(this.seriesName).subscribe(() => {
        resolve();
      })
    })
  }

  ngOnInit(): void {
  }

}
