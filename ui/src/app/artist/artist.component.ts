import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ArtistService } from '../services/artist.service';
import { Artist } from '../types/artist';

@Component({
  selector: 'app-artist',
  templateUrl: './artist.component.html',
  styleUrls: ['../styles/common-styles.css', './artist.component.css']
})
export class ArtistComponent implements OnInit {
  private artistService: ArtistService;
  public artistCount: number;
  public pageNumber = 1;
  public artists: Artist[];

  public searchOptions = {
    type: 'artist',
    returnCount: 20
  }

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

  public setDisplayedArtists(artists: Artist[]) {
    this.artists = artists
  }

  public reloadArtists() {
    forkJoin({
      artists: this.artistService.getArtists(this.pageNumber - 1, 'name', 20),
      artistCount: this.artistService.getArtistCount()
    }).subscribe(res => {
      this.artists = res.artists;
      this.artistCount = res.artistCount;
    })
  }

}
