import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ArtistDisplayComponent } from './artist-display/artist-display.component';
import { ArtistComponent } from './artist/artist.component';
import { ChartDisplayComponent } from './chart-display/chart-display.component';
import { ChartEditComponent } from './chart-edit/chart-edit.component';
import { ChartSelectComponent } from './chart-select/chart-select.component';
import { CreateBasicChartComponent } from './create-chart-basic/create-chart-basic.component';
import { SeriesSelectComponent } from './series-select/series-select.component';
import { SongDisplayComponent } from './song-display/song-display.component';
import { SongComponent } from './song/song.component';
import { TotalsComponent } from './totals/totals.component';
import { HomeComponent } from './home/home.component';
import { CreateChartComponent } from './create-chart/create-chart.component';
import { EnterSongsComponent } from './create-chart-interactive/enter-songs/enter-songs.component';
import { RankSongsComponent } from './create-chart-interactive/rank-songs/rank-songs.component';

const routes: Routes = [
  // Can't have 'children' unless we want the parent displayed also!
  { path: '', component: HomeComponent },
  { path: 'series', component: SeriesSelectComponent },
  { path: 'series/:series/chart', component: ChartSelectComponent },
  { path: 'series/:series/chart/new',
     component: CreateChartComponent,
     children: [{
      path: 'basic',
      component: CreateBasicChartComponent,
     },
     {
      path: 'interactive',
      component: EnterSongsComponent
     },
     {
      path: 'interactive/:session/rank',
      component: RankSongsComponent
     }
    ]
  },
  { path: 'series/:series/chart/:name', component: ChartDisplayComponent },
  { path: 'series/:series/chart/:name/edit', component: ChartEditComponent },
  { path: 'song', component: SongComponent },
  { path: 'song/:id', component: SongDisplayComponent },
  { path: 'artist', component: ArtistComponent },
  { path: 'artist/:id', component: ArtistDisplayComponent },
  { path: 'totals', component: TotalsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
