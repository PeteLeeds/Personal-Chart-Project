import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-rank-songs',
  templateUrl: './rank-songs.component.html',
  styleUrls: ['./rank-songs.component.css']
})
export class RankSongsComponent {

    private activatedRoute: ActivatedRoute

    public sessionId: string

    public constructor(activatedRoute: ActivatedRoute) {
      this.activatedRoute = activatedRoute
    }

    ngOnInit(): void {
      this.activatedRoute.params.subscribe((params => {
        console.log(params)
        if (params.session) {
          this.sessionId = params.session
        }
    }))}

}
