import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import { DocumentService } from "../../../services/document/document.service";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {filter, take, tap} from "rxjs/operators";
import { TreeQuery } from "../../../store/tree/tree.query";
import { AddressTreeQuery } from "../../../store/address-tree/address-tree.query";
import { Router } from "@angular/router";
import {
  ADDRESS_ROOT_NODE,
  DOCUMENT_ROOT_NODE,
  DocumentAbstract,
} from "../../../store/document/document.model";
import {
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { BehaviorSubject, Observable, of } from "rxjs";
import { ProfileQuery } from "../../../store/profile/profile.query";
import { DocType } from "./create-doc.plugin";
import { IgeDocument } from "../../../models/ige-document";
import { ShortTreeNode } from "../../sidebars/tree/tree.types";
import {ProfileAbstract} from "../../../store/profile/profile.model";

export interface CreateOptions {
  parent: string;
  forAddress: boolean;
  isFolder: boolean;
}

@Component({
  templateUrl: "./create-node.component.html",
  styleUrls: ["./create-node.component.scss"],
})
export class CreateNodeComponent implements OnInit {
  @ViewChild("title")
  set input(element: ElementRef) {
    if (element) {
      setTimeout(() => element.nativeElement.focus());
    }
  }

  title = "Neuen Ordner anlegen";
  parent: string = null;
  forAddress: boolean;
  path: ShortTreeNode[] = [];
  selectedPage = 0;
  rootTreeName: string;
  isFolder = true;
  private query: TreeQuery | AddressTreeQuery;
  private selectedLocation: any = {
    parent: null,
    path: [],
  };
  formGroup: FormGroup;
  documentTypes: Observable<DocumentAbstract[]>;
  numDocumentTypes: number;
  initialActiveDocumentType = new BehaviorSubject<Partial<DocumentAbstract>>(
    null
  );
  jumpedTreeNodeId: string = null;

  constructor(
    private treeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
    private router: Router,
    private fb: FormBuilder,
    private profileQuery: ProfileQuery,
    private documentService: DocumentService,
    public dialogRef: MatDialogRef<CreateNodeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CreateOptions
  ) {
    this.parent = data.parent;
    this.isFolder = data.isFolder;
    this.forAddress = this.data.forAddress;
    this.rootTreeName = this.forAddress
      ? ADDRESS_ROOT_NODE.title
      : DOCUMENT_ROOT_NODE.title;

    if (!this.isFolder) {
      this.title = this.forAddress
        ? "Neue Adresse anlegen"
        : "Neuen Datensatz anlegen";
    }
  }

  ngOnInit() {
    this.query = this.forAddress ? this.addressTreeQuery : this.treeQuery;

    if (this.isFolder || !this.forAddress) {
      this.initializeForDocumentsAndFolders();
    } else {
      this.initializeForAddresses();
    }

    this.query.pathTitles$.pipe(take(1)).subscribe((path) => {
      const selectedNode = this.query.getOpenedDocument();
      this.path = [...path];

      if (selectedNode && selectedNode._type !== "FOLDER") {
        this.path.pop();
      }
    });
  }

  private initializeForDocumentsAndFolders() {
    this.formGroup = this.fb.group({
      title: ["", Validators.required],
      choice: ["", Validators.required],
    });
    if (this.isFolder) {
      this.formGroup.get("choice").setValue("FOLDER");
    } else {
      this.profileQuery.documentProfiles
        .pipe(filter((types) => types.length > 0))
        .subscribe((result) => {
          const docTypes = this.createDocTypes(result);
          this.initialActiveDocumentType.next(docTypes[0]);
        });
    }
  }

  private initializeForAddresses() {
    this.formGroup = this.fb.group(
      {
        firstName: [""],
        lastName: [""],
        organization: [""],
        choice: ["", Validators.required],
      },
      {
        validators: this.nameOrOganizationValidator,
      }
    );

    this.profileQuery.addressProfiles
      .pipe(filter((types) => types.length > 0))
      .subscribe((result) => this.createDocTypes(result));
  }


  private createDocTypes(result: ProfileAbstract[]) {
    const docTypes = result
      .map((profile) => ({
        id: profile.id,
        label: profile.label,
        icon: profile.iconClass,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
    this.documentTypes = this.prepareDocumentTypes(docTypes);
    this.formGroup.get("choice").setValue(docTypes[0].id);
    return docTypes;
  }

  nameOrOganizationValidator(control: FormGroup): ValidationErrors | null {
    const firstName = control.get("firstName");
    const lastName = control.get("lastName");
    const organization = control.get("organization");

    return !firstName.value && !lastName.value && !organization.value
      ? { nameOrOrganization: true }
      : null;
  }

  async handleCreate() {
    if (this.isFolder || !this.forAddress) {
      this.handleDocumentCreate();
    } else {
      this.handleAddressCreate();
    }
  }

  updateParent(parentInfo: any) {
    this.selectedLocation = parentInfo;
  }

  applyLocation() {
    this.parent = this.selectedLocation.parent;
    this.documentService.getPath(this.selectedLocation.parent)
      .pipe(
        tap(result => this.path = result
          //.slice(0, -1)
          .map(path => new ShortTreeNode(path.id, path.title, !this.query.hasEntity(path.id)))
        )
      )
      .subscribe()
    this.selectedPage = 0;
  }

  private prepareDocumentTypes(
    docTypes: DocType[]
  ): Observable<DocumentAbstract[]> {
    this.numDocumentTypes = docTypes.length;

    return of(
      docTypes.map((dt) => {
        return {
          id: dt.id,
          title: dt.label,
          icon: dt.icon,
          _state: "P",
        } as DocumentAbstract;
      })
    );
  }

  private async handleAddressCreate() {
    const newAddress = new IgeDocument(
      this.formGroup.get("choice").value,
      this.parent
    );
    newAddress.firstName = this.formGroup.get("firstName").value;
    newAddress.lastName = this.formGroup.get("lastName").value;
    newAddress.organization = this.formGroup.get("organization").value;
    newAddress.title = this.documentService.createAddressTitle(newAddress);
    const savedDoc = await this.saveForm(newAddress);

    this.navigateAfterSave(savedDoc._id);
  }

  private async handleDocumentCreate() {
    const newDocument = new IgeDocument(
      this.formGroup.get("choice").value,
      this.parent
    );
    newDocument.title = this.formGroup.get("title").value;
    const savedDoc = await this.saveForm(newDocument);

    this.navigateAfterSave(savedDoc._id);
  }

  private saveForm(data: IgeDocument) {
    const pathIds = this.path.map((item) => item.id);
    return this.documentService.save(data, true, this.forAddress, pathIds);
  }

  private navigateAfterSave(id: string) {
    this.dialogRef.close(id);

    const page = this.forAddress ? "/address" : "/form";
    this.router.navigate([page, { id: id }]);
  }

  jumpToTree(id: string) {
    this.selectedPage = 1;
    if (id !== null) {
      this.jumpedTreeNodeId = id;
    }
  }

  setDocType(docType: DocumentAbstract) {
    this.formGroup.get("choice").setValue(docType.id);
  }

  quickBreadcrumbChange(id: string) {
    this.parent = id;
    const index = this.path.findIndex((item) => item.id === id);
    this.path = this.path.splice(0, index + 1);
  }
}
