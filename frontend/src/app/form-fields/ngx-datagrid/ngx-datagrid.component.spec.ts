import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxDatagridComponent } from './ngx-datagrid.component';

describe('NgxDatagridComponent', () => {
  let component: NgxDatagridComponent;
  let fixture: ComponentFixture<NgxDatagridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgxDatagridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxDatagridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
