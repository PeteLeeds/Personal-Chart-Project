import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router, Routes } from '@angular/router';
import { RouterTestingModule } from "@angular/router/testing";
import { of } from 'rxjs';
import { ChartService } from '../services/chart.service';

import { SeriesSelectComponent } from './series-select.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CreateSeriesComponent } from '../modals/create-series/create-series.component';

@Component({
    standalone: false
})
class TestChartDisplayComponent {}

const routes: Routes = [
  { path: 'series/:id/chart', component: TestChartDisplayComponent },
];

describe('SeriesSelectComponent', () => {
  let component: SeriesSelectComponent;
  let fixture: ComponentFixture<SeriesSelectComponent>;
  let mockChartService: ChartService;
  let router: Router;

  beforeEach(async () => {
    mockChartService = jasmine.createSpyObj<ChartService>(
      'ChartService',
      {
        getSeries: of([{id: '0', name: 'Test Series', charts: []}])
      }
    );

    @Component({ selector: 'create-series-modal', standalone: true })
    class MockCreateSeriesComponent {
      public open = () => {return 'Test Series'}
    }
    
    await TestBed.configureTestingModule({
    imports: [RouterTestingModule.withRoutes(routes), SeriesSelectComponent, MockCreateSeriesComponent],
    providers: [{ provide: ChartService, useValue: mockChartService }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    }).overrideComponent(SeriesSelectComponent, {
      remove: { imports: [ CreateSeriesComponent ] },
      add: { imports: [ MockCreateSeriesComponent ] }
    })

    .compileComponents();
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(SeriesSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain charts passed in', () => {
    const link = fixture.nativeElement.querySelector('div.select-option')
    expect(link.textContent).toContain('Test Series');
  });

  it('should route to chart component correctly', fakeAsync(() => {
    const navigateSpy = spyOn(router, 'navigateByUrl');
    const link = fixture.nativeElement.querySelector('div.select-option')
    link.click()
    tick(1)
    const calledUrl = navigateSpy.calls.first().args[0].toString()
    expect(calledUrl).toContain('/Test%20Series/chart');
  }));

  it('should create series using modal', fakeAsync(() => {
    const navigateSpy = spyOn(router, 'navigateByUrl');
    const link = fixture.nativeElement.querySelector('div.button')
    link.click()
    tick(1)
    console.log('CALLS', navigateSpy.calls.all())
    const calledUrl = navigateSpy.calls.first().args[0].toString()
    expect(calledUrl).toContain('/Test%20Series/chart');
  }));
});
