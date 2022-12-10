import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartService } from 'src/app/services/chart.service';
import { ModalTemplateComponent } from '../modal-template/modal-template.component';
import { ModalConfig } from '../modal.config';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { FormattedSong } from 'src/app/types/song';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'new-songs-modal',
  templateUrl: './new-songs.component.html',
  styleUrls: ['./new-songs.component.css']
})
export class NewSongsComponent implements OnInit {
  @ViewChild('modal') private baseModal: ModalTemplateComponent;
  faPlus = faPlus;
  faMinus = faMinus;

  public chartSongs: FormattedSong[]

  public modalConfig: ModalConfig = {
    modalTitle: 'New Songs',
    dismissButtonLabel: 'Close',
    // An 'x' in the corner should eventually be sufficient
    closeButtonLabel: 'Confirm',
    onClose: () => new Promise<unknown>((resolve) => {
      resolve(this.chartSongs)
    })
  }

  public open(songs: FormattedSong[]): Promise<unknown> {
    console.log('songs', songs)
    this.chartSongs = songs;
    return this.baseModal.open();
  }

  public ngOnInit(): void {
  }

  public updateArtists(song: Record<string, string[]>, event: string[]) {
    song.artists = event
  }

}
