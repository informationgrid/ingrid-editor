import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFormWizardsComponent } from './list-form-wizards.component';

describe('ListFormWizardsComponent', () => {
  let component: ListFormWizardsComponent;
  let fixture: ComponentFixture<ListFormWizardsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListFormWizardsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListFormWizardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
