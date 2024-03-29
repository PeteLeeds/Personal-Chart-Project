import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClipboardService } from 'ngx-clipboard';
import { of, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { MarkDuplicateComponent } from '../modals/mark-duplicate/mark-duplicate.component';
import { ArtistService } from '../services/artist.service';
import { getChartHistory, sortSongs } from '../shared/get-chart-history';
import { Artist } from '../types/artist';
import { faGuitar } from '@fortawesome/free-solid-svg-icons';

const DROPOUT = -1

@Component({
  selector: 'app-artist-display',
  templateUrl: './artist-display.component.html',
  styleUrls: ['../styles/common-styles.css', './artist-display.component.css']
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

  public faGuitar = faGuitar

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
            if (!(this.chartSelectOptions.includes(chart))) {
              this.chartSelectOptions.push(chart);
            }
          }
        }
        if (initialLoad) {
          this.selectedSeries = this.chartSelectOptions[0];
        }
        for (const song of this.artistInfo.songs) {
          if (!song.charts[this.selectedSeries]) {
            continue;
          }
          song.charts[this.selectedSeries] = song.charts[this.selectedSeries].filter(chart => chart.position != DROPOUT)
          // Sort in ascending order so that peak is at position 0
          song.charts[this.selectedSeries].sort((a, b) => a.position - b.position);
          song.peak = song.charts[this.selectedSeries][0].position
          // Then sort in date order
          song.charts[this.selectedSeries].sort((a, b) => a.date > b.date ? 1 : -1)          
        }
        this.artistInfo.songs.sort((a,b) => sortSongs(a, b, this.selectedSeries))
        // This line is needed to trigger the change on the frontend
        this.artistInfo.songs = [...this.artistInfo.songs]
      }))  
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
    const chartHistory = getChartHistory(this.artistInfo, this.selectedSeries)
    this.clipboardService.copyFromContent(chartHistory)
  }

}
