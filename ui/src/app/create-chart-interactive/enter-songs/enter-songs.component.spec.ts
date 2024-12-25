import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterSongsComponent } from './enter-songs.component';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';


describe('EnterSongsComponent', () => {
  let component: EnterSongsComponent;
  let fixture: ComponentFixture<EnterSongsComponent>;

  const mockActivatedRoute = {
    parent: {
      params: of({ series: 'test' }),
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({     
      providers: [
        {provide: ActivatedRoute, useValue: mockActivatedRoute},
      ], 
      imports: [HttpClientModule],
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
