import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {IgeDocument} from '../../../../models/ige-document';
import {ProfileService} from '../../../../services/profile.service';

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
  @Output() gotoAddress = new EventEmitter();

  content: {
    iconClass: string;
    role: string;
    title: string;
    secondTitle: string;
    emailOrPhone: string;
  }

  constructor(private profileService: ProfileService) {
  }

  ngOnInit(): void {
    this.content = {
      iconClass: this.profileService.getDocumentIcon(<IgeDocument>this.address.ref),
      role: this.address.type,
      title: this.getTitle(this.address.ref),
      secondTitle: this.getSecondTitle(this.address.ref),
      emailOrPhone: this.getEmailOrTelephone(this.address.ref)
    }
  }

  private getEmailOrTelephone(address: any) {
    // TODO: type is a string but should be number?
    const email = address.contact?.filter(item => item.type === '3');
    if (email && email.length > 0) {
      return email[0].connection;
    } else {
      const phone = address.contact?.filter(item => item.type === '1');
      return phone && phone.length > 0 ? phone[0].connection : '???';
    }
  }

  private getTitle(ref: any) {
    return ref.organization?.length > 0
      ? ref.organization
      : ref.firstName + ' ' + ref.lastName;
  }

  private getSecondTitle(ref: any) {
    return ref.organization?.length > 0
      ? ref.firstName + ' ' + ref.lastName
      : null;
  }
}
