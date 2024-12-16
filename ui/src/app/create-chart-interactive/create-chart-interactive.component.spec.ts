import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateInteractiveChartComponent } from './create-chart-interactive.component';

describe('CreateInteractiveChartComponent', () => {
  let component: CreateInteractiveChartComponent;
  let fixture: ComponentFixture<CreateInteractiveChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
