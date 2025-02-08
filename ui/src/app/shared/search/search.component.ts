import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms'; // First, import Input

@Component({
    selector: 'search',
    templateUrl: './search.component.html',
    imports: [NgIf, FormsModule]
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