import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ArtistDisplayComponent } from './artist-display/artist-display.component';
import { ArtistComponent } from './artist/artist.component';
import { ChartDisplayComponent } from './chart-display/chart-display.component';
import { ChartSelectComponent } from './chart-select/chart-select.component';
import { CreateChartComponent } from './create-chart/create-chart.component';
import { SeriesSelectComponent } from './series-select/series-select.component';
import { SongDisplayComponent } from './song-display/song-display.component';
import { SongComponent } from './song/song.component';

const routes: Routes = [
  // Can't have 'children' unless we want the parent displayed also!
  { path: 'series', component: SeriesSelectComponent },
  { path: 'series/:series/chart', component: ChartSelectComponent },
  { path: 'series/:series/chart/new', component: CreateChartComponent },
  { path: 'series/:series/chart/:name', component: ChartDisplayComponent },
  { path: 'song', component: SongComponent },
  { path: 'song/:id', component: SongDisplayComponent },
  { path: 'artist', component: ArtistComponent },
  { path: 'artist/:id', component: ArtistDisplayComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
