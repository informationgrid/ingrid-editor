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
import { Component, OnInit } from "@angular/core";
import { CodelistService } from "../../services/codelist/codelist.service";
import { Codelist, CodelistEntry } from "../../store/codelist/codelist.model";
import { delay, filter, map, startWith, tap } from "rxjs/operators";
import { CodelistQuery } from "../../store/codelist/codelist.query";
import { MatDialog } from "@angular/material/dialog";
import { UpdateCodelistComponent } from "./update-codelist/update-codelist.component";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../dialogs/confirm/confirm-dialog.component";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from "@angular/cdk/drag-drop";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

import { AsyncPipe } from "@angular/common";
import { MatFormField } from "@angular/material/form-field";
import { MatOption, MatSelect } from "@angular/material/select";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { MatButton, MatIconButton } from "@angular/material/button";
import {
  MatSlideToggle,
  MatSlideToggleChange,
} from "@angular/material/slide-toggle";
import { CodelistPresenterComponent } from "../../shared/codelist-presenter/codelist-presenter.component";
import { MatIcon } from "@angular/material/icon";
import { MatDivider } from "@angular/material/divider";

@UntilDestroy()
@Component({
  selector: "ige-catalog-codelists",
  templateUrl: "./catalog-codelists.component.html",
  styleUrls: ["./catalog-codelists.component.scss"],
  imports: [
    AsyncPipe,
    MatFormField,
    MatSelect,
    MatOption,
    NgxMatSelectSearchModule,
    ReactiveFormsModule,
    CdkDropList,
    MatButton,
    CdkDrag,
    MatSlideToggle,
    CodelistPresenterComponent,
    MatIcon,
    MatIconButton,
    MatDivider,
  ],
  standalone: true,
})
export class CatalogCodelistsComponent implements OnInit {
  private codelists = this.codelistQuery.selectAll().pipe(
    map((codelists) => codelists.sort((a, b) => a.name.localeCompare(b.name))),
    delay(0), // set initial value in next rendering cycle!
    tap((options) => (this.codelistsValue = options)),
    tap((options) => {
      this.activateRememberedCodelist();
      this.setInitialValue();
    }),
  );

  private readonly CODELIST_STORAGE_KEY = "codelist.selected.before.reload";

  selectedCodelist: Codelist;
  codelistSelect = new FormControl();
  descriptionCtrl = new FormControl();
  favorites: CodelistEntry[];
  favoriteIds: string[];
  filterCtrl = new FormControl();
  filteredOptions: Codelist[] = [];

  private codelistsValue: Codelist[];
  showAllCodelists: boolean = true;

  constructor(
    private codelistService: CodelistService,
    private codelistQuery: CodelistQuery,
    private _snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.codelistService.getAll();

    this.codelists
      .pipe(
        untilDestroyed(this),
        filter((data) => data !== null),
      )
      .subscribe(() => {
        this.filterCtrl.valueChanges
          .pipe(untilDestroyed(this), startWith(""))
          .subscribe((value) => {
            this.filteredOptions = this.getFilteredCodelists(value);
            if (this.filteredOptions.length === 0) {
              this.codelistSelect.disable();
            } else {
              this.codelistSelect.enable();
            }
          });
      });
  }

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

  selectCodelist(option: Codelist) {
    const other = JSON.parse(JSON.stringify(option));
    this.sortCodelist(other);
    this.selectedCodelist = other;
    this.descriptionCtrl.setValue(this.selectedCodelist.description, {
      emitEvent: false,
    });
    this.favorites = this.codelistQuery.getFavorite(option.id);
    this.favoriteIds = this.favorites.map((f) => f.id);
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
      .pipe(
        tap(() => {
          // store currently selected codelist
          localStorage.setItem(
            this.CODELIST_STORAGE_KEY,
            this.selectedCodelist.id,
          );
          // reload window to hard reset forms that rely on codelists
          window.location.reload();
        }),
        tap(() => this._snackBar.open("Codeliste gespeichert")),
      )
      .subscribe();
  }

  private modifyCodelistEntry(oldId: string, result: CodelistEntry) {
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

  private setInitialValue() {
    if (this.codelistsValue?.length === 0) return;

    // after a reset we want to stay on an already selected codelist
    let initialValue: Codelist;
    if (this.selectedCodelist) {
      initialValue = this.codelistsValue.find(
        (option) => option.id === this.selectedCodelist.id,
      );
    } else {
      initialValue = this.getFilteredCodelists("")?.[0];
    }

    if (initialValue) {
      this.codelistSelect.setValue(initialValue);
      this.selectCodelist(initialValue);
    }
  }

  // retrieve temporarily saved "current" codelist, and remove from localStorage
  private activateRememberedCodelist() {
    let codelistId = localStorage.getItem(this.CODELIST_STORAGE_KEY);
    localStorage.removeItem(this.CODELIST_STORAGE_KEY);
    let codelist = this.codelistsValue.find(
      (option) => option.id === codelistId,
    );
    if (codelist) this.selectCodelist(codelist);
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

  setAsFavorite(entry: CodelistEntry) {
    let entryIndex = this.favorites.findIndex((fav) => fav.id === entry.id);
    if (entryIndex >= 0) {
      this.favorites.splice(entryIndex, 1);
    } else {
      this.favorites.push(entry);
    }
    this.updateFavorites();
  }

  dropFavorite(event: CdkDragDrop<CodelistEntry[]>) {
    if (event.previousIndex === event.currentIndex) return;

    moveItemInArray(this.favorites, event.previousIndex, event.currentIndex);
    this.updateFavorites();
  }

  private updateFavorites() {
    this.favoriteIds = this.favorites.map((f) => f.id);
    this.codelistService
      .updateFavorites(
        this.selectedCodelist.id,
        this.favorites.map((item) => item.id),
      )
      .subscribe(() => this._snackBar.open("Favoriten aktualisiert"));
  }

  private getFilteredCodelists(value: string): Codelist[] {
    let visibleCodelists = this.showAllCodelists
      ? this.codelistsValue
      : this.codelistsValue.filter((item) => item.isCatalog);

    if (value === "") return visibleCodelists;

    let filter = value.toLowerCase();
    return visibleCodelists.filter(
      (option) =>
        option.id.toLowerCase().indexOf(filter) !== -1 ||
        option.name.toLowerCase().indexOf(filter) !== -1,
    );
  }

  handleCodelistToggle(event: MatSlideToggleChange) {
    this.showAllCodelists = event.checked;
    this.filterCtrl.setValue("");
    if (this.filteredOptions.length > 0) {
      this.codelistSelect.setValue(this.filteredOptions[0]);
      this.selectCodelist(this.filteredOptions[0]);
    }
  }

  removeFavorite(item: CodelistEntry) {
    this.favorites = this.favorites.filter((f) => f !== item);
    this.updateFavorites();
  }
}
