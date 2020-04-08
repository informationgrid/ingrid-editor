import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {FormPluginsService} from '../../+form/form-shared/form-plugins.service';
import {FormularService} from '../../+form/formular.service';
import {AddressTreeStore} from '../../store/address-tree/address-tree.store';
import {DocumentService} from '../../services/document/document.service';
import {AkitaNgFormsManager} from '@datorama/akita-ng-forms-manager';
import {FormlyFieldConfig} from '@ngx-formly/core';
import {Subject} from 'rxjs';
import {TreeAction} from '../../+form/sidebars/tree/tree.component';
import {IgeDocument} from '../../models/ige-document';

@Component({
  selector: 'ige-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit, OnDestroy {
  sidebarWidth = 20;
  form = new FormGroup({});
  fields: FormlyFieldConfig[] = [];
  model: IgeDocument | any = {};
  formOptions: any;
  updateTree = new Subject<TreeAction[]>();
  initialActiveNodeId: any;
  initialExpandNodes = new Subject<string[]>();
  initialTreeExpand = false;

  constructor(private router: Router, private route: ActivatedRoute,
              private formPlugins: FormPluginsService, private formService: FormularService,
              private formsManager: AkitaNgFormsManager,
              private addressTreeStore: AddressTreeStore, private documentService: DocumentService) {
    formPlugins.setAddressConfiguration();

    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id !== undefined && !this.initialTreeExpand) {

        this.initialTreeExpand = true;

        this.documentService.getPath(id, true).subscribe(path => {
          this.initialActiveNodeId = path.pop();
          this.initialExpandNodes.next(path);
        });

      }
      this.loadDocument(id);
    });
  }

  ngOnInit() {
  }

  rememberSizebarWidth($event: any) {

  }

  handleSelection(selectedDocsId: string[]) {
    this.addressTreeStore.setActive(selectedDocsId);
  }

  handleLoad(selectedDocIds: string[]) {

    this.router.navigate(['/address', {id: selectedDocIds[0]}]);
  }

  storePath(path: string[]) {
    this.addressTreeStore.update({
      activePathTitles: path
    })
  }

  /**
   * Load a document and prepare the form for the data.
   * @param {string} id is the ID of document to be loaded
   */
  loadDocument(id: string) {

    if (id === undefined) {
      return;
    }

    this.documentService.load(id, true)
      .subscribe(
        doc => this.updateFormWithData(doc),
        error => console.error('Could not load document', error));
  }

  updateFormWithData(data) {

    if (data === null) {
      return;
    }

    const profile = data._profile;

    if (profile === null) {
      console.error('This document does not have any profile');
      return;
    }

    const needsProfileSwitch = this.formService.currentProfile !== profile;
    try {

      // switch to the right profile depending on the data
      this.form = new FormGroup({});
      this.formsManager.upsert('address', this.form);
      if (needsProfileSwitch) {
        this.fields = this.switchProfile(profile);
        // this.sections = this.getSectionsFromProfile(this.fields);
      }

      this.model = {...data};
      this.form.markAsPristine();
      this.form.markAsUntouched();

    } catch (ex) {
      console.error(ex);
      // this.modalService.showJavascriptError(ex);
    }
  }

  switchProfile(profile: string): FormlyFieldConfig[] {
    this.formService.currentProfile = profile;

    return this.formService.getFields(profile);
  }

  ngOnDestroy(): void {
  }
}
