/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import { Component, inject, Inject, signal } from "@angular/core";
import { DocumentService } from "../../../../../services/document/document.service";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from "@angular/material/dialog";
import { filter, map, switchMap } from "rxjs/operators";
import { TreeNode } from "../../../../../store/tree/tree-node.model";
import { Observable } from "rxjs";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../../../dialogs/confirm/confirm-dialog.component";
import { TranslocoDirective } from "@jsverse/transloco";
import { CdkDrag, CdkDragHandle } from "@angular/cdk/drag-drop";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatTab, MatTabGroup } from "@angular/material/tabs";
import { TreeComponent } from "../../../../../+form/sidebars/tree/tree.component";
import { AddressTreeStore } from "../../../../../store/address-tree/address-tree.store";
import { DeleteReferenceHandlerService } from "../delete-reference-handler.service";
import { DocumentAbstract } from "../../../../../store/document/document.model";

export interface ReplaceAddressDialogData {
  source: DocumentAbstract;
  showInfo: boolean;
}

@Component({
  selector: "ige-replace-address-dialog",
  templateUrl: "./replace-address-dialog.component.html",
  styleUrls: ["./replace-address-dialog.component.scss"],
  imports: [
    TranslocoDirective,
    CdkDrag,
    CdkDragHandle,
    MatIconButton,
    MatDialogClose,
    MatIcon,
    MatDialogTitle,
    MatDialogContent,
    MatTabGroup,
    MatTab,
    TreeComponent,
    MatDialogActions,
    MatButton,
  ],
})
export class ReplaceAddressDialogComponent {
  addressTreeStore = inject(AddressTreeStore);
  private documentService = inject(DocumentService);
  private deleteReferenceHandlerService = inject(DeleteReferenceHandlerService);
  private dialog = inject(MatDialog);
  page = signal<number>(0);
  selectedAddress = signal<string[]>(null);
  private readonly source: DocumentAbstract;

  showInfo = signal<boolean>(true);
  disableReplacementAddress = (node: TreeNode) =>
    this.deleteReferenceHandlerService.cannotReplaceWithAddress(
      this.source,
      node,
    );
  constructor(@Inject(MAT_DIALOG_DATA) public data: ReplaceAddressDialogData) {
    this.source = data.source;
    this.showInfo.set(data.showInfo);
  }

  replaceAddress() {
    this.openConfirmReplaceAddressDialog()
      .pipe(
        filter((confirmed) => confirmed),
        switchMap(() =>
          this.documentService.replaceAddress(
            this.source._uuid,
            this.selectedAddress()[0],
          ),
        ),
      )
      .subscribe(() => {
        this.reloadAddress();
        this.increasePage();
      });
  }

  increasePage() {
    this.page.update((prev) => prev + 1);
  }

  openConfirmReplaceAddressDialog(): Observable<boolean> {
    return this.dialog
      .open(ConfirmDialogComponent, {
        data: (<ConfirmDialogData>{
          title: "Adresse ersetzen",
          message:
            "Achtung! Eine Adresse zu ersetzen ist nicht umkehrbar. \n Es kann im Nachhinein nicht mehr rekonstruiert werden, in welchen Datensätzen die Adresse ersetzt wurde.",
          buttons: [
            { text: "Abbrechen" },
            {
              text: "Adresse ersetzen",
              id: "confirm",
              alignRight: true,
              emphasize: true,
            },
          ],
        }) as ConfirmDialogData,
        hasBackdrop: true,
      })
      .afterClosed()
      .pipe(
        map((response) => {
          return response === "confirm";
        }),
      );
  }

  private reloadAddress() {
    this.documentService.reload$.next({
      uuid: this.source._uuid,
      forAddress: true,
    });
  }
}
