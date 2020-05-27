import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
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

  constructor() {
  }

  ngOnInit(): void {
  }

}
