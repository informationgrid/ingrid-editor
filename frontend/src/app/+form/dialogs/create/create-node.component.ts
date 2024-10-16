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
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  Inject,
  OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import {
  DocumentService,
  SaveOptions,
} from "../../../services/document/document.service";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import { tap } from "rxjs/operators";
import { TreeQuery } from "../../../store/tree/tree.query";
import { AddressTreeQuery } from "../../../store/address-tree/address-tree.query";
import { Router } from "@angular/router";
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { IgeDocument } from "../../../models/ige-document";
import { ShortTreeNode } from "../../sidebars/tree/tree.types";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { ConfigService } from "../../../services/config/config.service";
import { DocBehavioursService } from "../../../services/event/doc-behaviours.service";
import { firstValueFrom } from "rxjs";
import { TranslocoDirective, TranslocoService } from "@ngneat/transloco";
import { TreeNode } from "../../../store/tree/tree-node.model";
import { CdkDrag, CdkDragHandle } from "@angular/cdk/drag-drop";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { CdkScrollable } from "@angular/cdk/scrolling";
import { MatTab, MatTabGroup } from "@angular/material/tabs";
import { DocumentTemplateComponent } from "./document-template/document-template.component";
import { NgTemplateOutlet } from "@angular/common";
import { AddressTemplateComponent } from "./address-template/address-template.component";
import { DestinationSelectionComponent } from "./destination-selection/destination-selection.component";
import { BreadcrumbComponent } from "../../form-info/breadcrumb/breadcrumb.component";

export interface CreateOptions {
  parent: string;
  forAddress: boolean;
  isFolder: boolean;
}

@UntilDestroy()
@Component({
  templateUrl: "./create-node.component.html",
  styleUrls: ["./create-node.component.scss"],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CdkDrag,
    CdkDragHandle,
    MatIconButton,
    MatDialogClose,
    MatIcon,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatTabGroup,
    MatTab,
    ReactiveFormsModule,
    DocumentTemplateComponent,
    NgTemplateOutlet,
    AddressTemplateComponent,
    DestinationSelectionComponent,
    MatDialogActions,
    MatButton,
    TranslocoDirective,
    BreadcrumbComponent,
  ],
})
export class CreateNodeComponent implements OnInit {
  @ViewChild("contextNodeContainer") container: ElementRef;
  title = "Neuen Ordner anlegen";
  parent: number = null;
  forAddress: boolean;
  selectedPage = 0;
  rootTreeName: string;
  isFolder = signal<boolean>(true);
  formGroup: UntypedFormGroup;
  jumpedTreeNodeId: number = null;
  isAdmin = this.config.hasWriteRootPermission();
  selectedLocation: number = null;
  pathWithWritePermission = signal<boolean>(false);
  alreadySubmitted = false;

  private query: TreeQuery | AddressTreeQuery;
  docTypeChoice = signal<string>(null);

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
    this.isFolder.set(data.isFolder);
    this.forAddress = this.data.forAddress;
    this.rootTreeName = this.translocoService.translate(
      this.forAddress ? "menu.address" : "menu.form",
    );

    if (!this.isFolder()) {
      this.title = this.translocoService.translate(
        this.forAddress ? "toolbar.newAddress" : "toolbar.newDocument",
      );
    }

    effect(
      () => {
        // update path depending on selected document type
        this.docTypeChoice();
        this.mapPath(this.path);
      },
      { allowSignalWrites: true },
    );
  }

  private _path: ShortTreeNode[] = [];

  get path() {
    return this._path;
  }

  set path(value: ShortTreeNode[]) {
    this._path = value;
    this.pathWithWritePermission.set(
      value.length === 0
        ? this.isAdmin
        : value[value.length - 1].permission.canOnlyWriteSubtree ||
            !value[value.length - 1].disabled,
    );
  }

  ngOnInit() {
    this.query = this.forAddress ? this.addressTreeQuery : this.treeQuery;

    if (this.isFolder() || !this.forAddress) {
      this.initializeForDocumentsAndFolders();
    } else {
      this.initializeForAddresses();
    }

    this.formGroup.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((value) => this.docTypeChoice.set(value.choice));

    // set initial path to current position
    this.query.breadcrumb$
      .pipe(untilDestroyed(this))
      .subscribe((path) => this.mapPath(path));
  }

  async handleCreate() {
    if (
      // don't proceed if invalid form or user without writePermission on selected path
      this.formGroup.invalid ||
      (!this.isAdmin && !this.pathWithWritePermission())
    )
      return;

    this.alreadySubmitted = true;

    if (this.isFolder() || !this.forAddress) {
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
    if (id !== null && this.pathWithWritePermission()) {
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
      this.docTypeChoice(),
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
    const newAddress = new IgeDocument();

    const organization = this.formGroup.get("organization").value;
    if (organization) {
      newAddress.organization = organization;
    } else {
      newAddress.firstName = this.formGroup.get("firstName").value;
      newAddress.lastName = this.formGroup.get("lastName").value;
    }
    newAddress.title = this.documentService.createAddressTitle(newAddress);
    const savedDoc = await this.saveForm(
      newAddress,
      this.docTypeChoice(),
      this.parent,
    );

    this.navigateAfterSave(savedDoc.metadata.uuid);
  }

  private async handleDocumentCreate() {
    const newDocument: any = {
      title: this.formGroup.get("title").value,
    };
    const savedDoc = await this.saveForm(
      newDocument,
      this.docTypeChoice(),
      this.parent,
    );

    this.navigateAfterSave(savedDoc.metadata.uuid);
  }

  private saveForm(data: IgeDocument, type: string, parent: number) {
    const pathIds = this.path.map((item) => item.id);

    return firstValueFrom(
      this.documentService.save(
        SaveOptions.createNewDocument(
          data,
          type,
          parent,
          this.forAddress,
          pathIds,
        ),
      ),
    );
  }

  private navigateAfterSave(uuid: string) {
    this.dialogRef.close(uuid);

    const page =
      ConfigService.catalogId + (this.forAddress ? "/address" : "/form");
    this.router.navigate([page, { id: uuid }]);
  }
}
