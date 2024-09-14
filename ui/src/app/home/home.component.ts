import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CreateSeriesComponent } from '../modals/create-series/create-series.component';
import { ChartService } from '../services/chart.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['../styles/common-styles.css', './home.component.css']
})
export class HomeComponent implements OnInit {
  @ViewChild('createSeriesModal') private createSeriesModal: CreateSeriesComponent;
  private chartService: ChartService
  private subscriptions: Subscription[] = []
  public recentCharts = []

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
