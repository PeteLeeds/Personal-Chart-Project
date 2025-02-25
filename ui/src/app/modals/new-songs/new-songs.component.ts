import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalTemplateComponent } from '../modal-template/modal-template.component';
import { ModalConfig } from '../modal.config';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { FormattedSong } from 'src/app/types/song';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArtistSelectorComponent } from '../../shared/artist-selector.commponent';

@Component({
    selector: 'new-songs-modal',
    templateUrl: './new-songs.component.html',
    styleUrls: ['./new-songs.component.css'],
    imports: [ModalTemplateComponent, NgFor, NgIf, FormsModule, ArtistSelectorComponent]
})
export class NewSongsComponent implements OnInit {
  @ViewChild('modal') private baseModal: ModalTemplateComponent;
  faPlus = faPlus;
  faMinus = faMinus;

  public chartSongs: FormattedSong[]

  public modalConfig: ModalConfig = {
    modalTitle: 'New Songs',
    dismissButtonLabel: 'Close',
    completeButtonLabel: 'Confirm',
    onClose: () => new Promise<unknown>((resolve) => {
      resolve(this.chartSongs)
    })
  }

  public open(songs: FormattedSong[]): Promise<FormattedSong[]> {
    this.chartSongs = songs;
    console.log('songs', this.chartSongs)
    return this.baseModal.open() as Promise<FormattedSong[]>;
  }

  public ngOnInit(): void {
  }

  public updateArtists(song: Record<string, string[]>, event: string[]) {
    song.artists = event
  }

}
