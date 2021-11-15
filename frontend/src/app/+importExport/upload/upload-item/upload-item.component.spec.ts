import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadItemComponent } from './upload-item.component';

describe('UploadItemComponent', () => {
  let component: UploadItemComponent;
  let fixture: ComponentFixture<UploadItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
