import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core'; // First, import Input
import { ArtistService } from 'src/app/services/artist.service';
import { SongService } from 'src/app/services/song.service';
import { Artist } from 'src/app/types/artist';
import { SearchOptions } from 'src/app/types/search-options';
import { Song } from 'src/app/types/song';

@Component({
    selector: 'search',
    templateUrl: './search.component.html',
})
export class SearchComponent {
  @Input() options: SearchOptions // decorate the property with @Input()
  @Output() changeEvent = new EventEmitter<Song[] | Artist[]>();

  private songService: SongService;
  private artistService: ArtistService;

  public title = ''
  public artist = ''

  constructor(songService: SongService, artistService: ArtistService) {
    this.songService = songService
    this.artistService = artistService
  }

  public search(): void {
    console.log('search', this.title, this.artist, this.options)
    if (this.options.type === 'song') {
      this.songService.searchSongs(this.title, this.artist, this.options.returnCount)
      .subscribe(res => this.changeEvent.emit(res))
    }
    else {
      this.artistService.searchArtists(this.artist, this.options.returnCount)
      .subscribe(res => this.changeEvent.emit(res))
    }
  }
}