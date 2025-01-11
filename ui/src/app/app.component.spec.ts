import { Component } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

@Component({
    template: `Home`,
    standalone: false
})
class TestHomeComponent {}

@Component({
    template: `Series`,
    standalone: false
})
class TestSeriesSelectComponent {}

@Component({
    template: `Song`,
    standalone: false
})
class TestSongComponent {}

@Component({
    template: `Artist`,
    standalone: false
})
class TestArtistComponent {}

@Component({
    template: `Totals`,
    standalone: false
})
class TestTotalsComponent {}

export const routes: Routes = [
  { path: '', component: TestHomeComponent },
  { path: 'series', component: TestSeriesSelectComponent },
  { path: 'song', component: TestSongComponent },
  { path: 'artist', component: TestArtistComponent },
  { path: 'totals', component: TestTotalsComponent }
];

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [
        AppComponent,
        TestSeriesSelectComponent,
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'personal-chart-project'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('personal-chart-project');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Chart Site');
  });

  it('should route correctly', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const buttons = compiled.querySelectorAll('a')
    const pages = ['Home', 'Series', 'Song', 'Artist', 'Totals']

    buttons.forEach((button, index) => {
      button.click()
      tick(1)
      const component = fixture.nativeElement.querySelector('ng-component')
      expect(component.textContent).withContext(`route to ${pages[index]}`).toContain(pages[index])
    })
  }));
});
