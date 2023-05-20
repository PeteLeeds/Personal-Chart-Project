import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClipboardService } from 'ngx-clipboard';
import { forkJoin, of, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { MarkDuplicateComponent } from '../modals/mark-duplicate/mark-duplicate.component';
import { ArtistService } from '../services/artist.service';
import { SongService } from '../services/song.service';
import { getChartHistory } from '../shared/get-chart-history';
import { getFullChartRun } from '../shared/get-chart-run';
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
  @ViewChild('markDuplicateModal') private markDuplicateModal: MarkDuplicateComponent;

  private subscriptions: Subscription[] = []
  private activatedRoute: ActivatedRoute;
  private songService: SongService;
  private artistService: ArtistService;
  private clipboardService: ClipboardService;
  private router: Router;

  public songInfo: Song;
  public selectedSeries = "";
  public chartSelectOptions: string[];
  public chartRuns = [];
  public editMode = false;
  public artistNames = []

  public peak = 0;
  public weeksOn = 0;

  public songDetailsForm = new FormGroup({
    title: new FormControl(''),
    artistDisplay: new FormControl(''),
  });

  constructor(activatedRoute: ActivatedRoute, 
              songService: SongService,
              artistService: ArtistService,
              router: Router,
              clipboardService: ClipboardService) {
    this.activatedRoute = activatedRoute;
    this.songService = songService;
    this.artistService = artistService;
    this.router = router;
    this.clipboardService = clipboardService;
  }

   ngOnInit(): void {
     this.reloadSongDetails(true)
   }

  public reloadSongDetails(initialLoad = false) {
    this.subscriptions.push(
      this.activatedRoute.params.pipe(mergeMap(params => {
        if (params.id) {
          return this.songService.getSongById(params.id, this.selectedSeries)
        }
        return of([])
      })).subscribe((song: Song) => {
        this.songInfo = song;
        this.chartSelectOptions = Object.keys(this.songInfo.charts)
        if (initialLoad) {
          this.selectedSeries = this.chartSelectOptions[0];
        }
        this.songInfo.charts[this.selectedSeries].sort((a, b) => new Date(a.date) > new Date(b.date) ? 1 : -1)
        // Break up chart runs based on dropouts
        this.chartRuns = song.charts[this.selectedSeries].reduce((prevValue, current) => {
          console.log('prev', prevValue, prevValue[-1])
          if (current.position == -1) {
            if (prevValue[prevValue.length - 1].length > 0) {
              prevValue.push([])
            }
            return prevValue
          }
          prevValue[prevValue.length - 1].push(current)
          return prevValue
        }, [[]])
        console.log(JSON.stringify(this.chartRuns))
        song.charts[this.selectedSeries] = song.charts[this.selectedSeries].filter(chart => chart.position != -1)
        this.weeksOn = song.charts[this.selectedSeries].length;
        this.peak = [...song.charts[this.selectedSeries]]
          .sort((a, b) => a.position - b.position)[0]
          .position
        this.songInfo.charts[this.selectedSeries].sort((a, b) => new Date(a.date) > new Date(b.date) ? 1 : -1)
        this.songDetailsForm.setValue({ title: song.title, artistDisplay: song.artistDisplay });
        console.log(JSON.stringify(this.chartRuns))
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
    this.artistNames = this.songInfo.artists.map(artist => (artist as unknown as Record<string, unknown>).name)
    this.editMode = true
  }

  public exitEditMode() {
    this.editMode = false
  }

  public updateArtists(event: string[]) {
    this.artistNames = event
  }

  public async markDuplicate() {
    const duplicateId = await this.markDuplicateModal.open('song', this.songInfo._id)
    this.router.navigate(['../', duplicateId], { relativeTo: this.activatedRoute })
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

  public copyChartRun() {
    const bbCodeChartRun = getFullChartRun(this.songInfo.charts[this.selectedSeries])
    this.clipboardService.copyFromContent(bbCodeChartRun)
  }

  public copyDisplay() {
    let display = '[color=#000000][size=5][b]#xx[/b] (xxpts)[/size][/color]'
    display += `\n\n[size=4][b]${this.songInfo.artistDisplay}[/b][/size]\n[i][size=3][b]${this.songInfo.title}[/b][/size][/i]`
    display += `\n-\n[size=4][b]Chart Statistics[/b][/size]\n\n${getFullChartRun(this.songInfo.charts[this.selectedSeries])}\n\n`
    display += `[size=4][b]Video[/b][/size]\n\n[youtube][/youtube]\n\n[size=4][b]Commentary[/b][/size]\n\n`
    const artistObservables = this.songInfo.artists.map(artist => this.artistService.getArtistById(artist._id))
    forkJoin(artistObservables).subscribe(async artists => {
      let chartHistories = ''
      for (const artist of artists) {
        chartHistories += getChartHistory(artist, this.selectedSeries)
        chartHistories += '\n\n'
      }
      display += `[size=4][b]Top 100 Chart History[/b][/size]\n\n[size=1]${chartHistories}[/size]`
      this.clipboardService.copyFromContent(display)
    })
  }
}
