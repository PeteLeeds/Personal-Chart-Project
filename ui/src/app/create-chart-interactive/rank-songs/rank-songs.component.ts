import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { ChartService } from 'src/app/services/chart.service';
import { Session } from 'src/app/types/chart';

@Component({
  selector: 'app-rank-songs',
  templateUrl: './rank-songs.component.html',
  styleUrls: ['./rank-songs.component.css']
})
export class RankSongsComponent {

    private activatedRoute: ActivatedRoute
    private chartService: ChartService

    public sessionId: string
    public session: Session

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
      this.session.placedSongs.splice(position, 0, this.session.songOrder[0])
      this.session.songOrder.shift()
    }

}
