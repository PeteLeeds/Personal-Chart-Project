import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClipboardService } from 'ngx-clipboard';
import { forkJoin, of, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { MarkDuplicateComponent } from '../modals/mark-duplicate/mark-duplicate.component';
import { ArtistService } from '../services/artist.service';
import { SongService } from '../services/song.service';
import { Artist } from '../types/artist';
import { Song } from '../types/song';

@Component({
  selector: 'app-artist-display',
  templateUrl: './artist-display.component.html',
  styleUrls: ['./artist-display.component.css']
})
export class ArtistDisplayComponent implements OnInit {
  @ViewChild('markDuplicateModal') private markDuplicateModal: MarkDuplicateComponent;

  private artistService: ArtistService;
  private activatedRoute: ActivatedRoute;
  private subscriptions: Subscription[] = []
  private router: Router;
  private clipboardService: ClipboardService;
  
  public artistInfo: Artist;
  public selectedSeries = "";
  public chartSelectOptions: string[];

  constructor(artistService: ArtistService, 
              activatedRoute: ActivatedRoute, 
              router: Router, clipboardService: 
              ClipboardService) {
    this.artistService = artistService;
    this.activatedRoute = activatedRoute;
    this.router = router;
    this.clipboardService = clipboardService;
  }

  public reloadArtist(initialLoad = false): void {
    this.subscriptions.push(
      this.activatedRoute.params.pipe(mergeMap(params => {
        if (params.id) {
          return this.artistService.getArtistById(params.id, this.selectedSeries);
        }
        return of({})
      })).subscribe((artist: Artist) => {
        this.artistInfo = artist;
        this.chartSelectOptions = [];
        // Get distinct set of series this artist appears in
        for (const song of this.artistInfo.songs) {
          for (const chart of Object.keys(song.charts)) {
            // Sort in ascending order so that peak is at position 0
            song.charts[chart].sort((a, b) => a.position - b.position);
            song.charts[chart].peak = song.charts[chart][0].position
            // Then sort in date order
            song.charts[chart].sort((a, b) => a.date > b.date ? 1 : -1)
            if (!(this.chartSelectOptions.includes(chart))) {
              this.chartSelectOptions.push(chart);
            }
          }
        }
        if (initialLoad) {
          this.selectedSeries = this.chartSelectOptions[0];
        }
        this.artistInfo.songs.sort((a,b) => this.sortSongs(a, b))
        // This line is needed to trigger the change on the frontend
        this.artistInfo.songs = [...this.artistInfo.songs]
      }))  
  }

  private sortSongs(songA, songB): number {
    // Sort by date, then by highest entry position
    const song1EntryDate = songA.charts[this.selectedSeries][0].date
    const song2EntryDate = songB.charts[this.selectedSeries][0].date
    if (song1EntryDate === song2EntryDate) {
      return (songA.charts[this.selectedSeries][0].position - songB.charts[this.selectedSeries][0].position)
    } else {
      return (song1EntryDate > song2EntryDate ? 1 : -1)
    }
  }

  public ngOnInit(): void {
    this.reloadArtist(true)
  }

  public enterEditMode(): void {
    console.log('enterEditMode')
  }

  public async markDuplicate() {
    const duplicateId = await this.markDuplicateModal.open('artist', this.artistInfo._id)
    this.router.navigate(['../', duplicateId], { relativeTo: this.activatedRoute })
  }

  public copyChartHistory() {
    let bbCodeString = `[b]${this.artistInfo.name}[/b]\n[size=1]`
    for (const song of this.artistInfo.songs) {
      const chartInfo = song.charts[this.selectedSeries]
      let songString = new Date(chartInfo[0].date).getFullYear() + " " 
                        + this.getFormattedPeak(song.charts[this.selectedSeries].peak) + " " 
                        + this.getFormattedTitle(song.title, song.artistDisplay)
      songString += '\n'
      bbCodeString += songString
    }
    bbCodeString += "[/size]"
    this.clipboardService.copyFromContent(bbCodeString)
  }

  private getFormattedPeak(peak: number) {
    if (peak === 1) {
      return `[color=#FF0000][b]01[/b][/color]`
    }
    if (peak <= 10) {
      return `[color=#0000FF][b]${peak === 10 ? peak : `0${peak}`}[/b][/color]`
    }
    if (peak <= 40) {
      return `[b]${peak}[/b]`
    }
    return `[color=#708090][b]${peak}[/b][/color]`
  }

  private getFormattedTitle(songTitle: string, artistDisplay: string) {
    const additionalArtistDisplay = artistDisplay !== this.artistInfo.name
    let artistDisplaySatisfied = !additionalArtistDisplay
    const collaborationStrings = ['ft.', 'with', 'feat.']
    for (const string of collaborationStrings) {
      const index = songTitle.indexOf(`(${string}`);
      if (index !== -1) {
        // Assumes the closing bracket will be at the end
        songTitle = songTitle.substring(0, index) + 
                  `[i]${songTitle[index]}${additionalArtistDisplay ? artistDisplay + ' ' : ''}${songTitle.substring(index + 1)}[/i]`
        if (additionalArtistDisplay) {
          artistDisplaySatisfied = true
        }
        break;
      }
    }
    if (!artistDisplaySatisfied) {
      songTitle += ` [i](${artistDisplay})[/i]`
    }
    return songTitle;
  }

}
