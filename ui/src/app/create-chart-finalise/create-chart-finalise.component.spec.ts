import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateChartFinaliseComponent } from './create-chart-finalise.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('CreateChartFinaliseComponent', () => {
  let component: CreateChartFinaliseComponent;
  let fixture: ComponentFixture<CreateChartFinaliseComponent>;

  const mockActivatedRoute = {
    params: of({ session: 'test' }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CreateChartFinaliseComponent],
    providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        provideHttpClient(withInterceptorsFromDi()),
    ]
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
