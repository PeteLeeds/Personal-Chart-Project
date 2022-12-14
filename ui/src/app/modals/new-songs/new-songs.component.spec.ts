import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from "@angular/router/testing";
import { NewSongsComponent } from './new-songs.component';


describe('NewSongsComponent', () => {
  let component: NewSongsComponent;
  let fixture: ComponentFixture<NewSongsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewSongsComponent ],
      imports: [ HttpClientTestingModule, RouterTestingModule ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewSongsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
