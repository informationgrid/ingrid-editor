import {Component} from '@angular/core';
import {FieldArrayType} from '@ngx-formly/core';

@Component({
  selector: 'ige-repeat-chip',
  templateUrl: './repeat-chip.component.html',
  styleUrls: ['./repeat-chip.component.scss']
})
export class RepeatChipComponent extends FieldArrayType {

  constructor() {
    super();
  }

}
