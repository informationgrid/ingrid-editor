import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {DashboardComponent} from "./dashboard.component";
import {DebugElement} from "@angular/core";
import {By} from "@angular/platform-browser";
import {ChartistModule} from "ng-chartist";
import {RouterTestingModule} from "@angular/router/testing";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ConfigDataService} from "../services/config/config-data.service";
import {MatDialogModule} from "@angular/material";
import {DocumentDataService} from "../services/document/document-data.service";
import {RouteConfigLoadStart} from "@angular/router";
import {ConfigService} from "../services/config/config.service";
import {DocumentService} from "../services/document/document.service";
import {HttpClient} from "@angular/common/http";
import {ConfigMockService} from "../services/config/config-mock.service";
import {DocumentMockService} from "../services/document/document-mock.service";
import {CodelistService} from "../services/codelist/codelist.service";
import {CodelistMockService} from "../services/codelist/codelist-mock.service";
import {CodelistDataService} from "../services/codelist/codelist-data.service";


describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [ChartistModule, RouterTestingModule, HttpClientTestingModule, MatDialogModule],
      providers: [
        {provide: ConfigDataService, useClass: ConfigMockService},
        {provide: CodelistDataService, useClass: CodelistMockService},
        {provide: DocumentDataService, useClass: DocumentMockService}
      ]
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
    const recentDocs = dashboardDe.query(By.css('.recentDocs'));
    let recentDocsEl: HTMLElement = recentDocs.nativeElement;
    expect(recentDocsEl.textContent.trim()).toEqual('Letzte Dokumente');
  });
});
