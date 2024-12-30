import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { ChartService } from 'src/app/services/chart.service';
import { Session } from 'src/app/types/chart';

@Component({
  selector: 'app-rank-songs',
  templateUrl: './rank-songs.component.html',
  styleUrls: ['../../styles/common-styles.css', './rank-songs.component.css']
})
export class RankSongsComponent {

    private activatedRoute: ActivatedRoute
    private chartService: ChartService

    public sessionId: string
    public session: Session
    public insertButtonsToDisplay: number[]
    public songToMove: number

    public constructor(activatedRoute: ActivatedRoute, chartService: ChartService) {
      this.activatedRoute = activatedRoute
      this.chartService = chartService
    }

    ngOnInit(): void {
      this.activatedRoute.params.pipe(mergeMap(params => {
        if (params.session) {
          this.sessionId = params.session
          return this.chartService.getInteractiveSession(this.sessionId)
        }
        return of({} as Session)
      })).subscribe(res => {
        this.session = res
      })
    }

    public addSong(position: number): void {
      if (this.songToMove != null) {
        const movingSong = this.session.placedSongs[this.songToMove]
        this.session.placedSongs[this.songToMove] = null
        this.session.placedSongs.splice(position, 0, movingSong)
        this.session.placedSongs = this.session.placedSongs.filter(song => !!song)
        this.songToMove = null
      } else {
        this.session.placedSongs.splice(position, 0, this.session.songOrder[0])
        this.session.songOrder.shift()
      }
      this.chartService.updateSession(this.sessionId, {
        placedSongs: this.session.placedSongs,
        songOrder: this.session.songOrder
      }).subscribe()
    }

    public setInsertButtonsToDisplay(valueHoveredOver: number): void {
      this.insertButtonsToDisplay = [valueHoveredOver - 1, valueHoveredOver]
    }

    public removeInsertButtons(): void {
      this.insertButtonsToDisplay = []
    }

    public selectSongToMove(position: number): void {
      if (this.songToMove == position) {
        this.songToMove = null
      } else {
        this.songToMove = position
      }
      console.log(this.songToMove)
    }

}
