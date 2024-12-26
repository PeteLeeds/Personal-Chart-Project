import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateChartFinaliseComponent } from './create-chart-finalise.component';

describe('CreateChartFinaliseComponent', () => {
  let component: CreateChartFinaliseComponent;
  let fixture: ComponentFixture<CreateChartFinaliseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateChartFinaliseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateChartFinaliseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
