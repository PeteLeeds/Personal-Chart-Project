import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClipboardService } from 'ngx-clipboard';
import { of, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { MarkDuplicateComponent } from '../modals/mark-duplicate/mark-duplicate.component';
import { ArtistService } from '../services/artist.service';
import { getChartHistory } from '../shared/get-chart-history';
import { Artist } from '../types/artist';
import { faGuitar } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-artist-display',
    templateUrl: './artist-display.component.html',
    styleUrls: ['../styles/common-styles.css', './artist-display.component.css'],
    imports: [FaIconComponent, NgIf, FormsModule, NgFor, RouterLink, MatProgressSpinner, MarkDuplicateComponent]
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
    console.log('reloading', this.selectedSeries)
    this.subscriptions.push(
      this.activatedRoute.params.pipe(mergeMap(params => {
        if (params.id) {
          return this.artistService.getArtistById(params.id, this.selectedSeries);
        }
        return of({})
      })).subscribe((artist: Artist) => {
        this.artistInfo = artist;
        if (initialLoad) {
          this.selectedSeries = artist.series[0];
        }
        console.log('got', this.artistInfo)
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
    const chartHistory = getChartHistory(this.artistInfo)
    this.clipboardService.copyFromContent(chartHistory)
  }

}
