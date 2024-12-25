import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RankSongsComponent } from './rank-songs.component';

describe('RankSongsComponent', () => {
  let component: RankSongsComponent;
  let fixture: ComponentFixture<RankSongsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RankSongsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RankSongsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
