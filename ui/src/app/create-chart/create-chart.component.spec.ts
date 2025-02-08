import { Component } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CreateChartComponent } from './create-chart.component';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
    template: `Basic`,
    standalone: false
})
class TestBasicComponent {}

@Component({
    template: `Interactive`,
    standalone: false
})
class TestInteractiveComponent {}


export const routes: Routes = [
  { path: 'basic', component: TestBasicComponent },
  { path: 'interactive', component: TestInteractiveComponent },
];

describe('CreateChartComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [RouterTestingModule.withRoutes(routes), CreateChartComponent, MatNativeDateModule],
}).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(CreateChartComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'create-chart'`, () => {
    const fixture = TestBed.createComponent(CreateChartComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('create-chart');
  });

  it('should route correctly', fakeAsync(() => {
    const fixture = TestBed.createComponent(CreateChartComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const buttons = compiled.querySelectorAll('a')
    const pages = ['Basic', 'Interactive']

    buttons.forEach((button, index) => {
      button.click()
      tick(1)
      const component = fixture.nativeElement.querySelector('ng-component')
      expect(component.textContent).withContext(`route to ${pages[index]}`).toContain(pages[index])
    })
  }));
});
