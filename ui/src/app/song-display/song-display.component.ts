import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClipboardService } from 'ngx-clipboard';
import { forkJoin, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { MarkDuplicateComponent } from '../modals/mark-duplicate/mark-duplicate.component';
import { ArtistService } from '../services/artist.service';
import { SongService } from '../services/song.service';
import { getChartHistory, getMarkdownChartHistory } from '../shared/get-chart-history';
import { getFullChartRun } from '../shared/get-chart-run';
import { AbstractSongInfo } from '../types/song';
import { faMusic } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { ArtistSelectorComponent } from '../shared/artist-selector.commponent';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-song-display',
    templateUrl: './song-display.component.html',
    styleUrls: ['../styles/common-styles.css', './song-display.component.css'],
    imports: [FaIconComponent, RouterLink, FormsModule, ReactiveFormsModule, ArtistSelectorComponent, MatProgressSpinner, MarkDuplicateComponent]
})
export class SongDisplayComponent implements OnInit {
  @ViewChild('markDuplicateModal') private markDuplicateModal?: MarkDuplicateComponent;

  private subscriptions: Subscription[] = []
  private activatedRoute: ActivatedRoute;
  private songService: SongService;
  private artistService: ArtistService;
  private clipboardService: ClipboardService;
  private router: Router;

  public songInfo?: AbstractSongInfo;
  public selectedSeries = "";
  public chartSelectOptions?: string[];
  public chartRuns = [];
  public editMode = false;
  public artistNames: string[] = []

  public faMusic = faMusic;

  public songDetailsForm = new FormGroup({
    title: new FormControl<string>('', {nonNullable: true}),
    artistDisplay: new FormControl<string>('', {nonNullable: true}),
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
        throw new Error('id is not defined')
      })).subscribe((song: AbstractSongInfo) => {
        this.songInfo = song;
        this.chartSelectOptions = this.songInfo.series
        if (initialLoad) {
          if (!this.chartSelectOptions) {
            throw new Error('chartSelectOptions is not defined')
          }
          this.selectedSeries = this.chartSelectOptions[0];
        }
        this.songDetailsForm.setValue({ title: song.title, artistDisplay: song.artistDisplay });
      }))
  }

  public updateSongDetails() {
    if (!this.songInfo) {
      throw new Error('songInfo is not defined')
    }
    const updatedDetails = !this.artistsChanged()
      ? this.songDetailsForm.getRawValue()
      : { ...this.songDetailsForm.getRawValue(), ...{ artists: this.artistNames } }
    this.songService.updateSong(this.songInfo._id, updatedDetails).subscribe(() => {
      this.exitEditMode()
      this.reloadSongDetails()
    })
  }

  public enterEditMode() {
    if (!this.songInfo?.artists) {
      throw new Error('artists are not defined')
    }
    this.artistNames = this.songInfo.artists.map(artist => (artist as unknown as Record<string, string>).name)
    this.editMode = true
  }

  public exitEditMode() {
    this.editMode = false
  }

  public updateArtists(event: string[]) {
    this.artistNames = event
  }

  public async markDuplicate() {
    if (!this.markDuplicateModal) {
      throw new Error('markDuplicateModal is not defined')
    }
    if (!this.songInfo) {
      throw new Error('songInfo is not defined')
    }
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
    const bbCodeChartRun = getFullChartRun(this.chartRuns, 'bbcode')
    this.clipboardService.copyFromContent(bbCodeChartRun)
  }

  public copyDisplay() {
    if (!this.songInfo) {
      throw new Error('songInfo is not defined')
    }
    let display = '[color=#000000][size=5][b]#xx[/b] (xxpts)[/size][/color]'
    display += `\n\n[size=4][b]${this.songInfo.artistDisplay}[/b][/size]\n[i][size=3][b]${this.songInfo.title}[/b][/size][/i]`
    display += `\n-\n[size=4][b]Chart Statistics[/b][/size]\n\n${this.songInfo.chartRuns && getFullChartRun(this.songInfo.chartRuns, 'bbcode')}\n\n`
    display += `[size=4][b]Video[/b][/size]\n\n[youtube][/youtube]\n\n[size=4][b]Commentary[/b][/size]\n\n`
    const artistObservables = this.songInfo.artists ? this.songInfo.artists.map(artist => this.artistService.getArtistById(artist._id)) : []
    forkJoin(artistObservables).subscribe(async artists => {
      let chartHistories = ''
      for (const artist of artists) {
        chartHistories += getChartHistory(artist)
        chartHistories += '\n\n'
      }
      display += `[size=4][b]Top 100 Chart History[/b][/size]\n\n[size=1]${chartHistories}[/size]`
      this.clipboardService.copyFromContent(display)
    })
  }

  public copyMarkdownDisplay() {
    if (!this.songInfo) {
      throw new Error('songInfo is not defined')
    }
    let display = '## *xx* (xxpts)'
    display += `\n\n## **${this.songInfo.artistDisplay}**\n### ***${this.songInfo.title}***`
    display += `\n--\n### **Chart Statistics**\n\n${this.songInfo.chartRuns && getFullChartRun(this.songInfo.chartRuns, 'markdown')}\n\n`
    display += `### **Video**\n\n--\n\n### **Commentary**\n\n`
    const artistObservables = this.songInfo.artists ? this.songInfo.artists.map(artist => this.artistService.getArtistById(artist._id)) : []
    forkJoin(artistObservables).subscribe(async artists => {
      let chartHistories = ''
      for (const artist of artists) {
        chartHistories += getMarkdownChartHistory(artist)
        chartHistories += '\n\n'
      }
      display += `### **Top 100 Chart History**\n\n${chartHistories}`
      this.clipboardService.copyFromContent(display)
    })
  }
}
