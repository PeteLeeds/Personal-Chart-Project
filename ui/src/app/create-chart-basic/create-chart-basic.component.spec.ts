import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CreateBasicChartComponent } from './create-chart-basic.component';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MatNativeDateModule } from '@angular/material/core';

describe('CreateBasicChartComponent', () => {
  let component: CreateBasicChartComponent;
  let fixture: ComponentFixture<CreateBasicChartComponent>;

  const mockActivatedRoute = {
    parent: {
      params: of({ series: 'test' }),
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [RouterTestingModule, CreateBasicChartComponent, MatNativeDateModule],
    providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateBasicChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
