import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FieldArrayType} from '@ngx-formly/core';
import {MatAutocomplete, MatAutocompleteTrigger} from '@angular/material/autocomplete';

@Component({
  selector: 'ige-repeat-list',
  templateUrl: './repeat-list.component.html',
  styleUrls: ['./repeat-list.component.scss']
})
export class RepeatListComponent extends FieldArrayType implements OnInit {

  @ViewChild('repeatListInput', {read: ElementRef}) autoCompleteEl: ElementRef;
  @ViewChild(MatAutocompleteTrigger) autoComplete: MatAutocompleteTrigger;

  selectionModel = null;

  ngOnInit(): void {
  }

  addToList(value: any) {

    this.add(null, value);

    // reset selectbox value and detect changes by using setTimeout
    setTimeout(() => this.selectionModel = null);

    if (!this.to.asSelect) {
      this.autoCompleteEl.nativeElement.blur();
      this.autoComplete.closePanel();
    }

  }
}
