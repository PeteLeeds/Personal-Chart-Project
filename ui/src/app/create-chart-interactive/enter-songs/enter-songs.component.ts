import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { ChartService } from 'src/app/services/chart.service';

@Component({
  selector: 'app-enter-songs',
  templateUrl: './enter-songs.component.html',
  styleUrls: ['../../styles/common-styles.css', './enter-songs.component.css']
})
export class EnterSongsComponent {

    public chartService: ChartService
    public useDateAsTitle = false

    public chartForm = new FormGroup({
      name: new FormControl<string>({ value: '', disabled: this.useDateAsTitle }),
      date: new FormControl<Date>(new Date()),
      includeSongs: new FormControl<Boolean>(false),
      numberOfWeeks: new FormControl<Number>(1),
      songs: new FormControl<string>('', this.hyphenValidator()),
      revealOrder: new FormControl<'random' | 'inOrder'>('random')
    });


    public constructor(chartService: ChartService) {
      this.chartService = chartService
    }

    // If we're using reactive forms we are unable to use the [disabled] attribute
    // therefore we need to explicitly disable/enable the textbox
    public onCheckboxChange() {
      if (this.useDateAsTitle) {
        this.chartForm.controls.name.setValue("");
        this.chartForm.controls.name.disable();
      }
      else {
        this.chartForm.controls.name.enable();
      }
    }

    public hyphenValidator(): ValidatorFn {
      return (control: AbstractControl): { [key: string]: any } | null => {
        const songs = control.value.split('\n');
        for (const song of (songs as string[])) {
          if (!song.includes('-')) {
            return { 'hyphenValidator': control.value }
          }
        }
        return null
      }
    }

    public onSubmit() {
      this.chartService.initiateInteractiveChartCreation(this.chartForm.value).subscribe(res => {
        console.log(res)
      })
    }

}
