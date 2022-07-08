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
  ADDRESS_ROOT_NODE,
  DOCUMENT_ROOT_NODE,
} from "../../../store/document/document.model";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { IgeDocument } from "../../../models/ige-document";
import { ShortTreeNode } from "../../sidebars/tree/tree.types";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { ConfigService } from "../../../services/config/config.service";
import { DocBehavioursService } from "../../../services/event/doc-behaviours.service";
import { combineLatest, Subject } from "rxjs";
import { TranslocoService } from "@ngneat/transloco";

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
  parent: string = null;
  forAddress: boolean;
  selectedPage = 0;
  rootTreeName: string;
  isFolder = true;
  formGroup: FormGroup;
  jumpedTreeNodeId: string = null;
  isAdmin = this.config.hasWriteRootPermission();
  selectedLocation: string = null;
  pathWithWritePermission = false;
  private query: TreeQuery | AddressTreeQuery;
  docTypeChoice: string;
  docTypeChanged$ = new Subject();

  constructor(
    private config: ConfigService,
    private treeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
    private router: Router,
    private fb: FormBuilder,
    private documentService: DocumentService,
    private docBehaviours: DocBehavioursService,
    private translocoService: TranslocoService,
    public dialogRef: MatDialogRef<CreateNodeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CreateOptions
  ) {
    this.isFolder = data.isFolder;
    this.forAddress = this.data.forAddress;
    this.rootTreeName = this.forAddress
      ? ADDRESS_ROOT_NODE.title
      : DOCUMENT_ROOT_NODE.title;

    if (!this.isFolder) {
      this.title = this.translocoService.translate(
        this.forAddress ? "toolbar.newAddress" : "toolbar.newDocument"
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
      }, 0)
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
    if (this.formGroup.invalid) return;

    if (this.isFolder || !this.forAddress) {
      await this.handleDocumentCreate();
    } else {
      await this.handleAddressCreate();
    }
  }

  updateParent(parentId: string) {
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

  jumpToTree(id: string) {
    this.selectedPage = 1;
    if (id !== null && this.pathWithWritePermission) {
      this.jumpedTreeNodeId = id;
    }
  }

  quickBreadcrumbChange(id: string) {
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
    const cannotAddBelow = this.docBehaviours.cannotAddDocumentBelow()(
      this.forAddress,
      { type: entity._type },
      this.docTypeChoice
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
      this.parent
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
      this.parent
    );
    newDocument.title = this.formGroup.get("title").value;
    const savedDoc = await this.saveForm(newDocument);

    this.navigateAfterSave(savedDoc._uuid);
  }

  private saveForm(data: IgeDocument) {
    const pathIds = this.path.map((item) => item.id);
    return this.documentService
      .save(data, true, this.forAddress, pathIds)
      .toPromise();
  }

  private navigateAfterSave(uuid: string) {
    this.dialogRef.close(uuid);

    const page = this.forAddress ? "/address" : "/form";
    this.router.navigate([page, { id: uuid }]);
  }
}
