import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-create-chart-interactive',
  templateUrl: './create-chart-interactive.component.html',
  styleUrls: ['./create-chart-interactive.component.css']
})
export class CreateInteractiveChartComponent {

  private activatedRoute: ActivatedRoute

  public seriesName: string

  constructor(activatedRoute: ActivatedRoute) {
    this.activatedRoute = activatedRoute
  }

  ngOnInit(): void {
    this.activatedRoute.parent.params.subscribe((params => {
      if (params.series) {
        this.seriesName = params.series
      }
    }))
  }
}
