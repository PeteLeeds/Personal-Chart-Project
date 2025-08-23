import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChartEditComponent } from './chart-edit.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MatNativeDateModule } from '@angular/material/core';
import { provideRouter } from '@angular/router';


describe('ChartEditComponent', () => {
  let component: ChartEditComponent;
  let fixture: ComponentFixture<ChartEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ChartEditComponent, MatNativeDateModule],
    providers: [
      provideHttpClient(withInterceptorsFromDi()), 
      provideHttpClientTesting(),
      provideRouter([])
    ]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
