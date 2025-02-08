import { Component, OnInit, ViewChild } from '@angular/core';
import { ArtistService } from 'src/app/services/artist.service';
import { SongService } from 'src/app/services/song.service';
import { FullSongInfo } from 'src/app/types/song';
import { ModalTemplateComponent } from '../modal-template/modal-template.component';
import { ModalConfig } from '../modal.config';
import { Observable } from 'rxjs';
import { Artist } from 'src/app/types/artist';
import { SearchComponent } from '../../shared/search/search.component';
import { NgFor, NgClass, NgIf } from '@angular/common';

@Component({
    selector: 'mark-duplicate-modal',
    templateUrl: './mark-duplicate.component.html',
    styleUrls: ['./mark-duplicate.component.css'],
    imports: [ModalTemplateComponent, SearchComponent, NgFor, NgClass, NgIf]
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
    return this.baseModal.open();
  }

  public modalConfig: ModalConfig = {
    modalTitle: 'Mark Duplicate',
    dismissButtonLabel: 'Close',
    completeButtonLabel: 'Mark Duplicate',
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

  public reloadSuggestions(params: Record<string, string>) {
    const queryOptions = {
      ...params,
      limit: '10',
      sortBy: 'name'
    }
    const suggestionObservable = (this.type == 'artist'
      ? this.artistService.getArtists(queryOptions)
      : this.songService.getSongs(queryOptions)) as Observable<Artist[] | FullSongInfo[]>
    suggestionObservable.subscribe((suggestions) => this.suggestions = suggestions)
  }

  public selectItem(song: FullSongInfo): void {
    this.selectedId = song._id
  }

  ngOnInit(): void {
  }

}
