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
import {
  Component,
  computed,
  DestroyRef,
  effect,
  HostListener,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { CodelistService } from "../../services/codelist/codelist.service";
import {
  Codelist,
  CodelistEntry,
  FreeEntry,
} from "../../store/codelist/codelist.model";
import { filter, tap } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { UpdateCodelistComponent } from "./update-codelist/update-codelist.component";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../dialogs/confirm/confirm-dialog.component";
import { FreeEntryReplaceDialogComponent } from "./free-entry-replace-dialog/free-entry-replace-dialog.component";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from "@angular/cdk/drag-drop";
import { MatFormField, MatLabel } from "@angular/material/form-field";
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
import { PageTemplateComponent } from "../../shared/page-template/page-template.component";
import { CodelistStore } from "../../store/codelist/codelist.store";
import { MatInput } from "@angular/material/input";
import { FreeEntryListComponent } from "./free-entry-list/free-entry-list.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: "ige-catalog-codelists",
  templateUrl: "./catalog-codelists.component.html",
  styleUrls: ["./catalog-codelists.component.scss"],
  imports: [
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
    PageTemplateComponent,
    MatInput,
    MatLabel,
    FormsModule,
    FreeEntryListComponent,
  ],
})
export class CatalogCodelistsComponent implements OnInit {
  private codelistStore = inject(CodelistStore);
  private destroyRef = inject(DestroyRef);

  codelists = computed<Codelist[]>(() =>
    [...this.codelistStore.entities()].sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  );

  // Selected codelist.
  selectedCodelistId = signal<string>(undefined);
  selectedCodelist = computed<Codelist>(() => {
    const selected = this.codelists().find(
      (item) => item.id === this.selectedCodelistId(),
    );
    if (selected) return this.copyCodelist(selected);
  });

  // Selected codelist dependent entries.
  favorites = signal<CodelistEntry[]>([]);
  favoriteIds = computed<string[]>(() => this.favorites().map((f) => f.id));
  freeEntries = signal<FreeEntry[]>(undefined);

  // Filter selection.
  filterCodelistCtrl = new FormControl();
  filterSearchQueryCtrl = new FormControl();
  filterSearchQueryCtrlValue = signal<string>("");
  filteredCodeLists = computed<Codelist[]>(() =>
    this.getFilteredCodelists(this.filterSearchQueryCtrlValue()),
  );

  showAllCodelists = signal<boolean>(true);
  showSyncButton = signal<boolean>(false);
  private ctrlKeyPressCount = 0;
  codelistIdInput: string;

  constructor(
    private codelistService: CodelistService,
    private _snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
    // Update the codelist select field by filtered codelists.
    effect(() => {
      if (this.filterCodelistCtrl?.value) {
        const option = this.filteredCodeLists().find(
          (item) => item.id === this.filterCodelistCtrl.value.id,
        );
        if (!option) {
          this.filterCodelistCtrl.setValue(this.filteredCodeLists()[0]);
        }
      } else if (this.filteredCodeLists().length > 0) {
        this.filterCodelistCtrl.setValue(this.filteredCodeLists()[0]);
      }
    });

    // Update values by selected codelist id.
    effect(() => {
      if (!this.selectedCodelistId()) return;
      this.favorites.set(
        this.codelistService.getFavorite(this.selectedCodelistId()),
      );
      this.syncFreeEntries();
    });
  }

