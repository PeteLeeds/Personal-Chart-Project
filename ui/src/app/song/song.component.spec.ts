import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SongComponent } from './song.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SongComponent', () => {
  let component: SongComponent;
  let fixture: ComponentFixture<SongComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [SongComponent],
    imports: [],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SongComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
