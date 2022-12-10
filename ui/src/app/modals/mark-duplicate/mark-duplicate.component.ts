import { Component, OnInit, ViewChild } from '@angular/core';
import { ArtistService } from 'src/app/services/artist.service';
import { ChartService } from 'src/app/services/chart.service';
import { SongService } from 'src/app/services/song.service';
import { SearchOptions } from 'src/app/types/search-options';
import { Song } from 'src/app/types/song';
import { ModalTemplateComponent } from '../modal-template/modal-template.component';
import { ModalConfig } from '../modal.config';

@Component({
  selector: 'mark-duplicate-modal',
  templateUrl: './mark-duplicate.component.html',
  styleUrls: ['./mark-duplicate.component.css']
})
export class MarkDuplicateComponent implements OnInit {
  @ViewChild('modal') private baseModal: ModalTemplateComponent;

  public title = '';
  public artist = '';
  private songService: SongService;
  private artistService: ArtistService;
  public suggestions = []
  public selectedId = ''
  private id = ''
  public type: 'artist' | 'song'
  public searchOptions: SearchOptions

  constructor(songService: SongService, artistService: ArtistService) {
    this.songService = songService
    this.artistService = artistService
  }

  public open(type: string, id: string): Promise<unknown> {
    if (type !== 'artist' && type !== 'song') {
      throw new Error('type must be artist or song')
    }
    this.type = type
    this.id = id
    this.searchOptions = {
      type: this.type,
      returnCount: 10
    }
    return this.baseModal.open();
  }

  public modalConfig: ModalConfig = {
    modalTitle: 'Create Series',
    dismissButtonLabel: 'Close',
    closeButtonLabel: 'Mark Duplicate',
    onClose: () => new Promise<string>((resolve) => {
      const subscription = this.type === 'song'
                          ? this.songService.mergeSongs(this.id, this.selectedId)
                          : this.artistService.mergeArtists(this.id, this.selectedId)
      subscription.subscribe((res) => {
          console.log('merged', res)
          resolve(this.selectedId)
      })
    })
  }

  public setSuggestions(suggestions) {
    this.suggestions = suggestions
  }

  public selectItem(song: Song): void {
    this.selectedId = song._id
  }

  ngOnInit(): void {
  }

}
