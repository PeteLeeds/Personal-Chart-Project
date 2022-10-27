import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Artist } from "../types/artist";

const BASE_URL = '/database'

@Injectable({
    providedIn: 'root'
})
export class ArtistService {
    public httpClient: HttpClient;

    public constructor(httpClient: HttpClient) {
        this.httpClient = httpClient;
    }

    public getArtistById(id: string, seriesName?: string): Observable<Artist[]> {
        console.log('get artist by id')
        return this.httpClient.get<Artist[]>
            (`${BASE_URL}/artist?id=${id}${seriesName ? `&seriesName=${seriesName}` : ''}`);
    }

    public getArtists(page: number, sortBy: string, limit: number): Observable<Artist[]> {
        return this.httpClient.get<Artist[]>(`${BASE_URL}/artist/find?pageNumber=${page}&limit=${limit}&sortBy=${sortBy}`);
    }

    public getArtistCount(): Observable<number> {
        console.log('get artist count')
        // Page number here is superfluous - only used to prevent an error in the code
        // There may be a better way of doing this
        return this.httpClient.head(`${BASE_URL}/artist/count`, {observe: 'response'})
          .pipe(
            // + operator converts string to number
            map((res) => +res.headers.get("X-Count"))
          );
      }

    public searchArtists(nameString: string, count: number): Observable<Artist[]> {
        return this.httpClient.get<Artist[]>(`${BASE_URL}/artist/find?name=${nameString}&limit=${count}`)
    }

    public mergeArtists(fromId: string, toId: string): Observable<Artist[]> {
        return this.httpClient.delete<Artist[]>(`${BASE_URL}/artist/merge/${fromId}/${toId}`)
    }
}