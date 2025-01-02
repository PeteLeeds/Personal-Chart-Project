import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RankSongsComponent } from './rank-songs.component';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

const MOCK_ACTIVATED_ROUTE = {
  params: of({ session: 'test' }),
};

describe('RankSongsComponent', () => {
  let component: RankSongsComponent;
  let fixture: ComponentFixture<RankSongsComponent>;
  

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {provide: ActivatedRoute, useValue: MOCK_ACTIVATED_ROUTE},
      ], 
      imports: [HttpClientModule],
      declarations: [ RankSongsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RankSongsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
