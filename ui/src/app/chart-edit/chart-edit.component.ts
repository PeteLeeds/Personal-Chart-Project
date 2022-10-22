import { Component } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { ChartService } from "../services/chart.service";

@Component({
    selector: 'app-chart-edit',
    templateUrl: './chart-edit.component.html',
    styleUrls: ['./chart-edit.component.css']
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
        name: new FormControl({ value: '', disabled: this.useDateAsTitle }),
        date: new FormControl(''),
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
        if (this.useDateAsTitle) {
          this.chartForm.value.name = (this.chartForm.value.date as Date).toDateString();
        }
    
        this.chartService.updateChart(this.seriesName, this.originalChartName, this.chartForm.value).subscribe(() => { 
            console.log('Chart Updated');
            this.router.navigate(['../..', this.chartForm.value.name], { relativeTo: this.activatedRoute })
        })
    }
}