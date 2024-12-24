import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateInteractiveChartComponent } from './create-chart-interactive.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('CreateInteractiveChartComponent', () => {
  let component: CreateInteractiveChartComponent;
  let fixture: ComponentFixture<CreateInteractiveChartComponent>;

  const mockActivatedRoute = {
    parent: {
      params: of({ series: 'test' }),
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {provide: ActivatedRoute, useValue: mockActivatedRoute},
      ],
      declarations: [ CreateInteractiveChartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateInteractiveChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
