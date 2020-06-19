import { Component, OnInit } from '@angular/core';
import {FieldArrayType} from '@ngx-formly/core';

@Component({
  selector: 'ige-repeat-list',
  templateUrl: './repeat-list.component.html',
  styleUrls: ['./repeat-list.component.scss']
})
export class RepeatListComponent extends FieldArrayType implements OnInit {

  ngOnInit(): void {
  }

}
