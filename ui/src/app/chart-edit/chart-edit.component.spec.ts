import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from "@angular/router/testing";
import { ChartEditComponent } from './chart-edit.component';


describe('ChartEditComponent', () => {
  let component: ChartEditComponent;
  let fixture: ComponentFixture<ChartEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChartEditComponent ],
      imports: [ HttpClientTestingModule, RouterTestingModule ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
