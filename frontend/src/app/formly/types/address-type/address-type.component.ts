/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { Component, effect, OnInit, signal } from "@angular/core";
import { FieldType } from "@ngx-formly/material";
import {
  AddressRef,
  ResolvedAddressWithType,
} from "./address-card/address-card.component";
import { MatDialog } from "@angular/material/dialog";
import {
  ChooseAddressDialogComponent,
  ChooseAddressDialogData,
  ChooseAddressResponse,
} from "./choose-address-dialog/choose-address-dialog.component";
import { distinctUntilKeyChanged, filter, map, tap } from "rxjs/operators";
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
import { firstValueFrom } from "rxjs";
import { DocumentAbstract } from "../../../store/document/document.model";
import { BackendOption } from "../../../store/codelist/codelist.model";

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
  addresses = signal<AddressRef[]>([]);
  resolvedAddresses = signal<ResolvedAddressWithType[]>([]);

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private documentService: DocumentService,
    private snack: MatSnackBar,
  ) {
    super();
    effect(
      () => {
        this.resolvedAddresses.set([]);
        this.addresses().forEach((address) => {
          this.documentService
            .load(address.ref, true, false, true)
            .subscribe((data) =>
              this.resolvedAddresses.update((values) => [
                ...values,
                { type: address.type, address: data },
              ]),
            );
        });
      },
      { allowSignalWrites: true },
    );
  }

  ngOnInit(): void {
    this.addresses.set(this.formControl.value || []);

    this.formControl.valueChanges
      .pipe(
        untilDestroyed(this),
        distinctUntilKeyChanged("ref"),
        tap((data) => console.log("Value change", data)),
      )
      .subscribe((value) => this.addresses.set(value || []));
  }

  async addToAddresses(address: DocumentAbstract, type: BackendOption) {
    // this.getAddressFromBackend(address.id as string).subscribe((address) => {
    this.addresses.update((values) => [
      ...values,
      {
        type: type,
        ref: address._uuid,
      },
    ]);
    this.removeDuplicates();
    this.updateFormControl(this.addresses());
    // });
  }

  async addAddress() {
    (await this.callEditDialog()).subscribe((data: ChooseAddressResponse) => {
      if (!data) return;
      this.addToAddresses(data.address, data.type);
    });
  }

  async editAddress(addressRef: ResolvedAddressWithType, index: number) {
    (await this.callEditDialog(addressRef)).subscribe(
      (data: ChooseAddressResponse) => {
        if (!data) return;
        // this.getAddressFromBackend(data.address.id as string).subscribe(
        //   (address) => {
        this.addresses.update((values) =>
          values.splice(index, 1, {
            type: data.type,
            ref: data.address._uuid,
          }),
        );
        this.removeDuplicates();
        this.updateFormControl(this.addresses());
        // },
        // );
      },
    );
  }

  async copyAddress(addressRef: ResolvedAddressWithType) {
    (await this.callEditDialog(addressRef, true)).subscribe(
      (data: ChooseAddressResponse) => {
        if (!data) return;
        this.addToAddresses(data.address, data.type);
      },
    );
  }

  private removeDuplicates() {
    const unique = this.addresses().filter(
      (value, index, self) =>
        index ===
        self.findIndex((item) => {
          const sameType =
            item.type.key === value.type.key ||
            (item.type.key === null && item.type.value === value.type.value);
          const sameUuid = item.ref === value.ref;
          return sameType && sameUuid;
        }),
    );
    if (unique.length !== this.addresses().length) {
      this.snack.open("Die Adresse ist bereits vorhanden");
    }
    this.addresses.set(unique);
  }

  private async callEditDialog(
    address?: ResolvedAddressWithType,
    skipToType: boolean = false,
  ) {
    const foundAddresses = (
      await firstValueFrom(
        this.documentService.findInTitleOrUuid("", 1, true, true),
      )
    ).totalHits;

    if (foundAddresses) {
      return this.dialog
        .open(ChooseAddressDialogComponent, {
          minWidth: 500,
          data: <ChooseAddressDialogData>{
            address: address,
            allowedTypes: this.props.allowedTypes,
            skipToType: skipToType,
          },
          hasBackdrop: true,
          ariaLabel: "Adresse hinzufügen",
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
            this.router.navigate([`${ConfigService.catalogId}/address`]),
          ),
          // no address to return
          map((_) => undefined),
        );
    }
  }

  removeAddress(address: ResolvedAddressWithType, index: number) {
    const value = this.addresses().filter((ref, idx) => idx !== index);
    this.updateFormControl(value);
  }

  private updateFormControl(value: AddressRef[]) {
    this.formControl.setValue(value);
    this.formControl.markAsDirty();
  }

  gotoAddress(address: ResolvedAddressWithType) {
    this.router.navigate([
      `${ConfigService.catalogId}/address`,
      { id: address.address.metadata.uuid },
    ]);
  }

  // TODO: let ige-form-error handle all error messages
  getFirstError() {
    return Object.values(this.formControl.errors).map(
      (error) => error.message,
    )[0];
  }

  drop(event: CdkDragDrop<FormlyFieldConfig>) {
    moveItemInArray(this.addresses(), event.previousIndex, event.currentIndex);
  }
}
