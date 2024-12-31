import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartService } from 'src/app/services/chart.service';
import { ModalTemplateComponent } from '../modal-template/modal-template.component';
import { ModalConfig } from '../modal.config';

@Component({
  selector: 'delete-item-modal',
  templateUrl: './delete-item.component.html',
  styleUrls: ['./delete-item.component.css']
})
export class DeleteItemComponent implements OnInit {
  @ViewChild('modal') private baseModal: ModalTemplateComponent;

  public seriesName = '';
  public chartName = '';
  public type = '';
  private chartService: ChartService;

  constructor(chartService: ChartService) {
    this.chartService = chartService
  }

  public open(seriesName: string, chartName?: string): Promise<unknown> {
    this.seriesName = seriesName;
    this.chartName = chartName;
    this.type = chartName ? 'chart' : 'series'
    this.modalConfig.modalTitle = `Delete ${this.type}`;
    return this.baseModal.open();
  }

  public modalConfig: ModalConfig = {
    modalTitle: `Delete ${this.type}`,
    dismissButtonLabel: 'Cancel',
    // An 'x' in the corner should eventually be sufficient
    completeButtonLabel: 'Delete',
    onClose: () => new Promise<void>((resolve) => {
      console.log(`Delete ${this.type}`);
      if (this.type === 'series') {
        this.chartService.deleteSeries(this.seriesName).subscribe(() => {
          resolve();
        })
      } else {
        this.chartService.deleteChart(this.seriesName, this.chartName).subscribe(() => {
          resolve();
        })
      }
    })
  }

  ngOnInit(): void {
  }

}
