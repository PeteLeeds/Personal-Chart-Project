import { Component, OnInit, ViewChild } from '@angular/core';
import { ArtistService } from 'src/app/services/artist.service';
import { ChartService } from 'src/app/services/chart.service';
import { SongService } from 'src/app/services/song.service';
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
  public type = ''

  constructor(songService: SongService, artistService: ArtistService) {
    this.songService = songService
    this.artistService = artistService
  }

  public open(type: string, id: string): Promise<unknown> {
    this.type = type
    this.id = id
    console.log(this.id)
    return this.baseModal.open();
  }

  public modalConfig: ModalConfig = {
    modalTitle: 'Create Series',
    dismissButtonLabel: 'Close',
    // An 'x' in the corner should eventually be sufficient
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

  public search(): void {
    console.log(this.title, this.artist)
    if (this.type === 'song') {
      this.songService.searchSongs(this.title, this.artist)
      .subscribe(res => this.suggestions = res)
    }
    else {
      this.artistService.searchArtists(this.artist)
      .subscribe(res => this.suggestions = res)
    }
  }

  public selectItem(song: Song): void {
    this.selectedId = song._id
    console.log(this.selectedId)
  }

  ngOnInit(): void {
  }

}
