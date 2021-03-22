import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCodelistComponent } from './update-codelist.component';

describe('UpdateCodelistComponent', () => {
  let component: UpdateCodelistComponent;
  let fixture: ComponentFixture<UpdateCodelistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateCodelistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateCodelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
