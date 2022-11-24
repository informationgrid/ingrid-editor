import { Component, OnInit } from "@angular/core";
import { FieldType } from "@ngx-formly/material";
import { AddressRef } from "./address-card/address-card.component";
import { MatDialog } from "@angular/material/dialog";
import {
  ChooseAddressDialogComponent,
  ChooseAddressDialogData,
  ChooseAddressResponse,
} from "./choose-address-dialog/choose-address-dialog.component";
import { distinctUntilChanged, filter, map, tap } from "rxjs/operators";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { Router } from "@angular/router";
import { DocumentService } from "../../../services/document/document.service";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { FieldTypeConfig, FormlyFieldConfig } from "@ngx-formly/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../dialogs/confirm/confirm-dialog.component";
import { ConfigService } from "../../../services/config/config.service";

@UntilDestroy()
@Component({
  selector: "ige-address-type",
  templateUrl: "./address-type.component.html",
  styleUrls: ["./address-type.component.scss"],
})
export class AddressTypeComponent
  extends FieldType<FieldTypeConfig>
  implements OnInit
{
  addresses: AddressRef[] = [];

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private documentService: DocumentService,
    private snack: MatSnackBar
  ) {
    super();
  }

  ngOnInit(): void {
    this.addresses = this.formControl.value || [];

    this.formControl.valueChanges
      .pipe(untilDestroyed(this), distinctUntilChanged())
      .subscribe((value) => (this.addresses = value || []));
  }

  async addAddress() {
    (await this.callEditDialog()).subscribe((data: ChooseAddressResponse) => {
      if (!data) return;
      this.getAddressFromBackend(data.address.id as string).subscribe(
        (address) => {
          this.addresses.push({
            type: data.type,
            ref: address,
          });
          this.removeDuplicates();
          this.updateFormControl(this.addresses);
        }
      );
    });
  }

  async editAddress(addressRef: AddressRef, index: number) {
    (await this.callEditDialog(addressRef)).subscribe(
      (data: ChooseAddressResponse) => {
        if (!data) return;
        this.getAddressFromBackend(data.address.id as string).subscribe(
          (address) => {
            this.addresses.splice(index, 1, {
              type: data.type,
              ref: address,
            });
            this.removeDuplicates();
            this.updateFormControl(this.addresses);
          }
        );
      }
    );
  }

  private removeDuplicates() {
    const unique = this.addresses.filter(
      (value, index, self) =>
        index ===
        self.findIndex((item) => {
          const sameType =
            item.type.key === value.type.key ||
            item.type.value === value.type.value;
          const sameUuid = item.ref._uuid === value.ref._uuid;
          return sameType && sameUuid;
        })
    );
    if (unique.length !== this.addresses.length) {
      this.snack.open("Die Adresse ist bereits vorhanden");
    }
    this.addresses = unique;
  }

  private async callEditDialog(address?: AddressRef) {
    const foundAddresses = (
      await this.documentService.find("", 1, true, true).toPromise()
    ).totalHits;

    if (foundAddresses) {
      return this.dialog
        .open(ChooseAddressDialogComponent, {
          minWidth: 500,
          data: <ChooseAddressDialogData>{
            address: address,
            allowedTypes: this.to.allowedTypes,
          },
          hasBackdrop: true,
        })
        .afterClosed()
        .pipe(filter((data) => data));
    } else {
      return this.dialog
        .open(ConfirmDialogComponent, {
          hasBackdrop: true,
          data: <ConfirmDialogData>{
            message:
              "Es sind noch keine Adressen vorhanden. Bitte legen Sie eine neue an.",
            title: "Keine Adressen gefunden",
            buttons: [
              { text: "Abbrechen" },
              {
                text: "Zum Addressbereich",
                // text: "Ok",
                alignRight: true,
                id: "confirm",
                emphasize: true,
              },
            ],
          },
        })
        .afterClosed()
        .pipe(
          filter((response) => response === "confirm"),
          tap((_) =>
            this.router.navigate([`${ConfigService.catalogId}/address`])
          ),
          // no address to return
          map((_) => undefined)
        );
    }
  }

  removeAddress(address: AddressRef) {
    const value = this.addresses.filter((ref) => ref !== address);
    this.updateFormControl(value);
  }

  private updateFormControl(value: AddressRef[]) {
    this.formControl.setValue(value);
    this.formControl.markAsDirty();
  }

  gotoAddress(address: AddressRef) {
    this.router.navigate([
      `${ConfigService.catalogId}/address`,
      { id: address.ref._uuid },
    ]);
  }

  private getAddressFromBackend(id: string) {
    return this.documentService.load(id, true, false);
  }

  // TODO: let ige-form-error handle all error messages
  getFirstError() {
    return Object.values(this.formControl.errors).map(
      (error) => error.message
    )[0];
  }

  drop(event: CdkDragDrop<FormlyFieldConfig>) {
    moveItemInArray(this.addresses, event.previousIndex, event.currentIndex);
  }
}
