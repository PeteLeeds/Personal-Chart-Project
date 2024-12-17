import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterSongsComponent } from './enter-songs.component';

describe('EnterSongsComponent', () => {
  let component: EnterSongsComponent;
  let fixture: ComponentFixture<EnterSongsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnterSongsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnterSongsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
