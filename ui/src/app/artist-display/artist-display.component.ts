import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  
  public artistInfo: Artist;
  public selectedSeries = "";
  public chartSelectOptions: string[];

  constructor(artistService: ArtistService, activatedRoute: ActivatedRoute, router: Router) {
    this.artistService = artistService;
    this.activatedRoute = activatedRoute;
    this.router = router;
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
        console.log(this.artistInfo);
        this.chartSelectOptions = [];
        // Get distinct set of series this artist appears in
        for (const song of this.artistInfo.songs) {
          for (const chart of Object.keys(song.charts)) {
            // Sort in ascending order so that peak is at position 0
            song.charts[chart].sort((a, b) => a.position - b.position);
            song.peak = song.charts[chart][0].position 
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
        // TODO: Will need to be reloaded if we decide to stick with loading all at once
        this.artistInfo.songs.sort((a, b) => 
          a.charts[this.selectedSeries][0].date > b.charts[this.selectedSeries][0].date ? 1 : -1)
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


}
