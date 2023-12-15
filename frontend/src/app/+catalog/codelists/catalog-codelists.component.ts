/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { Component, OnInit } from "@angular/core";
import {
  CodelistService,
  SelectOptionUi,
} from "../../services/codelist/codelist.service";
import { Codelist, CodelistEntry } from "../../store/codelist/codelist.model";
import { delay, filter, map, tap } from "rxjs/operators";
import { CodelistQuery } from "../../store/codelist/codelist.query";
import { MatDialog } from "@angular/material/dialog";
import { UpdateCodelistComponent } from "./update-codelist/update-codelist.component";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../dialogs/confirm/confirm-dialog.component";
import { UntypedFormControl } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "ige-catalog-codelists",
  templateUrl: "./catalog-codelists.component.html",
  styleUrls: ["./catalog-codelists.component.scss"],
})
export class CatalogCodelistsComponent implements OnInit {
  hasCatalogCodelists = this.codelistQuery.hasCatalogCodelists$;
  catalogCodelists = this.codelistQuery.catalogCodelists$.pipe(
    map((codelists) => this.codelistService.mapToOptions(codelists)),
    delay(0), // set initial value in next rendering cycle!
    tap((options) => this.setInitialValue(options)),
  );

  selectedCodelist: Codelist;
  initialValue: SelectOptionUi;
  descriptionCtrl = new UntypedFormControl();

  constructor(
    private codelistService: CodelistService,
    private codelistQuery: CodelistQuery,
    private _snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {}

  addCodelist() {
    this.editCodelist();
  }

  editCodelist(entry?: CodelistEntry) {
    const oldId = entry?.id ?? null;
    const editEntry = entry
      ? entry
      : {
          fields: {},
        };
    this.dialog
      .open(UpdateCodelistComponent, {
        minWidth: 650,
        hasBackdrop: true,
        disableClose: true,
        data: {
          ids: this.selectedCodelist.entries
            .map((e) => e.id)
            .filter((id) => id !== oldId),
          entry: editEntry,
        },
      })
      .afterClosed()
      .pipe(
        filter((result) => result),
        tap((result) => this.modifyCodelistEntry(oldId, result)),
        tap(() => this.save()),
      )
      .subscribe();
  }

  removeCodelist(entry: CodelistEntry) {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: <ConfirmDialogData>{
          message: `Möchten Sie den Codelist-Eintrag "${entry.fields["de"]}" wirklich löschen? Vergewissern Sie sich, dass dieser in den Datensätzen nicht verwendet wird, da diese ansonsten ungültig werden können.`,
          title: "Löschen",
          buttons: [
            { text: "Abbrechen" },
            {
              text: "Löschen",
              alignRight: true,
              id: "confirm",
              emphasize: true,
            },
          ],
        },
      })
      .afterClosed()
      .pipe(
        filter((result) => result),
        tap(() => this.removeEntryFromCodelist(entry)),
        tap(() => this.save()),
      )
      .subscribe();
  }

  selectCodelist(option: SelectOptionUi) {
    this.selectedCodelist = this.codelistQuery.getCatalogCodelist(option.value);
    const other = JSON.parse(JSON.stringify(this.selectedCodelist));
    this.sortCodelist(other);
    this.selectedCodelist = other;
    this.descriptionCtrl.setValue(this.selectedCodelist.description, {
      emitEvent: false,
    });
  }

  setAsDefault(entry: CodelistEntry) {
    this.selectedCodelist.default = entry?.id ?? null;
    this.save();
  }

  resetCodelist() {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: <ConfirmDialogData>{
          message: `Möchten Sie die Codeliste wirklich zurücksetzen?`,
          title: "Zurücksetzen",
          buttons: [
            { text: "Abbrechen" },
            {
              text: "Zurücksetzen",
              alignRight: true,
              id: "confirm",
              emphasize: true,
            },
          ],
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.codelistService
            .resetCodelist(this.selectedCodelist.id)
            .subscribe();
        }
      });
  }

  save() {
    this.codelistService
      .updateCodelist(this.selectedCodelist)
      .pipe(tap(() => this._snackBar.open("Codeliste gespeichert")))
      .subscribe();
  }

  private modifyCodelistEntry(oldId: string, result) {
    if (oldId === null) {
      this.selectedCodelist.entries.push(result);
    } else {
      const index = this.selectedCodelist.entries.findIndex(
        (e) => e.id === oldId,
      );
      this.selectedCodelist.entries.splice(index, 1, result);
    }

    this.sortCodelist(this.selectedCodelist);
  }

  private removeEntryFromCodelist(entry: CodelistEntry) {
    const oldId = entry.id;
    const index = this.selectedCodelist.entries.findIndex(
      (e) => e.id === oldId,
    );
    this.selectedCodelist.entries.splice(index, 1);
  }

  private sortCodelist(codelist: Codelist) {
    codelist.entries.sort((a, b) => a.id.localeCompare(b.id));
  }

  private setInitialValue(options: SelectOptionUi[]) {
    if (options?.length > 0) {
      if (this.selectedCodelist) {
        this.initialValue = options.find(
          (option) => option.value === this.selectedCodelist.id,
        );
      } else {
        this.initialValue = options[0];
      }
      this.selectCodelist(this.initialValue);
    }
  }

  resetAllCodelists() {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: <ConfirmDialogData>{
          message: `Möchten Sie alle Codelisten wirklich zurücksetzen?`,
          title: "Zurücksetzen",
          buttons: [
            { text: "Abbrechen" },
            {
              text: "Zurücksetzen",
              alignRight: true,
              id: "confirm",
              emphasize: true,
            },
          ],
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.codelistService.resetCodelist(null).subscribe();
        }
      });
  }
}
