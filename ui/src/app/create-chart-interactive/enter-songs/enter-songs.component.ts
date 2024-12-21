import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-enter-songs',
  templateUrl: './enter-songs.component.html',
  styleUrls: ['../../styles/common-styles.css', './enter-songs.component.css']
})
export class EnterSongsComponent {

    public chartForm = new FormGroup({
      includeSongs: new FormControl<Boolean>(false),
      numberOfWeeks: new FormControl<Number>(1),
      songs: new FormControl<string>('', this.hyphenValidator()),
    });

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
      console.log('submitting!')
    }

}
