/*
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
  forwardRef,
  inject,
  input,
  Signal,
  signal,
} from "@angular/core";
import { PermissionLevel, TreePermission } from "../../user";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { PermissionAddDialogComponent } from "../permission-add-dialog/permission-add-dialog.component";
import { DynamicDatabase } from "../../../+form/sidebars/tree/dynamic.database";
import { DocumentService } from "../../../services/document/document.service";
import { ShortTreeNode } from "../../../+form/sidebars/tree/tree.types";
import { IgeDocument } from "../../../models/ige-document";
import { ProfileService } from "../../../services/profile.service";
import { PermissionLegendsComponent } from "../permission-legends/permission-legends.component";
import { MatTableModule } from "@angular/material/table";
import { MatIconModule } from "@angular/material/icon";

import { MatMenuModule } from "@angular/material/menu";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { TranslocoModule } from "@jsverse/transloco";

import { firstValueFrom } from "rxjs";
import { map } from "rxjs/operators";
import { BreadcrumbComponent } from "../../../+form/form-info/breadcrumb/breadcrumb.component";
import { ConfigService } from "../../../services/config/config.service";
import { Router } from "@angular/router";

@Component({
  selector: "permission-table",
  templateUrl: "./permission-table.component.html",
  styleUrls: ["./permission-table.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PermissionTableComponent),
      multi: true,
    },
    DynamicDatabase,
  ],
  imports: [
    PermissionLegendsComponent,
    MatTableModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatTooltipModule,
    TranslocoModule,
    BreadcrumbComponent,
  ],
})
export class PermissionTableComponent implements ControlValueAccessor {
  private dialog = inject(MatDialog);
  private documentService = inject(DocumentService);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  readonly label = input<string>(undefined);
  readonly forAddress = input(false);
  readonly disabled = input(false);

  public permissionLevel: typeof PermissionLevel = PermissionLevel;

  displayedColumns = signal<string[]>([
    "type-icon",
    "title",
    "permission",
    "settings",
  ]);

  datasource = signal<TreePermission[]>([]);
  private onChange: (x: any) => {};
  private onTouch: (x: any) => {};
  breadcrumb = signal<Record<string, ShortTreeNode[]>>({});

  callAddPermissionDialog() {
    return this.dialog
      .open(PermissionAddDialogComponent, {
        hasBackdrop: true,
        data: {
          forAddress: this.forAddress(),
          value: this.datasource(),
          breadcrumb: this.breadcrumb(),
        },
      })
      .afterClosed()
      .subscribe(async (data) => {
        if (data) {
          await this.addDocInfoToPermission(data);
          this.datasource.update((prev) => [...prev, data]);
          this.onChange(this.datasource());
        }
      });
  }

  removePermission(id: number) {
    this.value = this.datasource().filter((entry) => id !== entry.id);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  writeValue(value: any): void {
    this.value = value;
  }

  set value(val: TreePermission[]) {
    const data = val ?? [];
    Promise.all(data.map((doc) => this.addDocInfoToPermission(doc))).then(
      (newData) => {
        this.datasource.set(newData);
      },
    );

    if (this.onChange) {
      this.onChange(val);
    }
    if (this.onTouch) {
      this.onTouch(val);
    }
  }

  private async addDocInfoToPermission(
    doc: TreePermission,
  ): Promise<TreePermission> {
    // if root permission skip
    if (doc.id == null) return doc;

    if (!this.breadcrumb()[doc.id]) {
      this.documentService.getPath(doc.id).subscribe((path) =>
        this.breadcrumb.update((current) => {
          return {
            ...current,
            [doc.id]: path.slice(0, -1),
          };
        }),
      );
    }

    const igeDoc = await this.getDocument(doc.id);
    doc.uuid = igeDoc._uuid;
    doc.hasWritePermission = igeDoc.hasWritePermission;
    doc.hasOnlySubtreeWritePermission = igeDoc.hasOnlySubtreeWritePermission;
    // Organisations act like folders in this context and also have the hasOnlySubtreeWritePermission option
    doc.isFolder =
      igeDoc._type === "FOLDER" || igeDoc._type.endsWith("OrganisationDoc");
    doc.title = igeDoc.title;
    doc.iconClass = this.profileService.getDoctype(igeDoc._type).iconClass;

    // downgrade permission if rights are not sufficient
    this.adjustPermission(doc);
    return doc;
  }

  getDocument(id: number): Promise<IgeDocument> {
    return firstValueFrom(
      this.documentService
        .load(id, this.forAddress(), false)
        .pipe(map((doc) => doc.documentWithMetadata)),
    );
  }

  updatePermission(element: any, level: PermissionLevel) {
    if (this.disabled()) return;
    element.permission = level;
    this.onChange(this.datasource());
  }

  private adjustPermission(doc: TreePermission) {
    // all permissions are allowed
    if (doc.hasWritePermission) return;

    // adjust permission if only subtree rights are available and permission was WRITE
    if (
      doc.hasOnlySubtreeWritePermission &&
      doc.permission === PermissionLevel.WRITE
    ) {
      console.debug("adjusting permission");
      doc.permission = PermissionLevel.WRITE_EXCEPT_PARENT;
    }

    //only read permission is allowed
    if (!doc.hasWritePermission && !doc.hasOnlySubtreeWritePermission) {
      doc.permission = PermissionLevel.READ;
    }
  }

  openDataset(item: TreePermission) {
    const basePath = `${ConfigService.catalogId}/${this.forAddress() ? "address" : "form"}`;
    this.router.navigate([basePath, { id: item.uuid }]);
  }
}
