import { Component, ViewChild } from '@angular/core';
import { ModalTemplateComponent } from '../modal-template/modal-template.component';
import { ModalConfig } from '../modal.config';
import { FormControl, FormGroup } from '@angular/forms';
import { hyphenValidator } from 'src/app/shared/hyphen-validator';
import { SessionSong } from 'src/app/types/chart';

@Component({
    selector: 'add-songs-modal',
    templateUrl: './add-songs.component.html',
    styleUrls: ['./add-songs.component.css'],
    standalone: false
})
export class AddSongsComponent {
  @ViewChild('modal') private baseModal: ModalTemplateComponent;

  public addSongsForm = new FormGroup({
      songs: new FormControl<string>('', hyphenValidator()),
  });

  public modalConfig: ModalConfig = {
    modalTitle: 'Add Songs',
    dismissButtonLabel: 'Close',
    completeButtonLabel: 'Add Songs',
    disableCloseButton: () => !this.addSongsForm.valid,
    onClose: () => new Promise<SessionSong[]>((resolve) => {
        const newSongs = this.formatSongs(this.addSongsForm.value.songs)
        resolve(newSongs);
    })
  }
  
  public formatSongs(songString: string): SessionSong[] {
    const songs = songString.split('\n');
    return songs.map(song => {
      const indexOfFirstHyphen = song.indexOf(' - ')
      let artistDisplay = song.slice(0, indexOfFirstHyphen);
      let title = song.slice(indexOfFirstHyphen + 3);
      artistDisplay = artistDisplay.trim(); title = title.trim();
      return {artistDisplay, title}
    })
  }

  public open(): Promise<unknown> {
    return this.baseModal.open();
  }

}
