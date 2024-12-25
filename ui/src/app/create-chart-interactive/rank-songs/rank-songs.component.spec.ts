import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RankSongsComponent } from './rank-songs.component';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('RankSongsComponent', () => {
  let component: RankSongsComponent;
  let fixture: ComponentFixture<RankSongsComponent>;

  const mockActivatedRoute = {
    params: of({ session: 'test' }),
  };
  

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {provide: ActivatedRoute, useValue: mockActivatedRoute},
      ], 
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