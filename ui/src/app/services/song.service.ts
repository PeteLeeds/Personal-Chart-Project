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

  private getQueryString(params: Record<string, string>) {
    let queryString = ''
    Object.entries(params).forEach(([key, value]) => {
      console.log('keys', key, value)
      queryString += queryString.length !== 0 ? '&' : ''
      queryString += `${key}=${value}`
    });
    return queryString
  }

  public getSongById(songId: string, seriesName?: string): Observable<Song> {
    return this.httpClient.get<Song>(`${BASE_URL}/song?id=${songId}${seriesName ? `&seriesName=${seriesName}` : ''}`)
  }

  public checkIfSongExists(songString: string, pos: number): Observable<CheckedSong> {
    let httpSongString = songString
    const httpCodeReplacementArray = [['/', '%2F'], ['?', '%3F']]
    // Slashes don't just 'work' as the HTML interprets them as a different URL
    for (const codeReplacement of httpCodeReplacementArray) {
      while (httpSongString.includes(codeReplacement[0])) {
        let indexToReplace = httpSongString.indexOf(codeReplacement[0]);
        httpSongString = httpSongString.substring(0, indexToReplace) + codeReplacement[1] + httpSongString.substring(indexToReplace + 1)
      }
    }
    return this.httpClient.get<Song>(`${BASE_URL}/song/find/${httpSongString}`).pipe(map((val: Song) => {
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

  public getLeaderboard(options: Record<string, string>) {
    return this.httpClient.get<Song[]>(`${BASE_URL}/song/totals?${this.getQueryString(options)}`)
  }
}
