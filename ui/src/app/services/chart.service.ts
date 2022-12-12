import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Chart, ChartParams } from '../types/chart';
import { Song } from '../types/song';
import { Series } from '../types/series';

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

  public getChartsInSeries(name: string, page: number): Observable<Series> {
    return this.httpClient.get<Series>(`${BASE_URL}/series/${name}?page=${page}`)
  }

  public createSeries(name: string): Observable<unknown> {
    return this.httpClient.post(`${BASE_URL}/series/`, {name}, {headers: new HttpHeaders({'Content-Type':  'application/json'})})
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

  public getChartSongs(seriesName: string, chartName: string): Observable<Song[]> {
    return this.httpClient.get<Song[]>(`${BASE_URL}/series/${seriesName}/chart/${chartName}`)
  }

  public getPreviousCharts(seriesName: string, chartName: string): Observable<Record<string, unknown>[]> {
    return this.httpClient.get<Record<string, unknown>[]>(`${BASE_URL}/series/${seriesName}/prev/${chartName}`)
  }

  public getNextChart(seriesName: string, chartName: string): Observable<string> {
    return this.httpClient.get<string>(`${BASE_URL}/series/${seriesName}/next/${chartName}`)
  }

  public getChartDate(seriesName: string, chartName: string): Observable<string> {
    return this.httpClient.get<string>(`${BASE_URL}/series/${seriesName}/date/${chartName}`)
  }

  public updateChart(seriesName: string, chartName: string, newChartData: Chart) {
    return this.httpClient.put<string>(`${BASE_URL}/series/${seriesName}/${chartName}`, newChartData)
  }
}
