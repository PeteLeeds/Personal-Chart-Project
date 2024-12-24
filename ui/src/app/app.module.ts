import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatMomentDateModule} from '@angular/material-moment-adapter'
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatRadioModule} from '@angular/material/radio';
import { ClipboardModule } from 'ngx-clipboard';
 
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChartDisplayComponent } from './chart-display/chart-display.component';
import { SeriesSelectComponent } from './series-select/series-select.component';
import { ModalTemplateComponent } from './modals/modal-template/modal-template.component';
import { CreateSeriesComponent } from './modals/create-series/create-series.component';
import { DeleteItemComponent } from './modals/delete-series/delete-item.component';
import { NewSongsComponent } from './modals/new-songs/new-songs.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { ChartSelectComponent } from './chart-select/chart-select.component';
import { CreateBasicChartComponent } from './create-chart-basic/create-chart-basic.component';
import { SongDisplayComponent } from './song-display/song-display.component';
import { SongComponent } from './song/song.component';
import { ArtistComponent } from './artist/artist.component';
import { ArtistDisplayComponent } from './artist-display/artist-display.component';
import { ArtistSelectorComponent } from './shared/artist-selector.commponent';
import { MarkDuplicateComponent } from './modals/mark-duplicate/mark-duplicate.component';
import { SearchComponent } from './shared/search/search.component'
import { ChartEditComponent } from './chart-edit/chart-edit.component';
import { TotalsComponent } from './totals/totals.component';
import { HomeComponent } from './home/home.component';
import { CreateChartComponent } from './create-chart/create-chart.component';
import { CreateInteractiveChartComponent } from './create-chart-interactive/create-chart-interactive.component';
import { EnterSongsComponent } from './create-chart-interactive/enter-songs/enter-songs.component';

@NgModule({
  declarations: [
    AppComponent,
    ChartDisplayComponent,
    ChartSelectComponent,
    SeriesSelectComponent,
    ModalTemplateComponent,
    CreateSeriesComponent,
    DeleteItemComponent,
    CreateChartComponent,
    CreateBasicChartComponent,
    NewSongsComponent,
    SongDisplayComponent,
    SongComponent,
    ArtistComponent,
    ArtistDisplayComponent,
    ArtistSelectorComponent,
    MarkDuplicateComponent,
    SearchComponent,
    ChartEditComponent,
    TotalsComponent,
    HomeComponent,
    CreateInteractiveChartComponent,
    EnterSongsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatMomentDateModule,
    BrowserAnimationsModule,
    FontAwesomeModule,
    MatSelectModule,
    MatFormFieldModule,
    ClipboardModule,
    MatProgressSpinnerModule,
    MatRadioModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
