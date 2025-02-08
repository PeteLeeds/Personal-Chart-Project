import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
    selector: 'create-chart',
    templateUrl: './create-chart.component.html',
    styleUrls: ['../styles/common-styles.css', './create-chart.component.css'],
    imports: [RouterLink, RouterOutlet]
})
export class CreateChartComponent {
  title = 'create-chart';
}
