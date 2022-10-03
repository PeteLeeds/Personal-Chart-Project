import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { ChartService } from '../services/chart.service';
import { SongService } from '../services/song.service';
import { Chart } from '../types/chart';
import { Song } from '../types/song';

interface ChartRun {
  run: string[];
  endReached: boolean;
}

@Component({
  selector: 'app-song-display',
  templateUrl: './song-display.component.html',
  styleUrls: ['./song-display.component.css']
})
export class SongDisplayComponent implements OnInit {

  private subscriptions: Subscription[] = []
  private activatedRoute: ActivatedRoute;
  private songService: SongService;

  public songInfo: Song;
  public selectedSeries = "";
  public chartSelectOptions: string[];
  public chartRunsCalculated: false;
  public chartRuns = [];
  public editMode = false;
  public artistNames = []

  public peak = 0;
  public weeksOn = 0;

  public songDetailsForm = new FormGroup({
    title: new FormControl(''),
    artistDisplay: new FormControl(''),
  });

  constructor(activatedRoute: ActivatedRoute, songService: SongService) {
    this.activatedRoute = activatedRoute;
    this.songService = songService;
  }

  ngOnInit(): void {
    this.reloadSongDetails(true)
  }

  // (I can't remember what the below comments mean)
  // If we have the start and end dates of all the charts, we can get a range
  // If there are any gaps of more than 1 month, we can check if the next chart is actually the one given

  public reloadSongDetails(initialLoad = false) {
    this.subscriptions.push(
      this.activatedRoute.params.pipe(mergeMap(params => {
        if (params.id) {
          return this.songService.getSongById(params.id, this.selectedSeries)
        }
        return of([])
      })).subscribe((song: Song) => {
        this.songInfo = song;
        console.log(this.songInfo);
        this.chartSelectOptions = Object.keys(this.songInfo.charts)
        if (initialLoad) {
          this.selectedSeries = this.chartSelectOptions[0];
        }
        this.weeksOn = song.charts[this.selectedSeries].length;
        this.peak = [...song.charts[this.selectedSeries]]
          .sort((a, b) => a.position - b.position)[0]
          .position
        console.log(this.songInfo.charts[this.selectedSeries])
        this.songInfo.charts[this.selectedSeries].sort((a, b) => new Date(a.date) > new Date(b.date) ? 1 : -1)
        this.chartRuns = song.charts[this.selectedSeries].map(chart => {
          return { run: chart, endReached: false }
        })
        this.songDetailsForm.setValue({ title: song.title, artistDisplay: song.artistDisplay });
      }))
  }

  public updateSongDetails() {
    const updatedDetails = !this.artistsChanged()
      ? this.songDetailsForm.value
      : { ...this.songDetailsForm.value, ...{ artists: this.artistNames } }
    this.songService.updateSong(this.songInfo._id, updatedDetails).subscribe(() => {
      this.exitEditMode()
      this.reloadSongDetails()
    })
  }

  public enterEditMode() {
    // It thinks the artists are a list of strings when actually they're a list of objects
    this.artistNames = this.songInfo.artists.map(artist => (artist as unknown as Record<string, unknown>).name)
    this.editMode = true
  }

  public exitEditMode() {
    this.editMode = false
  }

  public updateArtists(event: string[]) {
    this.artistNames = event
  }

  /**
   * Check if any artists have been added or removed during the editing
   */
  private artistsChanged(): boolean {
    // If the list of artists is different, then something has been changed
    if (this.songInfo?.artists?.length && this.songInfo.artists.length != this.artistNames.length) {
      return true;
    }
    // We are now left with the situation where the number of artists hasn't changed
    // If there is an artist in the new list not in the old list, something has changed
    for (const name of this.artistNames) {
      if (!this.songInfo?.artists?.find(artist => (artist as unknown as Record<string, unknown>).name == name)) {
        return true;
      }
    }
    return false
  }
}
