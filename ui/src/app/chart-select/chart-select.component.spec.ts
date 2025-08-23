import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChartSelectComponent } from './chart-select.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter } from '@angular/router';


describe('ChartSelectComponent', () => {
  let component: ChartSelectComponent;
  let fixture: ComponentFixture<ChartSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ChartSelectComponent],
    providers: [
      provideHttpClient(withInterceptorsFromDi()), 
      provideHttpClientTesting(),
      provideRouter([])
    ]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

