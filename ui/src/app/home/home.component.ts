import { Component, OnInit, ViewChild } from '@angular/core';
import { CreateSeriesComponent } from '../modals/create-series/create-series.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['../styles/common-styles.css', './home.component.css']
})
export class HomeComponent implements OnInit {
  @ViewChild('createSeriesModal') private createSeriesModal: CreateSeriesComponent;
  ngOnInit(): void {
  }

}
