import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArtistDisplayComponent } from './artist-display.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter } from '@angular/router';


describe('ArtistDisplayComponent', () => {
  let component: ArtistDisplayComponent;
  let fixture: ComponentFixture<ArtistDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ArtistDisplayComponent],
    providers: [
      provideHttpClient(withInterceptorsFromDi()), 
      provideHttpClientTesting(), 
      provideRouter([])
    ]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtistDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
