import { Component, ViewChild } from '@angular/core';
import { ChartService } from '../services/chart.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { FullChart } from '../types/chart';
import { NewSongsComponent } from '../modals/new-songs/new-songs.component';
import { preEmptArtistName } from '../shared/pre-empt-artist-name';
import { NgIf, NgFor } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-create-chart-finalise',
    templateUrl: './create-chart-finalise.component.html',
    styleUrls: ['../styles/common-styles.css', './create-chart-finalise.component.css'],
    imports: [NgIf, NgFor, RouterLink, MatProgressSpinner, NewSongsComponent]
})
export class CreateChartFinaliseComponent {
  @ViewChild('newSongsModal') private newSongsModal: NewSongsComponent;

  private chartService: ChartService
  private activatedRoute: ActivatedRoute
  private sessionId: string
  private router: Router
  private subscriptions: Subscription[] = []
  public chartPreview: FullChart;

  constructor(chartService: ChartService, router: Router, activatedRoute: ActivatedRoute) {
    this.chartService = chartService
    this.router = router
    this.activatedRoute = activatedRoute
  }

  public ngOnInit(): void {
    this.subscriptions.push(this.activatedRoute.params.pipe(mergeMap(params => {
      if (params.session) {
        this.sessionId = params.session
        return this.chartService.getChartPreview(this.sessionId)
      }
      return of({} as FullChart)
    })).subscribe(res => {
      this.chartPreview = res
    }))
  }

  public async submit(): Promise<void> {
    console.log(this.chartPreview.songs)
    const songsToFormat = this.chartPreview.songs.filter(song => song.artistIds.length == 0).map(song => {
      return {
      ...song,
      artists: preEmptArtistName(song.title, song.artistDisplay),
      exists: false
    }})
    const newSongs = await this.newSongsModal.open(songsToFormat);
    this.chartService.completeSession(this.sessionId, newSongs).subscribe((res) => {
      this.router.navigate(['../../../..', res.name], { relativeTo: this.activatedRoute })
    })
  }

  public ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }
}
