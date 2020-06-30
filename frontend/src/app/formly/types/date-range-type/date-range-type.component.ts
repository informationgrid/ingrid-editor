import { Component, OnInit } from '@angular/core';
import {FieldType} from '@ngx-formly/material';

@Component({
  selector: 'ige-date-range-type',
  templateUrl: './date-range-type.component.html',
  styleUrls: ['./date-range-type.component.scss']
})
export class DateRangeTypeComponent extends FieldType implements OnInit {

  ngOnInit(): void {
  }

}
