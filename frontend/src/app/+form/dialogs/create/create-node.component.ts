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
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import { DocumentService } from "../../../services/document/document.service";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { tap } from "rxjs/operators";
import { TreeQuery } from "../../../store/tree/tree.query";
import { AddressTreeQuery } from "../../../store/address-tree/address-tree.query";
import { Router } from "@angular/router";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { IgeDocument } from "../../../models/ige-document";
import { ShortTreeNode } from "../../sidebars/tree/tree.types";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { ConfigService } from "../../../services/config/config.service";
import { DocBehavioursService } from "../../../services/event/doc-behaviours.service";
import { firstValueFrom, Subject } from "rxjs";
import { TranslocoService } from "@ngneat/transloco";
import { TreeNode } from "../../../store/tree/tree-node.model";

export interface CreateOptions {
  parent: string;
  forAddress: boolean;
  isFolder: boolean;
}

@UntilDestroy()
@Component({
  templateUrl: "./create-node.component.html",
  styleUrls: ["./create-node.component.scss"],
})
export class CreateNodeComponent implements OnInit {
  @ViewChild("contextNodeContainer") container: ElementRef;
  title = "Neuen Ordner anlegen";
  parent: number = null;
  forAddress: boolean;
  selectedPage = 0;
  rootTreeName: string;
  isFolder = true;
  formGroup: UntypedFormGroup;
  jumpedTreeNodeId: number = null;
  isAdmin = this.config.hasWriteRootPermission();
  selectedLocation: number = null;
  pathWithWritePermission = false;
  alreadySubmitted = false;

  private query: TreeQuery | AddressTreeQuery;
  docTypeChoice: string;
  docTypeChanged$ = new Subject<void>();

  constructor(
    private config: ConfigService,
    private treeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
    private router: Router,
    private fb: UntypedFormBuilder,
    private documentService: DocumentService,
    private docBehaviours: DocBehavioursService,
    private translocoService: TranslocoService,
    public dialogRef: MatDialogRef<CreateNodeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CreateOptions,
  ) {
    this.isFolder = data.isFolder;
    this.forAddress = this.data.forAddress;
    this.rootTreeName = this.translocoService.translate(
      this.forAddress ? "menu.address" : "menu.form",
    );

    if (!this.isFolder) {
      this.title = this.translocoService.translate(
        this.forAddress ? "toolbar.newAddress" : "toolbar.newDocument",
      );
    }
  }

  private _path: ShortTreeNode[] = [];
  isPerson: boolean;

  get path() {
    return this._path;
  }

  set path(value: ShortTreeNode[]) {
    this._path = value;
    this.pathWithWritePermission =
      value.length === 0
        ? this.isAdmin
        : value[value.length - 1].permission.canOnlyWriteSubtree ||
          !value[value.length - 1].disabled;
  }

  ngOnInit() {
    this.query = this.forAddress ? this.addressTreeQuery : this.treeQuery;

    if (this.isFolder || !this.forAddress) {
      this.initializeForDocumentsAndFolders();
    } else {
      this.initializeForAddresses();
    }

    this.formGroup.valueChanges.pipe(untilDestroyed(this)).subscribe((value) =>
      setTimeout(() => {
        this.docTypeChoice = value.choice;
        this.docTypeChanged$.next();
      }, 0),
    );

    // set initial path to current position
    this.query.breadcrumb$
      .pipe(untilDestroyed(this))
      .subscribe((path) => this.mapPath(path));

    // update path depending on selected document type
    this.docTypeChanged$
      .pipe(untilDestroyed(this))
      .subscribe(() => this.mapPath(this.path));
  }

  async handleCreate() {
    if (
      // don't proceed if invalid form or user without writePermission on selected path
      this.formGroup.invalid ||
      (!this.isAdmin && !this.pathWithWritePermission)
    )
      return;

    this.alreadySubmitted = true;

    if (this.isFolder || !this.forAddress) {
      await this.handleDocumentCreate();
    } else {
      await this.handleAddressCreate();
    }
  }

  updateParent(parentId: number) {
    this.selectedLocation = parentId;
  }

  applyLocation() {
    this.parent = this.selectedLocation;

    if (this.selectedLocation === null) {
      this.path = [];
    } else {
      this.documentService
        .getPath(this.parent)
        .pipe(tap((result) => (this.path = result)))
        .subscribe();
    }

    this.selectedPage = 0;
  }

  jumpToTree(id: number) {
    this.selectedPage = 1;
    if (id !== null && this.pathWithWritePermission) {
      this.jumpedTreeNodeId = id;
    }
  }

  quickBreadcrumbChange(id: number) {
    this.parent = id;
    const index = this.path.findIndex((item) => item.id === id);
    this.path = this.path.splice(0, index + 1);
  }

  private mapPath(path: ShortTreeNode[]) {
    if (path.length === 0) {
      this.path = [];
      return;
    }

    this.path = this.getPathAllowedToAdd([...path]);
    this.parent = this.path[this.path.length - 1]?.id ?? null;
  }

  private getPathAllowedToAdd(path: ShortTreeNode[]): ShortTreeNode[] {
    if (path.length === 0) return [];

    const lastNode = path.pop();
    const entity = this.query.getEntity(lastNode.id);
    // if entity could not be found because user has no read permission on parent node
    // then we cannot give any permission to the currently selected path
    if (!entity) return [];

    const cannotAddBelow = this.docBehaviours.cannotAddDocumentBelow()(
      this.forAddress,
      <TreeNode>{
        type: entity._type,
        hasWritePermission: entity.hasWritePermission,
        hasOnlySubtreeWritePermission: entity.hasOnlySubtreeWritePermission,
      },
      this.docTypeChoice,
    );
    if (cannotAddBelow) {
      return this.getPathAllowedToAdd(path);
    }
    return [...path, lastNode];
  }

  private initializeForDocumentsAndFolders() {
    this.formGroup = this.fb.group({
      title: ["", Validators.required],
      choice: ["", Validators.required],
    });
  }

  private initializeForAddresses() {
    this.formGroup = this.fb.group({
      firstName: [""],
      lastName: [""],
      organization: [""],
      choice: ["", Validators.required],
    });
  }

  private async handleAddressCreate() {
    const newAddress = new IgeDocument(
      this.formGroup.get("choice").value,
      this.parent,
    );

    const organization = this.formGroup.get("organization").value;
    if (organization) {
      newAddress.organization = organization;
    } else {
      newAddress.firstName = this.formGroup.get("firstName").value;
      newAddress.lastName = this.formGroup.get("lastName").value;
    }
    newAddress.title = this.documentService.createAddressTitle(newAddress);
    const savedDoc = await this.saveForm(newAddress);

    this.navigateAfterSave(savedDoc._uuid);
  }

  private async handleDocumentCreate() {
    const newDocument = new IgeDocument(
      this.formGroup.get("choice").value,
      this.parent,
    );
    newDocument.title = this.formGroup.get("title").value;
    const savedDoc = await this.saveForm(newDocument);

    this.navigateAfterSave(savedDoc._uuid);
  }

  private saveForm(data: IgeDocument) {
    const pathIds = this.path.map((item) => item.id);
    return firstValueFrom(
      this.documentService.save({
        data: data,
        isNewDoc: true,
        isAddress: this.forAddress,
        path: pathIds,
      }),
    );
  }

  private navigateAfterSave(uuid: string) {
    this.dialogRef.close(uuid);

    const page =
      ConfigService.catalogId + (this.forAddress ? "/address" : "/form");
    this.router.navigate([page, { id: uuid }]);
  }
}
