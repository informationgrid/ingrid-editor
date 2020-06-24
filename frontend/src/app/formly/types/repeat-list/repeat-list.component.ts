import { Component, OnInit } from '@angular/core';
import {FieldArrayType} from '@ngx-formly/core';

@Component({
  selector: 'ige-repeat-list',
  templateUrl: './repeat-list.component.html',
  styleUrls: ['./repeat-list.component.scss']
})
export class RepeatListComponent extends FieldArrayType implements OnInit {

  selectionModel = null;

  ngOnInit(): void {
  }

  addToList(value: any) {
    this.add(null, value);

    // reset selectbox value and detect changes by using setTimeout
    setTimeout(() => this.selectionModel = null);
  }
}
