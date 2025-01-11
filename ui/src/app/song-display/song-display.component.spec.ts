import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SongDisplayComponent } from './song-display.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SongDisplayComponent', () => {
  let component: SongDisplayComponent;
  let fixture: ComponentFixture<SongDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [SongDisplayComponent],
    imports: [RouterTestingModule],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SongDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
