import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NewSongsComponent } from '../modals/new-songs/new-songs.component';
import { ChartService } from '../services/chart.service';
import { SongService } from '../services/song.service';
import { CheckedSong, FormattedSong, Song } from '../types/song';

@Component({
  selector: 'app-create-chart',
  templateUrl: './create-chart.component.html',
  styleUrls: ['./create-chart.component.css']
})
export class CreateChartComponent implements OnInit {
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
    name: new FormControl<string>({ value: '', disabled: this.useDateAsTitle }),
    date: new FormControl<Date>(new Date()),
    songs: new FormControl<string>('', this.hyphenValidator()),
  });

  constructor(chartService: ChartService, songService: SongService, activatedRoute: ActivatedRoute, router: Router) { 
    this.chartService = chartService;
    this.songService = songService
    this.activatedRoute = activatedRoute;
    this.router = router;
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params => {
      if (params.series) {
        this.seriesName = params.series
      }
    }))
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
    this.checkingSongs = true
    const songs = this.chartForm.controls.songs.value.split('\n');
    const chartParams = {...this.chartForm.getRawValue()}
    if (this.useDateAsTitle) {
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
        return {pos: song.pos, id: song.song._id, exists: song.exists};
      }
      else {
        const indexOfFirstHyphen = song.songString.indexOf(' - ')
        let artist = song.songString.slice(0, indexOfFirstHyphen);
        let title = song.songString.slice(indexOfFirstHyphen + 3);
        artist = artist.trim(); title = title.trim();
        // Initially set artist as both and let the user change it if there is more than one artist
        // If we're clever we can add better artist detection here
        return {pos: song.pos, artistDisplay: artist, artists: this.preEmptArtistName(title, artist), title, exists: song.exists};
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
        this.router.navigate(['..', chartParams.name], { relativeTo: this.activatedRoute })
      })
    })
  }

  private preEmptArtistName(title: string, artistDisplay: string): string[] {
    const conjunctions = ['ft.', 'feat.', 'with']
    const artistList = []
    let artistsAdded = false
    for (const conjunction of conjunctions) {
      if (artistDisplay.includes(conjunction)) {
        const startOfConjunction = artistDisplay.includes("(" + conjunction) 
                                ? artistDisplay.indexOf("(" + conjunction)
                                : artistDisplay.indexOf(conjunction)
        const startOfArtist = startOfConjunction + conjunction.length 
                                + (artistDisplay.includes("(" + conjunction) ? 1 : 0)
        const endPos = artistDisplay.includes(")", startOfArtist) ? title.indexOf(")", startOfArtist) : undefined
        const featuredArtist = artistDisplay.slice(startOfArtist, endPos)
        artistList.push(artistDisplay.slice(0, startOfConjunction - 1).trim())
        artistList.push(featuredArtist.trim())
        artistsAdded = true
        // More than one conjunction would confuse this simple system too much
        break
      }
    }
    if (!artistsAdded) {
      artistList.push(artistDisplay)
    }
    for (const conjunction of conjunctions) {
      if (title.includes("(" + conjunction)) {
        // + 1 for the bracket
        const startPos = title.indexOf("(" + conjunction) + conjunction.length + 1
        const endPos = title.includes(")", startPos) ? title.indexOf(")", startPos) : title.length - 1
        const featuredArtist = title.slice(startPos, endPos)
        artistList.push(featuredArtist.trim())
        // More than one conjunction would confuse this simple system too much
        break
      }
    }
    return artistList
  }
}
