import {ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'ige-header-title-row',
  templateUrl: './header-title-row.component.html',
  styleUrls: ['./header-title-row.component.scss']
})
export class HeaderTitleRowComponent implements OnInit {

  @Input() doc;

  @ViewChild('titleInput', {static: true}) titleInput: ElementRef;

  showTitleInput = false;

  constructor(private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
  }

  editTitle() {
    this.showTitleInput = !this.showTitleInput;
    this.cdRef.detectChanges();
    this.titleInput.nativeElement.focus();
  }
}
