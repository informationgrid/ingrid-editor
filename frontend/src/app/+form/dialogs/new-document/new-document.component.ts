import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {take} from 'rxjs/operators';
import {TreeQuery} from '../../../store/tree/tree.query';
import {AddressTreeQuery} from '../../../store/address-tree/address-tree.query';
import {DocumentAbstract} from '../../../store/document/document.model';
import {FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {DocType} from './new-doc.plugin';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {ModalService} from '../../../services/modal/modal.service';
import {ProfileQuery} from '../../../store/profile/profile.query';
import {IgeDocument} from '../../../models/ige-document';
import {HttpErrorResponse} from '@angular/common/http';
import {DocumentService} from '../../../services/document/document.service';
import {Router} from '@angular/router';

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
  private pathIds: string[];
  numDocumentTypes: number;
  initialActiveDocumentType = new BehaviorSubject<Partial<DocumentAbstract>>(null);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private fb: FormBuilder,
              private router: Router,
              private modalService: ModalService,
              private profileQuery: ProfileQuery,
              private documentService: DocumentService,
              public dialogRef: MatDialogRef<NewDocumentComponent>,
              private treeQuery: TreeQuery, private addressTreeQuery: AddressTreeQuery) {


  }

  ngOnInit() {
    /*if (!this.data.docTypes || this.data.docTypes.length === 0) {
      this.modalService.showJavascriptError('No document types available');
      return;
    }
    // select first/default document type
    this.result.choice = this.data.docTypes[0].id;*/
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
      this.profileQuery.addressProfiles
        .subscribe(result => {
          const docTypes = result
            .map(profile => ({id: profile.id, label: profile.label, icon: profile.iconClass}))
            .sort((a, b) => a.label.localeCompare(b.label));
          this.documentTypes = this.prepareDocumentTypes(docTypes);
          this.result.choice = docTypes[0].id; // 'AddressDoc'
        });
    } else {
      this.formGroup = this.fb.group({
        title: ['', Validators.required],
        choice: ['', Validators.required]
      });
      this.profileQuery.documentProfiles
        .subscribe(result => {
          const docTypes = result
            .map(profile => ({id: profile.id, label: profile.label, icon: profile.iconClass}))
            .sort((a, b) => a.label.localeCompare(b.label));
          this.documentTypes = this.prepareDocumentTypes(docTypes);
          this.formGroup.get('choice').setValue(docTypes[0].id);
          this.initialActiveDocumentType.next(docTypes[0]);
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
    this.path = parentInfo.path.map(node => node.title);
    this.pathIds = parentInfo.path.map(node => node.id);
  }

  private prepareDocumentTypes(docTypes: DocType[]): Observable<DocumentAbstract[]> {
    this.numDocumentTypes = docTypes.length;

    return of(docTypes.map(dt => {
      return {
        id: dt.id,
        title: dt.label,
        icon: dt.icon,
        _state: 'P'
      } as DocumentAbstract;
    }));
  }

  setDocType(docType: DocumentAbstract) {
    this.formGroup.get('choice').setValue(docType.id);
  }

  async createDoc() {
    this.updateResultWithFormData();
    const savedDoc = await this.saveNewDocument(this.result);

    const page = this.forAddress ? '/address' : '/form';
    this.router.navigate([page, {id: savedDoc._id}]);
    this.dialogRef.close(savedDoc._id);
  }

  private updateResultWithFormData() {
    if (this.forAddress) {
      (<CreateAddressOptions>this.result).firstName = this.formGroup.get('firstName').value;
      (<CreateAddressOptions>this.result).lastName = this.formGroup.get('lastName').value;
      (<CreateAddressOptions>this.result).organization = this.formGroup.get('organization').value;
      // (<CreateAddressOptions>this.result).choice = this.formGroup.get('choice').value;

    } else {
      (<CreateDocOptions>this.result).title = this.formGroup.get('title').value;
      (<CreateDocOptions>this.result).choice = this.formGroup.get('choice').value;
    }
  }

  /**
   * Create a new document and save it in the backend.
   * @param options
   */
  saveNewDocument(options: CreateDocOptions | CreateAddressOptions) {
    const newDoc = new IgeDocument(options.choice, options.parent);

    if (this.forAddress) {
      newDoc.firstName = (<CreateAddressOptions>options).firstName;
      newDoc.lastName = (<CreateAddressOptions>options).lastName;
      newDoc.organization = (<CreateAddressOptions>options).organization;
    } else {
      newDoc.title = (<CreateDocOptions>options).title;
    }

    return this.saveForm(newDoc);

  }

  private saveForm(data: IgeDocument) {
    return this.documentService.save(data, true, this.forAddress, this.pathIds).then(
      null,
      (err: HttpErrorResponse) => {
        throw err;
      });
  }
}
