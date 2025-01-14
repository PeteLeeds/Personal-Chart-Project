import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Chart, ChartParams, FullChart, PutSessionParams, Session } from '../types/chart';
import { FormattedSong } from '../types/song';
import { Series } from '../types/series';
import { getQueryString } from '../shared/get-query-string';
import { map } from 'rxjs/operators';

const BASE_URL = '/database'

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  public httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
   }

  public getSeries(): Observable<Series[]> {
    return this.httpClient.get<Series[]>(`${BASE_URL}/series/`)
  }

  public getChartsInSeries(seriesName: string, page: number, order: string): Observable<Series> {
    const queryParams = {page: page.toString(), order}
    return this.httpClient.get<Series>(`${BASE_URL}/series/${seriesName}?${getQueryString(queryParams)}`)
  }

  public createSeries(seriesName: string): Observable<unknown> {
    return this.httpClient.post(`${BASE_URL}/series/`, {name: seriesName}, {headers: new HttpHeaders({'Content-Type':  'application/json'})})
  }

  public initiateInteractiveChartCreation(seriesName: string, params: Record<string, string | Number | Boolean | Date>): Observable<{sessionId: string}> {
    return this.httpClient.post<{sessionId: string}>(`${BASE_URL}/series/${seriesName}/interactive`, params)
  }

  public deleteSeries(seriesName: string) {
    return this.httpClient.delete(`${BASE_URL}/series/${seriesName}`)
  }

  public deleteChart(seriesName: string, chartName: string) {
    return this.httpClient.delete(`${BASE_URL}/series/${seriesName}/${chartName}`)
  }

  public createChart(seriesName: string, params: ChartParams): Observable<unknown> {
    console.log('params passed', params)
    return this.httpClient.post(`${BASE_URL}/series/${seriesName}/chart`, {params})
  }

  public getChart(seriesName: string, chartName: string, chartSize?: number): Observable<FullChart> {
    const extraParam = chartSize ? `?size=${chartSize}` : ''
    return this.httpClient.get<FullChart>(`${BASE_URL}/series/${seriesName}/chart/${chartName}${extraParam}`)
  }

  public getPreviousCharts(seriesName: string, chartName: string): Observable<Record<string, unknown>[]> {
    return this.httpClient.get<Record<string, unknown>[]>(`${BASE_URL}/series/${seriesName}/prev/${chartName}`)
  }

  public getNextChart(seriesName: string, chartName: string): Observable<string> {
    return this.httpClient.get<string>(`${BASE_URL}/series/${seriesName}/next/${chartName}`)
  }

  public getChartString(seriesName: string, chartName: string): Observable<string> {
    return this.httpClient.get<Record<string, string>>(`${BASE_URL}/series/${seriesName}/string/${chartName}`).pipe(
      map((chartObject) => chartObject.chartString)
    )
  }

  public getRecentCharts(): Observable<Chart[]> {
    return this.httpClient.get<Chart[]>(`${BASE_URL}/series/recent`)
  }

  public getChartDate(seriesName: string, chartName: string): Observable<string> {
    return this.httpClient.get<string>(`${BASE_URL}/series/${seriesName}/date/${chartName}`)
  }

  public getInteractiveSession(sessionId: string): Observable<Session> {
    return this.httpClient.get<Session>(`${BASE_URL}/series/session/${sessionId}`)
  }

  public getChartPreview(sessionId: string): Observable<FullChart> {
    return this.httpClient.get<FullChart>(`${BASE_URL}/series/session/${sessionId}/preview`)
  }

  public updateChart(seriesName: string, chartName: string, newChartData: Chart) {
    return this.httpClient.put<string>(`${BASE_URL}/series/${seriesName}/${chartName}`, newChartData)
  }

  public updateSession(sessionId: string, sessionParams: PutSessionParams): Observable<string> {
    return this.httpClient.put<string>(`${BASE_URL}/series/session/${sessionId}`, sessionParams)
  }

  public completeSession(sessionId: string, newSongs: FormattedSong[]): Observable<{name: string}> {
    return this.httpClient.post<{name: string}>(`${BASE_URL}/series/session/${sessionId}/complete`, {newSongs})
  }
}
