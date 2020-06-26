import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {IgeDocument} from '../../../../models/ige-document';

export interface AddressRef {
  type: string;
  ref: Partial<IgeDocument>;
}

@Component({
  selector: 'ige-address-card',
  templateUrl: './address-card.component.html',
  styleUrls: ['./address-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressCardComponent implements OnInit {

  @Input() address: AddressRef;
  @Output() remove = new EventEmitter();
  @Output() edit = new EventEmitter();
  cardClass = 'no-box-shadow';

  constructor() {
  }

  ngOnInit(): void {
  }

}
