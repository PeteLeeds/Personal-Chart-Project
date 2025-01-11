import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core'; // First, import Input
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'artist-selector',
    templateUrl: './artist-selector.component.html',
    standalone: false
})
export class ArtistSelectorComponent {
  @Input() artists = []; // decorate the property with @Input()
  @Output() artistsChangeEvent = new EventEmitter<string[]>();

  faPlus = faPlus;
  faMinus = faMinus;

  public modifiedArtists = []

  public addArtist() {
    this.modifiedArtists.push("");
    this.artistsChangeEvent.emit(this.modifiedArtists)
  }

  public removeArtist(pos: number) {
    this.modifiedArtists.splice(pos, 1)
    this.artistsChangeEvent.emit(this.modifiedArtists)
  }

  public ngOnChanges(changes: SimpleChanges) {
    console.log('CHANGES', changes)
    this.modifiedArtists = changes.artists.currentValue as unknown as unknown[]
  }

  public emitNewArtists() {
    this.artistsChangeEvent.emit(this.modifiedArtists)
  }

  public trackByFn(index: any, _: any) {
    return index;
  } 
}