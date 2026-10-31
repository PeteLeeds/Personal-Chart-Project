import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { ChartService } from 'src/app/services/chart.service';
import { Session, SessionSong } from 'src/app/types/chart';
import { faListOl, faPlus } from '@fortawesome/free-solid-svg-icons';
import { AddSongsComponent } from 'src/app/modals/add-songs/add-songs.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { AddSongsComponent as AddSongsComponent_1 } from '../../modals/add-songs/add-songs.component';

@Component({
    selector: 'app-rank-songs',
    templateUrl: './rank-songs.component.html',
    styleUrls: ['../../styles/common-styles.css', './rank-songs.component.css'],
    imports: [FaIconComponent, RouterLink, AddSongsComponent_1]
})
export class RankSongsComponent {
    @ViewChild('addSongsModal') private addSongsModal: AddSongsComponent | undefined;

    private activatedRoute: ActivatedRoute
    private chartService: ChartService
    private subscriptions: Subscription[] = []

    public sessionId: string | undefined
    public session: Session | undefined
    public insertButtonsToDisplay: number[] | undefined
    public songToMove: number | undefined
    public showNumbers = false

    faListOl = faListOl
    faPlus = faPlus

    public constructor(activatedRoute: ActivatedRoute, chartService: ChartService) {
      this.activatedRoute = activatedRoute
      this.chartService = chartService
    }

    ngOnInit(): void {
      this.subscriptions.push(this.activatedRoute.params.pipe(mergeMap(params => {
        if (params.session) {
          this.sessionId = params.session
          return this.chartService.getInteractiveSession(params.session)
        }
        return of({} as Session)
      })).subscribe(res => {
        this.session = res
      }))
    }

    private updateCurrentSession() {
      if (!this.sessionId) {
        throw new Error('sessionId is not defined')
      }
      if (!this.session) {
        throw new Error('session is not defined')
      }
      this.chartService.updateSession(this.sessionId, {
        placedSongs: this.session.placedSongs,
        songOrder: this.session.songOrder
      }).subscribe()
    }

    public addSong(position: number): void {
      if (!this.session) {
        throw new Error('session is not defined')
      }
      if (this.songToMove != null) {
        const movingSong = this.session.placedSongs[this.songToMove]
        this.session.placedSongs[this.songToMove] = null
        this.session.placedSongs.splice(position, 0, movingSong)
        this.session.placedSongs = this.session.placedSongs.filter(song => !!song)
        this.songToMove = undefined
      } else {
        this.session.placedSongs.splice(position, 0, this.session.songOrder[0])
        this.session.songOrder.shift()
      }
      this.updateCurrentSession()
    }

    public setInsertButtonsToDisplay(valueHoveredOver: number): void {
      this.insertButtonsToDisplay = [valueHoveredOver - 1, valueHoveredOver]
    }

    public removeInsertButtons(): void {
      this.insertButtonsToDisplay = []
    }

    public selectSongToMove(position: number): void {
      if (this.songToMove == position) {
        this.songToMove = undefined
      } else {
        this.songToMove = position
      }
      console.log(this.songToMove)
    }

    public moveToBack(): void {
      if (!this.session) {
        throw new Error('session is not defined')
      }
      this.session.songOrder.push(this.session.songOrder[0])
      this.session.songOrder.shift()
      this.updateCurrentSession()
    }

    public toggleNumbers(): void {
      this.showNumbers = !this.showNumbers
    }

    public async openAddSongsModal(): Promise<void> {
      if (!this.session) {
        throw new Error('session is not defined')
      }
      if (!this.addSongsModal) {
        throw new Error('addSongsModal is not defined')
      }
      const newSongs = await this.addSongsModal.open() as SessionSong[]
      this.session.songOrder.push(...newSongs)
      this.updateCurrentSession()
    }

    public ngOnDestroy(): void {
      for (const subscription of this.subscriptions) {
        subscription.unsubscribe();
      }
    }

}
