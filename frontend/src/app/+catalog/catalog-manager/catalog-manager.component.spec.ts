import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogManagerComponent } from './catalog-manager.component';

describe('CatalogManagerComponent', () => {
  let component: CatalogManagerComponent;
  let fixture: ComponentFixture<CatalogManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CatalogManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
