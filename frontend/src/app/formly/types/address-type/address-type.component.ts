import {Component, OnInit} from '@angular/core';
import {FieldType} from '@ngx-formly/material';
import {AddressRef} from './address-card/address-card.component';
import {MatDialog} from '@angular/material/dialog';
import {ChooseAddressDialogComponent, ChooseAddressResponse} from './choose-address-dialog/choose-address-dialog.component';
import {distinctUntilChanged, filter} from 'rxjs/operators';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {Router} from '@angular/router';
import {DocumentService} from '../../../services/document/document.service';

@UntilDestroy()
@Component({
  selector: 'ige-address-type',
  templateUrl: './address-type.component.html',
  styleUrls: ['./address-type.component.scss']
})
export class AddressTypeComponent extends FieldType implements OnInit {

  addresses: AddressRef[] = [];

  constructor(private dialog: MatDialog, private router: Router,
              private documentService: DocumentService) {
    super();
  }

  ngOnInit(): void {

    this.addresses = this.formControl.value || [];

    this.formControl.valueChanges
      .pipe(
        untilDestroyed(this),
        distinctUntilChanged()
      )
      .subscribe(value => this.addresses = value || []);

  }

  addAddress() {

    this.callEditDialog()
      .subscribe((data: ChooseAddressResponse) => {
        this.getAddressFromBackend(data.address.id as string)
          .subscribe(address => {
            this.addresses.push({
              type: data.type,
              ref: address
            });
            this.updateFormControl(this.addresses);
          });
      });

  }

  editAddress(addressRef: AddressRef, index: number) {
    this.callEditDialog(addressRef)
      .subscribe((data: ChooseAddressResponse) => {
        this.getAddressFromBackend(data.address.id as string)
          .subscribe(address => {
            this.addresses.splice(index, 1, {
              type: data.type,
              ref: address
            });
            this.updateFormControl(this.addresses);
          })
      });
  }

  private callEditDialog(address?: AddressRef) {
    return this.dialog.open(ChooseAddressDialogComponent, {
      minWidth: 500,
      data: address
    })
      .afterClosed()
      .pipe(filter(data => data));
  }

  convertDataForBackend(response: ChooseAddressResponse): AddressRef {
    return {
      type: response.type,
      ref: {
        _id: response.address.id + '',
        title: response.address.title
      }
    }
  }

  removeAddress(address: AddressRef) {
    const value = this.addresses.filter(ref => ref !== address);
    this.updateFormControl(value);
  }

  private updateFormControl(value: AddressRef[]) {
    this.formControl.setValue(value);
    this.formControl.markAsDirty();
  }

  gotoAddress(address: AddressRef) {
    this.router.navigate(['/address', {id: address.ref._id}]);
  }

  private getAddressFromBackend(id: string) {

    return this.documentService.load(id, true);

  }
}