  ngOnInit(): void {
    this.codelistService.getAll();

    this.filterCodelistCtrl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((codelist) => {
        this.selectedCodelistId.set(codelist?.id);
      });
    this.filterSearchQueryCtrl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.filterSearchQueryCtrlValue.set(value);
      });
  }

  @HostListener("document:keydown", ["$event"])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === "Control") {
      this.ctrlKeyPressCount++;
      if (this.ctrlKeyPressCount === 5) {
        this.showSyncButton.set(true);
        this.ctrlKeyPressCount = 0;
      }
    }
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
        minWidth: "min(650px, 100%)",
        hasBackdrop: true,
        disableClose: true,
        data: {
          ids: this.selectedCodelist()
            .entries.map((e) => e.id)
            .filter((id) => id !== oldId),
          entry: editEntry,
        },
      })
      .afterClosed()
      .pipe(filter((result) => result))
      .subscribe({
        next: (result) => {
          const codelist = this.copyCodelist(this.selectedCodelist());
          this.modifyCodelistEntry(codelist, result);
          this.saveCodelist(codelist);
        },
      });
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
      .pipe(filter((result) => result))
      .subscribe({
        next: () => {
          const codelist = this.copyCodelist(this.selectedCodelist());
          this.removeCodelistEntry(codelist, entry);
          this.saveCodelist(codelist);
        },
      });
  }

  setAsDefault(entry: CodelistEntry) {
    const codelist = this.copyCodelist(this.selectedCodelist());
    codelist.default = entry?.id ?? null;
    this.saveCodelist(codelist);
  }

  // Save codelist in the server.
  saveCodelist(codelist: Codelist) {
    this.codelistService
      .updateCodelist(codelist)
      .pipe(tap(() => this._snackBar.open("Codeliste gespeichert")))
      .subscribe();
  }

  openFreeEntryReplaceDialog(entry: FreeEntry) {
    this.dialog
      .open(FreeEntryReplaceDialogComponent, {
        data: {
          codelistId: this.selectedCodelist().id,
          entries: this.freeEntries(),
          selectedEntry: entry,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        const fromValue = entry.value;
        const toKey = result?.trim();
        if (!toKey) return;
        this.codelistService
          .replaceFreeEntry(this.selectedCodelist().id, fromValue, toKey)
          .subscribe((result) => {
            if (result !== undefined) this.syncFreeEntries();
          });
      });
  }

  openFreeEntryAddDialog(entry: FreeEntry) {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: "In Codeliste aufnehmen",
          message:
            "Möchten Sie den freien Eintrag in die Codeliste aufnehmen?" +
            "<br>Diese Aktion kann nicht rückgängig gemacht werden.",
          list: [entry.value],
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;
        const fromValue = entry.value;
        this.codelistService
          .addFreeEntryToCodelist(this.selectedCodelist().id, fromValue)
          .subscribe((result) => {
            if (result !== undefined) {
              this.syncFreeEntries();
              this.syncSelectedCodelist();
            }
          });
      });
  }

  private syncFreeEntries() {
    this.codelistService
      .getFreeEntries(this.selectedCodelist().id)
      .subscribe((entries) => this.freeEntries.set(entries));
  }

  private syncSelectedCodelist() {
    this.codelistService
      .syncCodelistById(
        this.selectedCodelist().id,
        this.selectedCodelist().isCatalog,
      )
      .subscribe();
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
          const id = this.selectedCodelist().id;
          this.codelistService.resetCodelist(id).subscribe();
        }
      });
  }

  private modifyCodelistEntry(codelist: Codelist, entry: CodelistEntry) {
    const index = codelist.entries.findIndex((e) => e.id === entry.id);
    if (index >= 0) {
      codelist.entries.splice(index, 1, entry);
    } else {
      codelist.entries.push(entry);
    }
    this.sortCodelist(codelist);
  }

  private removeCodelistEntry(codelist: Codelist, entry: CodelistEntry) {
    const index = codelist.entries.findIndex((e) => e.id === entry.id);
    codelist.entries.splice(index, 1);
  }

  private sortCodelist(codelist: Codelist) {
    codelist.entries.sort((a, b) => a.id.localeCompare(b.id));
  }

  resetAllCodelists(value?: string) {
    const message = value
      ? `Möchten Sie die Codeliste ${value} wirklich zurücksetzen?`
      : "Möchten Sie alle Codelisten wirklich zurücksetzen?";
    this.dialog
      .open(ConfirmDialogComponent, {
        data: <ConfirmDialogData>{
          message: message,
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
          this.codelistService.resetCodelist(value).subscribe();
        }
      });
  }

  addFavorite(entry: CodelistEntry) {
    this.favorites.update((favorites) => {
      const index = favorites.findIndex((fav) => fav.id === entry.id);
      if (index >= 0) {
        favorites.splice(index, 1);
      } else {
        favorites.push(entry);
      }
      return [...favorites];
    });
    this.saveFavorites();
  }

  moveFavorite(event: CdkDragDrop<CodelistEntry[]>) {
    if (event.previousIndex === event.currentIndex) return;
    this.favorites.update((favorites) => {
      moveItemInArray(favorites, event.previousIndex, event.currentIndex);
      return favorites;
    });
    this.saveFavorites();
  }

  removeFavorite(entry: CodelistEntry) {
    this.favorites.update((favorites) => {
      return favorites.filter((fav) => fav.id !== entry.id);
    });
    this.saveFavorites();
  }

  // Save favorites by the selected codelist in the server.
  private saveFavorites() {
    this.codelistService
      .updateFavorites(
        this.selectedCodelist().id,
        this.favorites().map((f) => f.id),
      )
      .subscribe(() => this._snackBar.open("Favoriten aktualisiert"));
  }

  private getFilteredCodelists(query?: string): Codelist[] {
    const visibleCodelists = this.showAllCodelists()
      ? this.codelists()
      : this.codelists().filter((item) => item.isCatalog);
    if (!query) return visibleCodelists;

    const filter = query.toLowerCase();
    return visibleCodelists.filter(
      (option) =>
        option.id.toLowerCase().indexOf(filter) !== -1 ||
        option.name.toLowerCase().indexOf(filter) !== -1,
    );
  }

  handleCodelistToggle(event: MatSlideToggleChange) {
    this.showAllCodelists.set(event.checked);
    this.filterSearchQueryCtrl.setValue("");
  }

  syncCodelistValues($event: MouseEvent) {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: <ConfirmDialogData>{
          message: `Möchten Sie die Codelistenwerte wirklich synchronisieren?`,
          title: "Synchronisieren",
          buttons: [
            { text: "Abbrechen" },
            {
              text: "Synchronisieren",
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
          // hidden option to migrate before synchronisation
          this.codelistService
            .syncCodelistValues($event.ctrlKey || $event.altKey)
            .subscribe(() => {
              this._snackBar.open("Codelistenwerte werden synchronisiert", "", {
                duration: 3000,
              });
            });
        }
      });
  }

  // Return a copy of the codelist.
  private copyCodelist(codelist: Codelist): Codelist {
    return JSON.parse(JSON.stringify(codelist));
  }
}
