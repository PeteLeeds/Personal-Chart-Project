import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { SongService } from '../services/song.service';
import { FullSongInfo } from '../types/song';

@Component({
    selector: 'app-song',
    templateUrl: './song.component.html',
    styleUrls: ['../styles/common-styles.css', './song.component.css'],
    standalone: false
})
export class SongComponent implements OnInit {

  private songService: SongService;
  public songs: FullSongInfo[];
  public songCount: number;
  public sortBy = "title";
  public sortOptions = ["title", "artistDisplay"];
  public pageNumber = 1;
  public searchParams = {}

  constructor(songService: SongService) {
    this.songService = songService;
  }

  public ngOnInit(): void {
    this.reloadSongs();
  }

  public setParams(params: Record<string, string>) {
    this.searchParams = params
    this.pageNumber = 1
    this.reloadSongs()
  }

  public reloadSongs() {
    const queryOptions = {
      ...this.searchParams,
      sortBy: this.sortBy,
      pageNumber: (this.pageNumber - 1).toString(),
      limit: "20"
    }
    forkJoin({
      songs: this.songService.getSongs(queryOptions),
      songCount: this.songService.getSongCount(queryOptions)
    }).subscribe(res => {
      this.songs = res.songs;
      this.songCount = res.songCount;
    })
  }

  public incPageNumber() {
    this.pageNumber++;
    this.reloadSongs();
  }

  public decPageNumber() {
    this.pageNumber--;
    this.reloadSongs();
  }

}
