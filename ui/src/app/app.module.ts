import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_FORMATS } from 'ng-pick-datetime';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { ClipboardModule } from 'ngx-clipboard';
 
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChartDisplayComponent } from './chart-display/chart-display.component';
import { SeriesSelectComponent } from './series-select/series-select.component';
import { ModalTemplateComponent } from './modals/modal-template/modal-template.component';
import { CreateSeriesComponent } from './modals/create-series/create-series.component';
import { DeleteSeriesComponent } from './modals/delete-series/delete-series.component';
import { NewSongsComponent } from './modals/new-songs/new-songs.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { ChartSelectComponent } from './chart-select/chart-select.component';
import { CreateChartComponent } from './create-chart/create-chart.component';
import { SongDisplayComponent } from './song-display/song-display.component';
import { SongComponent } from './song/song.component';
import { ArtistComponent } from './artist/artist.component';
import { ArtistDisplayComponent } from './artist-display/artist-display.component';
import { ArtistSelectorComponent } from './shared/artist-selector.commponent';
import { MarkDuplicateComponent } from './modals/mark-duplicate/mark-duplicate.component';
import { SearchComponent } from './shared/search/search.component'
import { ChartEditComponent } from './chart-edit/chart-edit.component';

@NgModule({
  declarations: [
    AppComponent,
    ChartDisplayComponent,
    ChartSelectComponent,
    SeriesSelectComponent,
    ModalTemplateComponent,
    CreateSeriesComponent,
    DeleteSeriesComponent,
    CreateChartComponent,
    NewSongsComponent,
    SongDisplayComponent,
    SongComponent,
    ArtistComponent,
    ArtistDisplayComponent,
    ArtistSelectorComponent,
    MarkDuplicateComponent,
    SearchComponent,
    ChartEditComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    OwlDateTimeModule, 
    OwlNativeDateTimeModule,
    BrowserAnimationsModule,
    FontAwesomeModule,
    MatSelectModule,
    MatFormFieldModule,
    ClipboardModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
