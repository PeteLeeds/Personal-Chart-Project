import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from "@angular/router/testing";
import { MarkDuplicateComponent } from './mark-duplicate.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


describe('MarkDuplicateComponent', () => {
  let component: MarkDuplicateComponent;
  let fixture: ComponentFixture<MarkDuplicateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [RouterTestingModule, MarkDuplicateComponent],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkDuplicateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
