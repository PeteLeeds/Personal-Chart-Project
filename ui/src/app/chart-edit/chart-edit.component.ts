import { Component } from "@angular/core";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { ChartService } from "../services/chart.service";
import moment from "moment";
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from "@angular/material/datepicker";

@Component({
    selector: 'app-chart-edit',
    templateUrl: './chart-edit.component.html',
    styleUrls: ['./chart-edit.component.css'],
    imports: [FormsModule, ReactiveFormsModule, MatDatepickerInput, MatDatepickerToggle, MatDatepicker]
})

export class ChartEditComponent {
    private subscriptions: Subscription[] = []
    private activatedRoute: ActivatedRoute;
    private router: Router;
    private chartService: ChartService;
    public useDateAsTitle = false

    public seriesName: string;
    public originalChartName: string;
    public chartDate: string;

    public chartForm = new FormGroup({
        name: new FormControl<string>({ value: '', disabled: this.useDateAsTitle }),
        date: new FormControl<Date>(new Date()),
    });

    public constructor(activatedRoute: ActivatedRoute, chartService: ChartService, router: Router) {
        this.activatedRoute = activatedRoute;
        this.chartService = chartService;
        this.router = router;
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.activatedRoute.params.pipe(mergeMap(params => {
                if (params.series && params.name) {
                    this.seriesName = params.series
                    this.originalChartName = params.name
                    this.chartForm.controls.name.setValue(params.name)
                    return this.chartService.getChartDate(this.seriesName, this.originalChartName)
                }
            })).subscribe(res => {
                this.chartForm.controls.date.setValue(new Date(res))
                this.chartDate = res;
            })
        )
    }

    public onCheckboxChange() {
        if (this.useDateAsTitle) {
          this.chartForm.controls.name.setValue("");
          this.chartForm.controls.name.disable();
        }
        else {
          this.chartForm.controls.name.enable();
        }
      }

      public onSubmit() {
        const chartParams = {...this.chartForm.getRawValue()}
        if (this.useDateAsTitle) {
            chartParams.date = moment(chartParams.date).toDate()
            chartParams.name = chartParams.date.toDateString();
        }
    
        this.chartService.updateChart(this.seriesName, this.originalChartName, chartParams).subscribe(() => { 
            console.log('Chart Updated');
            this.router.navigate(['../..', chartParams.name], { relativeTo: this.activatedRoute })
        })
    }
}