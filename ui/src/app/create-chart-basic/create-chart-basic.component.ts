import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NewSongsComponent } from '../modals/new-songs/new-songs.component';
import { ChartService } from '../services/chart.service';
import { SongService } from '../services/song.service';
import { CheckedSong, FormattedSong } from '../types/song';
import moment from 'moment';
import { preEmptArtistName } from '../shared/pre-empt-artist-name';
import { hyphenValidator } from '../shared/hyphen-validator';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-create-chart',
    templateUrl: './create-chart-basic.component.html',
    styleUrls: ['./create-chart-basic.component.css'],
    imports: [FormsModule, ReactiveFormsModule, MatDatepickerInput, MatDatepickerToggle, MatDatepicker, NgIf, NewSongsComponent]
})
export class CreateBasicChartComponent implements OnInit {
  @ViewChild('newSongsModal') private newSongsModal: NewSongsComponent;

  private chartService: ChartService;
  private songService: SongService
  private activatedRoute: ActivatedRoute;
  private router: Router;

  public useDateAsTitle = false;
  public seriesName: string;
  public checkingSongs = false;
  public numberOfSongs = 0
  public songsChecked = 0;

  public chartForm = new FormGroup({
    name: new FormControl<string>({ value: '', disabled: this.useDateAsTitle },  Validators.required),
    date: new FormControl<Date>(new Date()),
    songs: new FormControl<string>('', hyphenValidator()),
  });

  constructor(chartService: ChartService, songService: SongService, activatedRoute: ActivatedRoute, router: Router) { 
    this.chartService = chartService;
    this.songService = songService
    this.activatedRoute = activatedRoute;
    this.router = router;
  }

  ngOnInit(): void {
    this.activatedRoute.parent.params.subscribe((params => {
      if (params.series) {
        this.seriesName = params.series
      }
    }))
  }

  // If we're using reactive forms we are unable to use the [disabled] attribute
  // therefore we need to explicitly disable/enable the textbox
  public onCheckboxChange(): void {
    if (this.useDateAsTitle) {
      this.chartForm.controls.name.setValue("");
      this.chartForm.controls.name.disable();
    }
    else {
      this.chartForm.controls.name.enable();
    }
  }

  public onSubmit(): void {
    this.checkingSongs = true
    const songs = this.chartForm.controls.songs.value.split('\n');
    const chartParams = {...this.chartForm.getRawValue()}
    if (this.useDateAsTitle) {
      chartParams.date = moment(chartParams.date).toDate()
      chartParams.name = chartParams.date.toDateString();
    }

    this.songsChecked = 0
    this.numberOfSongs = songs.length
    const songObservables : Observable<CheckedSong>[] = []
    for (let i = 0; i < songs.length; i++) {
      const song = songs[i];
      songObservables.push(this.songService.checkIfSongExists(song, i)
        .pipe(map(res => {
          this.songsChecked++;
          return res
        })))
    }

    var chartSongs: FormattedSong[] = []

    forkJoin(songObservables).subscribe(async songs => {
      chartSongs = songs.map(song => {
      if (song.exists) {
        console.log('song', song)
        return {pos: song.pos, _id: song.song._id, exists: song.exists};
      }
      else {
        const indexOfFirstHyphen = song.songString.indexOf(' - ')
        let artist = song.songString.slice(0, indexOfFirstHyphen);
        let title = song.songString.slice(indexOfFirstHyphen + 3);
        artist = artist.trim(); title = title.trim();
        return {pos: song.pos, artistDisplay: artist, artists: preEmptArtistName(title, artist), title, exists: song.exists};
      }
    })
      // Ensure all are in correct position
      chartSongs.sort((a, b) => (a.pos < b.pos ? -1 : 1));
      for (const song of chartSongs) {
        delete song.pos;
      }
      const newSongsExist = chartSongs.filter(song => !song.exists).length != 0;
      this.checkingSongs = false
      const songsToSend = newSongsExist ? await this.newSongsModal.open(chartSongs) : chartSongs;
      console.log("In Create Chart: ", songsToSend);
      // This bit creates the chart
      this.chartService.createChart(this.seriesName, {...chartParams, songs: songsToSend}).subscribe(() => { 
        console.log('Chart Created');
        this.router.navigate(['../..', chartParams.name], { relativeTo: this.activatedRoute })
      })
    })
  }
}
