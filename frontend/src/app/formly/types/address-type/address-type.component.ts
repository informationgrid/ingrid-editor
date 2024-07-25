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
import { Component, inject, OnInit, signal } from "@angular/core";
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
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  tap,
} from "rxjs/operators";
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
import { DocumentWithMetadata } from "../../../models/ige-document";
import { ValidationErrors } from "@angular/forms";

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
  resolvedAddresses = signal<ResolvedAddressWithType[]>([]);

  private dialog = inject(MatDialog);
  private router = inject(Router);
  private documentService = inject(DocumentService);
  private snack = inject(MatSnackBar);

  ngOnInit(): void {
    this.formControl.valueChanges
      .pipe(
        untilDestroyed(this),
        debounceTime(0),
        filter((data) => data),
        distinctUntilChanged((a: AddressRef[], b: AddressRef[]) =>
          this.compareAddressRefs(a, b),
        ),
      )
      .subscribe((value) => this.prepareAddressCards(value));

    this.formControl.addValidators(this.allAddressesPublishedValidator());
  }

  async addToAddresses(address: DocumentAbstract, type: BackendOption) {
    const newValue = [
      ...this.formControl.value,
      {
        type: type,
        ref: address._uuid,
      },
    ];
    this.removeDuplicates(newValue);
    this.updateFormControl(newValue);
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
        const copy = this.formControl.value.slice(0);
        copy.splice(index, 1, {
          ref: data.address._uuid,
          type: data.type,
        });
        this.removeDuplicates(copy);
        this.updateFormControl(copy);
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

  removeAddress(index: number) {
    const value = this.formControl.value.filter(
      (_ref: AddressRef, idx: number) => idx !== index,
    );
    this.updateFormControl(value);
  }

  async gotoAddress(address: ResolvedAddressWithType) {
    await this.router.navigate([
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
    moveItemInArray(
      this.formControl.value,
      event.previousIndex,
      event.currentIndex,
    );
    // also update address in template
    this.resolvedAddresses.update((value) => {
      moveItemInArray(value, event.previousIndex, event.currentIndex);
      return value;
    });
  }

  private removeDuplicates(values: AddressRef[]) {
    const unique = values.filter(
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
    if (unique.length !== values.length) {
      this.snack.open("Die Adresse ist bereits vorhanden");
      this.updateFormControl(unique);
    }
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

  private updateFormControl(value: AddressRef[]) {
    this.formControl.setValue([...value]);
    this.formControl.markAsDirty();
  }

  private getPlaceholderAddresses(length: number): ResolvedAddressWithType[] {
    const placeholder = [];
    for (let i = 0; i < length; i++) {
      placeholder.push({ type: null, address: null });
    }
    return placeholder;
  }

  private compareAddressRefs(a: AddressRef[], b: AddressRef[]) {
    return (
      a.length === b.length &&
      a.every(
        (aItem, index) =>
          aItem.ref === b[index]?.ref &&
          aItem.type?.key === b[index]?.type?.key,
      )
    );
  }

  private updateResolvedAddresses(
    index: number,
    addressType: BackendOption,
    address: DocumentWithMetadata,
  ) {
    this.resolvedAddresses.update((values) => {
      values.splice(index, 1, {
        type: addressType,
        address: address,
      });
      return [...values];
    });
  }

  private prepareAddressCards(value: AddressRef[]) {
    const resolved = this.resolvedAddresses();
    const addressRefs = value ?? [];
    this.resolvedAddresses.set(
      this.getPlaceholderAddresses(addressRefs.length),
    );
    addressRefs.forEach((address: AddressRef, index) => {
      const found = resolved[index]?.address?.metadata?.uuid === address.ref;
      if (found) {
        this.updateResolvedAddresses(
          index,
          address.type,
          resolved[index].address,
        );
      } else {
        this.documentService
          .load(address.ref, true, false, true)
          .subscribe((data) => {
            this.updateResolvedAddresses(index, address.type, data);
          });
      }
    });
  }

  private allAddressesPublishedValidator() {
    return (): ValidationErrors | null => {
      const oneNotPublished = this.resolvedAddresses().some(
        (address) => address.address.metadata.state !== "P",
      );
      return oneNotPublished
        ? {
            addressesPublished: {
              message: "Alle Adressen müssen veröffentlicht sein",
            },
          }
        : null;
    };
  }
}
