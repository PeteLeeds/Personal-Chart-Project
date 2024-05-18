import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, RouterLink, Routes, UrlSegment } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of } from 'rxjs';
import { ChartService } from '../services/chart.service';

import { ChartDisplayComponent } from './chart-display.component';

describe('ChartDisplayComponent', () => {
  let component: ChartDisplayComponent;
  let fixture: ComponentFixture<ChartDisplayComponent>;
  let mockChartService: ChartService;
  let router: Router;

  class ActivatedRouterMock {
    public params = of({series: 'Test Series', name: 'Test Chart'});
    public url = new BehaviorSubject([
      new UrlSegment('series', {}), 
      new UrlSegment('Test Series', {}),
      new UrlSegment('chart', {}),
      new UrlSegment('Test Chart', {}),
    ])
    public snapshot = new ActivatedRouteSnapshot();
  }

  @Component({})
  class TestSongComponent {}

  const routes: Routes = [
    { path: 'song/:id', component: TestSongComponent },
  ];

  beforeEach(async () => {
    mockChartService = jasmine.createSpyObj<ChartService>(
      'ChartService',
      {
        getChart: of({
            songs: [
              {
                _id: '0', title: 'Song 1', artistDisplay: 'Artist 1',
                charts: { 'Test Series': [{ 'chart': 'Test Chart', 'position': 1 }] }
              },
              {
                _id: '1', title: 'Song 2', artistDisplay: 'Artist 2',
                charts: { 'Test Series': [{ 'chart': 'Test Chart', 'position': 2 }] }
              },
              {
                _id: '2', title: 'Song 3', artistDisplay: 'Artist 3',
                charts: { 'Test Series': [{ 'chart': 'Test Chart', 'position': 3 }] }
              }
            ],
            lastChart: 'Test Previous Chart',
            nextChart: 'Test Next Chart'
        }),
      }
    );

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes(routes)],
      declarations: [ChartDisplayComponent],
      providers: [
        {provide: ChartService, useValue: mockChartService},
        {provide: ActivatedRoute, useValue: new ActivatedRouterMock()},
      ]})
      .compileComponents();
      router = TestBed.inject(Router);
      fixture = TestBed.createComponent(ChartDisplayComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display songs in correct order', () => {
    console.log('TITLES elem', fixture.nativeElement)
    const songTitles = fixture.nativeElement.querySelectorAll('table a')
    songTitles.forEach((item, index) => expect(item.textContent).toContain(`Song ${index + 1}`))
  });

  it('should route to correct song page on click', fakeAsync(() => {
    const navigateSpy = spyOn(router, 'navigateByUrl');
    const link = fixture.nativeElement.querySelector('table a')
    link.click()
    tick(1)
    const calledUrl = navigateSpy.calls.first().args[0].toString()
    expect(calledUrl).toContain('/song/0');
  }))
});
