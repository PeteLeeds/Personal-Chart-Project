import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChartService } from '../services/chart.service';

import { RouterLink } from '@angular/router';
import { Chart } from '../types/chart';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['../styles/common-styles.css', './home.component.css'],
    imports: [RouterLink]
})
export class HomeComponent implements OnInit {
  private chartService: ChartService
  private subscriptions: Subscription[] = []
  public recentCharts: Chart[] = []

  constructor(chartService: ChartService) {
    this.chartService = chartService
  }

  ngOnInit(): void {
    this.subscriptions.push(this.chartService.getRecentCharts().subscribe(charts => {
      console.log(charts)
      this.recentCharts = charts;
    }))
  }

}
