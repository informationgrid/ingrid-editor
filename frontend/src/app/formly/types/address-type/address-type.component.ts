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
import { Component, HostBinding, OnInit, signal } from "@angular/core";
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
  resolvedAddresses = signal<ResolvedAddressWithType[]>([]);

  @HostBinding("class") hostClass = "";

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private documentService: DocumentService,
    private snack: MatSnackBar,
  ) {
    super();
  }

  ngOnInit(): void {
    if (this.props.required) this.hostClass = "required";

    this.formControl.valueChanges
      .pipe(
        untilDestroyed(this),
        filter((data) => data),
        distinctUntilChanged((a: AddressRef[], b: AddressRef[]) => {
          const result =
            a.length === b.length &&
            a.every(
              (aItem, index) =>
                aItem.ref === b[index]?.ref &&
                aItem.type?.key === b[index]?.type?.key,
            );
          return result;
        }),
        tap((data) => console.log("Value change", data)),
      )
      .subscribe((value) => {
        const resolved = this.resolvedAddresses();
        const addressRefs = value ?? [];
        // resolved.filter(item => addressRefs.s)
        this.resolvedAddresses.set(
          this.getPlaceholderAddresses(addressRefs.length),
        );
        addressRefs.forEach((address: AddressRef, index) => {
          const found =
            resolved[index]?.address?.metadata?.uuid === address.ref;
          if (found) {
            this.resolvedAddresses.update((values) => {
              values.splice(index, 1, {
                type: address.type,
                address: resolved[index].address,
              });
              return [...values];
            });
          } else {
            this.documentService
              .load(address.ref, true, false, true)
              .subscribe((data) => {
                this.resolvedAddresses.update((values) => {
                  values.splice(index, 1, {
                    type: address.type,
                    address: data,
                  });
                  return [...values];
                });
              });
          }
        });
      });
  }

  async addToAddresses(address: DocumentAbstract, type: BackendOption) {
    const newValue = [
      ...this.formControl.value,
      {
        type: type,
        ref: address._uuid,
      },
    ];
    this.removeDuplicates();
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
        this.formControl.value.splice(index, 1, {
          type: data.type,
          ref: data.address._uuid,
        });
        this.removeDuplicates();
        this.updateFormControl(this.formControl.value);
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
    const unique = this.formControl.value.filter(
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
    if (unique.length !== this.formControl.value.length) {
      this.snack.open("Die Adresse ist bereits vorhanden");
    }
    this.updateFormControl(unique);
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
    const value = this.formControl.value.filter((ref, idx) => idx !== index);
    this.updateFormControl(value);
  }

  private updateFormControl(value: AddressRef[]) {
    this.formControl.setValue([...value]);
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
    moveItemInArray(
      this.formControl.value,
      event.previousIndex,
      event.currentIndex,
    );
  }

  private getPlaceholderAddresses(length: number): ResolvedAddressWithType[] {
    const placeholder = [];
    for (let i = 0; i < length; i++) {
      placeholder.push({ type: null, address: null });
    }
    return placeholder;
  }
}
