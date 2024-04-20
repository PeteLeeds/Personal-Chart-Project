import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Artist } from "../types/artist";
import { getQueryString } from "../shared/get-query-string";

const BASE_URL = '/database'

@Injectable({
    providedIn: 'root'
})
export class ArtistService {
    public httpClient: HttpClient;

    public constructor(httpClient: HttpClient) {
        this.httpClient = httpClient;
    }

    public getArtistById(id: string, seriesName?: string): Observable<Artist> {
        console.log('get artist by id')
        return this.httpClient.get<Artist>
            (`${BASE_URL}/artist?id=${id}${seriesName ? `&seriesName=${seriesName}` : ''}`);
    }

    public getArtists(options: Record<string, string>): Observable<Artist[]> {
        return this.httpClient.get<Artist[]>(`${BASE_URL}/artist/find?${getQueryString(options)}`);
    }

    public getArtistCount(options: Record<string, string>): Observable<number> {
        console.log('get artist count')
        return this.httpClient.head(`${BASE_URL}/artist/count?${getQueryString(options)}`, {observe: 'response'})
          .pipe(
            // + operator converts string to number
            map((res) => +res.headers.get("X-Count"))
          );
      }

    public mergeArtists(fromId: string, toId: string): Observable<Artist[]> {
        return this.httpClient.delete<Artist[]>(`${BASE_URL}/artist/merge/${fromId}/${toId}`)
    }
}