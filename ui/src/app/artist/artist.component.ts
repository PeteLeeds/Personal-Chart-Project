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

  public searchParams = {}

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

  public setParams(params: Record<string, string>) {
    this.searchParams = params
    this.pageNumber = 1
    this.reloadArtists()
  }

  public reloadArtists() {
    const queryOptions = {
      ...this.searchParams,
      pageNumber: (this.pageNumber - 1).toString(),
      limit: '20',
      sortBy: 'name'
    }
    console.log(queryOptions)
    forkJoin({
      artists: this.artistService.getArtists(queryOptions),
      artistCount: this.artistService.getArtistCount(queryOptions)
    }).subscribe(res => {
      this.artists = res.artists;
      this.artistCount = res.artistCount;
    })
  }

}
