import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { CheckedSong, Song } from '../types/song';
import { catchError, map } from 'rxjs/operators';

const BASE_URL = '/database'

@Injectable({
  providedIn: 'root'
})
export class SongService {

  public httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  public getSongById(songId: string, seriesName?: string): Observable<Song> {
    return this.httpClient.get<Song>(`${BASE_URL}/song?id=${songId}${seriesName ? `&seriesName=${seriesName}` : ''}`)
  }

  // May need an appendParams() type if we're going to end up doing lots of similar things
  public checkIfSongExists(songString: string, pos: number): Observable<CheckedSong> {
    // Slashes don't just 'work' as the HTML interprets them as a different URL
    while (songString.includes('/')) {
      let slashCheckIndex = songString.indexOf('/');
      songString = songString.substring(0, slashCheckIndex) + "%2F" + songString.substring(slashCheckIndex + 1)
    }
    return this.httpClient.get<Song>(`${BASE_URL}/song/find/${songString}`).pipe(map((val: Song) => {
      if (val) {
        return { song: val, pos, exists: true }
      }
      return { songString, pos, exists: false }
    }), catchError(() => of({ songString, pos, exists: false })))
  }

  public getSongs(sortBy: string, page: number, count: number): Observable<Song[]> {
    return this.httpClient.get<Song[]>(`${BASE_URL}/song/find?sortBy=${sortBy}&pageNumber=${page}&limit=${count}`);
  }

  public getSongCount(): Observable<number> {
    console.log('get song count')
    return this.httpClient.head(`${BASE_URL}/song/find`, {observe: 'response'})
      .pipe(
        // + operator converts string to number
        map((res) => +res.headers.get("X-Count"))
      );
  }

  public updateSong(id: string, newDetails: Song[]): Observable<unknown> {
    return this.httpClient.put(`${BASE_URL}/song/${id}`, newDetails).pipe(
      map((res => {})), catchError(error => {throw error})
    )
  }

  public searchSongs(title: string, artist: string, count: number): Observable<Song[]> {
    return this.httpClient.get<Song[]>(`${BASE_URL}/song/find?title=${title}&artist=${artist}&limit=${count}`)
  }

  public mergeSongs(fromId: string, toId: string) {
    const url = `${BASE_URL}/song/merge/${fromId}/${toId}`
    console.log('merge songs', url)
    return this.httpClient.delete(url)
  }
}
