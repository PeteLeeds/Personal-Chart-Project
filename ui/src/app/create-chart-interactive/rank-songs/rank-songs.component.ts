import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-rank-songs',
  templateUrl: './rank-songs.component.html',
  styleUrls: ['./rank-songs.component.css']
})
export class RankSongsComponent {
    @Input() sessionId: string

    public constructor() {
      console.log(this.sessionId)
    }

}
