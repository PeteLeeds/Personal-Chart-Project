import { Component, OnInit, ViewChild } from '@angular/core';
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
  public songSuggestions = []
  public selectedSongId = ''
  private songId = ''

  constructor(songService: SongService) {
    this.songService = songService
  }

  public open(songId: string): Promise<unknown> {
    this.songId = songId
    console.log(this.songId)
    return this.baseModal.open();
  }

  public modalConfig: ModalConfig = {
    modalTitle: 'Create Series',
    dismissButtonLabel: 'Close',
    // An 'x' in the corner should eventually be sufficient
    closeButtonLabel: 'Mark Duplicate',
    onClose: () => new Promise<string>((resolve) => {
      this.songService.mergeSongs(this.songId, this.selectedSongId)
        .subscribe((res) => {
          console.log('merged', res)
          resolve(this.selectedSongId)
        })
    })
  }

  public search(): void {
    console.log(this.title, this.artist)
    this.songService.searchSongs(this.title, this.artist)
      .subscribe(res => this.songSuggestions = res)
  }

  public selectSong(song: Song): void {
    this.selectedSongId = song._id
    console.log(this.selectedSongId)
  }

  ngOnInit(): void {
  }

}
