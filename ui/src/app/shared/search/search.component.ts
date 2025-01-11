import { Component, EventEmitter, Input, Output } from '@angular/core'; // First, import Input

@Component({
    selector: 'search',
    templateUrl: './search.component.html',
    standalone: false
})
export class SearchComponent {
  @Input() type: 'song' | 'artist'
  @Output() changeEvent = new EventEmitter<Record<string, string>>();

  public title = ''
  public artist = ''

  public setParams(): void {
    if (this.type === 'song') {
      this.changeEvent.emit({
        title: this.title,
        artist: this.artist,
      })
    }
    else {
      this.changeEvent.emit({
        name: this.artist,
      })
    }
  }
}