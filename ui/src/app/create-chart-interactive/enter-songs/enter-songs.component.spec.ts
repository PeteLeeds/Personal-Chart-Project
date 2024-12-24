import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterSongsComponent } from './enter-songs.component';
import { HttpClientModule } from '@angular/common/http';


describe('EnterSongsComponent', () => {
  let component: EnterSongsComponent;
  let fixture: ComponentFixture<EnterSongsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({      
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
