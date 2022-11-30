import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
@Component({
  selector: 'totals',
  templateUrl: './totals.component.html',
  styleUrls: ['./totals.component.css']
})
export class TotalsComponent {
  public totalsForm = new FormGroup({
    from: new FormControl(''),
    to: new FormControl(''),
    includeFullChartRun: new FormControl(true),
    numberOfResults: new FormControl(100),
  });

  public onSubmit(): void {
    console.log(this.totalsForm)
  }
}
