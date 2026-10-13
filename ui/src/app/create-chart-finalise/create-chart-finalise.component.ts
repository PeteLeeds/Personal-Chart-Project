import { Component, ViewChild } from '@angular/core';
import { ChartService } from '../services/chart.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { FullChart } from '../types/chart';
import { NewSongsComponent } from '../modals/new-songs/new-songs.component';
import { preEmptArtistName } from '../shared/pre-empt-artist-name';

import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-create-chart-finalise',
    templateUrl: './create-chart-finalise.component.html',
    styleUrls: ['../styles/common-styles.css', './create-chart-finalise.component.css'],
    imports: [RouterLink, MatProgressSpinner, NewSongsComponent]
})
export class CreateChartFinaliseComponent {
  @ViewChild('newSongsModal') private newSongsModal: NewSongsComponent | undefined;

  private chartService: ChartService
  private activatedRoute: ActivatedRoute
  private sessionId: string | undefined
  private router: Router
  private subscriptions: Subscription[] = []
  public chartPreview: FullChart | undefined;

  constructor(chartService: ChartService, router: Router, activatedRoute: ActivatedRoute) {
    this.chartService = chartService
    this.router = router
    this.activatedRoute = activatedRoute
  }

  public ngOnInit(): void {
    this.subscriptions.push(this.activatedRoute.params.pipe(mergeMap(params => {
      if (params.session) {
        this.sessionId = params.session
        return this.chartService.getChartPreview(params.session)
      }
      return of({} as FullChart)
    })).subscribe(res => {
      this.chartPreview = res
    }, err => {
      console.warn('Error retrieving subscription', err)
    }))
  }

  public async submit(): Promise<void> {
    if (!this.chartPreview) {
      throw new Error('chartPreview is not defined')
    }
    const songsToFormat = this.chartPreview.songs.filter(song => song?.artistIds?.length == 0).map(song => {
      return {
      ...song,
      artists: preEmptArtistName(song.title, song.artistDisplay),
      exists: false
    }})
    if (!this.newSongsModal) {
      throw new Error('newSongsModal is not defined')
    }
    const newSongs = await this.newSongsModal.open(songsToFormat);
    if (!this.sessionId) {
      throw new Error('sessionId is not defined')
    }
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
