import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseFolderComponent } from './choose-folder.component';

describe('ChooseFolderComponent', () => {
  let component: ChooseFolderComponent;
  let fixture: ComponentFixture<ChooseFolderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChooseFolderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  xit('should create a folder below a different selected one', () => {
    // the breadcrumb must change accordingly!
  });
});
