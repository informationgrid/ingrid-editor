import {ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'ige-header-title-row',
  templateUrl: './header-title-row.component.html',
  styleUrls: ['./header-title-row.component.scss']
})
export class HeaderTitleRowComponent implements OnInit {

  @Input() form: FormGroup;

  @Output() toggleMore = new EventEmitter();

  @ViewChild('titleInput', {static: true}) titleInput: ElementRef;

  showTitleInput = false;
  showMore = false;

  constructor(private cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
  }

  editTitle() {
    this.showTitleInput = !this.showTitleInput;
    this.cdRef.detectChanges();
    this.titleInput.nativeElement.focus();
  }

  toggleMoreInfo() {
    this.showMore = !this.showMore;
    this.toggleMore.next(this.showMore);
  }
}
