import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {take} from "rxjs/operators";
import {TreeQuery} from "../../../store/tree/tree.query";
import {AddressTreeQuery} from "../../../store/address-tree/address-tree.query";
import {DocumentAbstract} from "../../../store/document/document.model";
import {FormBuilder, FormGroup, ValidationErrors, Validators} from "@angular/forms";
import {DocType} from "../new-doc/new-doc.plugin";
import {Observable, of} from "rxjs";

export interface CreateDocOptions {
  choice?: string;
  title?: string;
  parent?: string;
}

export interface CreateAddressOptions {
  choice?: string;
  firstName?: string;
  lastName?: string;
  organization?: string;
  parent?: string;
}

@Component({
  selector: 'ige-new-document',
  templateUrl: './new-document.component.html',
  styleUrls: ['./new-document.component.scss']
})
export class NewDocumentComponent implements OnInit {

  result: CreateDocOptions | CreateAddressOptions = {};
  selectedPage = 0;
  path: string[] = [];
  forAddress: boolean;
  formGroup: FormGroup;
  documentTypes: Observable<DocumentAbstract[]>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NewDocumentComponent>,
    private treeQuery: TreeQuery, private addressTreeQuery: AddressTreeQuery) {

    this.documentTypes = this.prepareDocumentTypes(data.docTypes);

  }

  ngOnInit() {
    // select first/default document type
    this.result.choice = this.data.docTypes[0].id;
    this.result.parent = this.data.parent;
    this.forAddress = this.data.forAddress;

    if (this.forAddress) {
      this.formGroup = this.fb.group({
        firstName: [''],
        lastName: [''],
        organization: ['']
      }, {
        validators: this.nameOrOganizationValidator
      });
    } else {
      this.formGroup = this.fb.group({
        title: ['', Validators.required],
        choice: ['', Validators.required]
      });
    }

    const query = this.forAddress ? this.addressTreeQuery : this.treeQuery;

    query.pathTitles$
      .pipe(
        take(1) // TODO: check if correctly unsubsribed
      )
      .subscribe(path => {
        const selectedNode = query.getOpenedDocument();
        if (selectedNode && selectedNode._profile !== 'FOLDER') {
          this.path = [...path];
          this.path.pop();
        } else {
          this.path = path;
        }
      });
  }

  nameOrOganizationValidator(control: FormGroup): ValidationErrors | null {
    const firstName = control.get('firstName');
    const lastName = control.get('lastName');
    const organization = control.get('organization');

    return !firstName.value && !lastName.value && !organization.value ? {'nameOrOrganization': true} : null;
  };

  updateParent(parentInfo: any) {
    this.result.parent = parentInfo.parent;
    this.path = parentInfo.path;
  }

  private prepareDocumentTypes(docTypes: DocType[]): Observable<DocumentAbstract[]> {
    return of(docTypes.map(dt => {
      return {
        id: dt.id,
        title: dt.label,
        icon: dt.icon
      } as DocumentAbstract;
    }));
  }

  setDocType(docType: DocumentAbstract) {
    this.formGroup.get("choice").setValue(docType.id);
  }

  createDoc() {
    this.updateResultWithFormData();
    this.dialogRef.close(this.result);
  }

  private updateResultWithFormData() {
    if (this.forAddress) {
      (<CreateAddressOptions>this.result).firstName = this.formGroup.get('firstName').value;
      (<CreateAddressOptions>this.result).lastName = this.formGroup.get('lastName').value;
      (<CreateAddressOptions>this.result).organization = this.formGroup.get('organization').value;
      (<CreateAddressOptions>this.result).choice = this.formGroup.get('choice').value;

    } else {
      (<CreateDocOptions>this.result).title = this.formGroup.get('title').value;
      (<CreateDocOptions>this.result).choice = this.formGroup.get('choice').value;
    }
  }
}
