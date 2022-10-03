import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ArtistService } from '../services/artist.service';
import { SongService } from '../services/song.service';
import { Artist } from '../types/artist';

@Component({
  selector: 'app-artist',
  templateUrl: './artist.component.html',
  styleUrls: ['./artist.component.css']
})
export class ArtistComponent implements OnInit {

  private artistService: ArtistService;
  public artistCount: number;
  public pageNumber = 1;
  public artists: Artist[];


  constructor(artistService: ArtistService) {
    this.artistService = artistService;
  }

  public ngOnInit(): void {
    this.reloadArtists();
  }

  public incPageNumber() {
    this.pageNumber++;
    this.reloadArtists();
  }

  public decPageNumber() {
    this.pageNumber--;
    this.reloadArtists();
  }

  public reloadArtists() {
    forkJoin({
      artists: this.artistService.getArtists(this.pageNumber - 1),
      artistCount: this.artistService.getArtistCount()
    }).subscribe(res => {
      this.artists = res.artists;
      this.artistCount = res.artistCount;
    })
  }

}
