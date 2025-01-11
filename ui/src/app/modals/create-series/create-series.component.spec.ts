import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { CreateSeriesComponent } from './create-series.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('CreateSeriesComponent', () => {
  let component: CreateSeriesComponent;
  let fixture: ComponentFixture<CreateSeriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [CreateSeriesComponent],
    imports: [],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSeriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
