import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {DashboardComponent} from "./dashboard.component";
import {DebugElement} from "@angular/core";
import {By} from "@angular/platform-browser";


describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show last recent documents', () => {
    let dashboardDe: DebugElement = fixture.debugElement;
    const recentDocs = dashboardDe.query(By.css('recentDocs'));
    let recentDocsEl: HTMLElement = recentDocs.nativeElement;
    expect(recentDocsEl.textContent).toEqual('Letzte Dokumente');
  });
});
