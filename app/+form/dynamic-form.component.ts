import {Component, OnInit, AfterViewInit, OnDestroy, ViewChild} from '@angular/core';
import {FormGroup, FormArray} from '@angular/forms';
import {FormControlService} from '../services/form-control.service';
import {FieldBase, Container} from './controls';
import {BehaviourService} from '../services/behaviour/behaviour.service';
import {FormularService} from '../services/formular/formular.service';
import {Behaviour} from '../services/behaviour/behaviours';
import {FormToolbarService} from './toolbar/form-toolbar.service';
import {Subscription, Observable} from 'rxjs';
import {ActivatedRoute, CanDeactivate, RouterStateSnapshot, ActivatedRouteSnapshot} from '@angular/router';
import {Split} from '../../node_modules/split.js/split';
// import {StorageDummyService as StorageService} from '../services/storage/storage.dummy.service';
import {StorageService} from '../services/storage/storage.service';
import {ModalService} from '../services/modal/modal.service';
import {Modal} from 'ng2-modal';
import {PartialGeneratorField} from './controls/field-partial-generator';
import {UpdateType} from '../models/update-type.enum';

interface FormData extends Object {
  _id?: string;
  _parent?: string;
  taskId?: string;
  title?: string;
}

@Component({
  selector: 'dynamic-form',
  template: require('./dynamic-form.component.html'),
  styles: [require('./dynamic-form.component.css')],
  providers: [FormControlService]
})
export class DynamicFormComponent implements OnInit, OnDestroy, AfterViewInit, CanDeactivate<DynamicFormComponent> {

  @ViewChild('newDocModal') newDocModal: Modal;
  @ViewChild('deleteConfirmModal') deleteConfirmModal: Modal;
  @ViewChild('discardConfirmModal') discardConfirmModal: Modal;

  fields: FieldBase<any>[] = [];
  form: FormGroup;
  data: FormData = {};
  behaviours: Behaviour[];
  observers: Subscription[] = [];
  saving = false;
  error = false;
  choiceNewDoc: string = 'UVP';
  expandedField = {};
  addToRoot: boolean = false;
  newDocAdded: boolean = false;

  // the id to remember when dirty check was true
  // a modal will be shown and if changes shall be discarded then use this id to load dataset afterwards again
  pendingId: string;

  constructor(private qcs: FormControlService, private behaviourService: BehaviourService,
              private formularService: FormularService, private formToolbarService: FormToolbarService,
              private storageService: StorageService, private modalService: ModalService,
              private route: ActivatedRoute) {

    let loadSaveSubscriber = this.formToolbarService.getEventObserver().subscribe(eventId => {
      console.log('generic toolbar handler', eventId);
      if (eventId === 'SAVE') {
        this.save();
      } else if (eventId === 'NEW_DOC') {
        this.newDoc();
      } else if (eventId === 'DELETE') {
        this.deleteDoc();
      } else if (eventId === 'PRINT') {
        this.modalService.showNotImplemented();
      }
    });

    this.observers.push(loadSaveSubscriber);

    this.behaviourService.initialized.then(() => {
      this.route.params.subscribe(params => {
        let id = params['id'];
        if (id !== '-1') {
          this.load(id);
        }
      });
    });
  }

  ngOnDestroy() {
    console.log('destroy');
    this.observers.forEach(observer => observer.unsubscribe());
    this.behaviourService.behaviours
      .filter(behave => behave.isActive)
      .forEach(behave => behave.unregister());
  }

  // noinspection JSUnusedGlobalSymbols
  ngOnInit() {
    this.formularService.currentProfile = null;

    // TODO: emit current form value on demand
    // register to an publisher in the form/storage service and send the value of this form
    // this can be used for publis, revert, detail, compare, ...
    this.formularService.formDataSubject$.subscribe( (container: any) => {
      container.form = this.form;
      container.value = {
        _id: this.data._id,
        _profile: this.formularService.currentProfile
      };
      Object.assign(container.value, this.form.value);
    });

    this.storageService.datasetsChanged$.subscribe((msg) => {
      if (msg.type === UpdateType.Update) this.load( this.data._id );
    });
  }

  // noinspection JSUnusedGlobalSymbols
  ngAfterViewInit(): any {
    Split(['#sidebar', '#form'], {
      gutterSize: 8,
      sizes: [25, 75],
      minSize: [200]
    });

    // add form errors check when saving/publishing
    this.storageService.beforeSave.asObservable().subscribe((message: any) => {
      message.errors.push({ invalid: this.form.invalid });
      console.log('in observer');
    });
  }

  canDeactivate(component: DynamicFormComponent, route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<DynamicFormComponent>|Promise<DynamicFormComponent>|boolean {
    console.log( 'can deactive (form)' );
    /*if (this.form && this.form.dirty) {
      this.pendingId = null;
      this.discardConfirmModal.open();
      return false;
    }
    return true;*/
    if (component.hasChanges()) {
      return window.confirm('Do you really want to cancel?');
    }
    return true;
  }

  newDoc() {
    this.newDocModal.open();
  }

  prepareNewDoc() {
    let profile = this.choiceNewDoc;
    let previousId = this.data._id;

    if (this.form) this.form.reset();

    if (this.formularService.currentProfile !== profile) {
      this.switchProfile(profile);
    }

    this.data = this.form.value;
    if (!this.addToRoot) {
      this.data._parent = previousId;
    }

    // notify browser/tree of new dataset
    this.storageService.datasetsChanged.next({type: UpdateType.New, data: {_profile: profile, _parent: this.data._parent}});
    this.newDocAdded = true;

    this.newDocModal.close();
  }

  handleNewDatasetOnLeave() {
    // remove new doc if one was created
    if (this.newDocAdded) {
      this.storageService.datasetsChanged.next({type: UpdateType.Delete, data: {_id: -1, _parent: this.data._parent}});
      this.newDocAdded = false;
    }
  }

  discardChanges() {
    this.form.reset();
    this.load(this.pendingId);

    this.handleNewDatasetOnLeave();

    this.discardConfirmModal.close();
  }

  load(id: string) {
    // since data always stays the same there's no change detection if we load the same data again
    // even if we already have changed the formular
    // since loading will be async, we only have to reset the data first

    // check if form was changed and ask for saving data
    if (this.form && this.form.dirty) {
      this.pendingId = id;
      this.discardConfirmModal.open();
      // TODO: notify sidebar to select previously dataset before we changed
      return;
    } else {
      this.handleNewDatasetOnLeave();
    }

    // TODO: remove new dataset if not saved already -> we only want at most one new dataset at a time!


    if (id === undefined) return;
    // TODO: use form.reset() which should work now! but data also has to be reset otherwise form elements won't be updated
    if (this.form) {
      this.form.reset();
      this.data = this.form.value; // this._prepareInitialData(this.form);
    }

    this.storageService.loadData(id).subscribe(data => {
      console.log('loaded data:', data);
      let profile = data._profile;
      // let profileSwitched = false;

      // switch to the right profile depending on the data
      if (this.formularService.currentProfile !== profile) {
        this.switchProfile(profile);
        // profileSwitched = true;
        // set data delayed so that form can build up in DOM and events can register
        setTimeout( () => {
          this.behaviourService.apply(this.form, profile);
          // after profile switch inform the subscribers about it to recognize initial data set
          this.storageService.afterProfileSwitch.next(data);
          // setTimeout(() => this.setData(data), 1000 );
          this.setData(data);
        }, 0 );
      } else {
        setTimeout( () => {
          this.setData(data);
        });
      }
    });
  }

  setData(data: any) {
      // set correct number of repeatable fields
      this.updateRepeatableFields(data);

      this.storageService.afterLoadAndSet.next(data);
      this.data = data;

  }

  /*_prepareInitialData(form: FormGroup): any {
    let data = {};
    for (let key in form.controls) {
      let ctrl = form.controls[key];
      if (ctrl instanceof FormGroup) {
        data[ctrl.useGroupKey] = {};
        for (let groupKey in ctrl.controls) {
          data[ctrl.useGroupKey][groupKey] = '';
        }
      }
    }
    return data;
  }*/

  save() {
    console.log('valid:', this.form.valid);

    let errors: string[] = [];
    // alert('This form is valid: ' + this.form.valid);
    let data = this.form.value;
    // attach profile type to data, which is not reflected in form directly by value
    data._id = this.data._id;
    data._parent = this.data._parent;
    data._profile = this.formularService.currentProfile;

    // during save the listeners for dataset changes are already called
    // this.form.reset(this.form.value);
    this.form.markAsPristine();

    this.storageService.saveData(data).then(res => {
      this.data._id = res._id;
      this.saving = true;
      setTimeout(() => this.saving = false, 3000);
    }, (err) => {
      this.error = err;
      setTimeout(() => this.error = false, 5000);
    });
  }

  deleteDoc() {
    this.deleteConfirmModal.open();
  }

  doDelete() {
    this.storageService.delete(this.data._id);
    this.deleteConfirmModal.close();
    this.form.reset();
  }

  switchProfile(profile: string) {
    this.behaviourService.unregisterAll();
    this.fields = this.formularService.getFields(profile);
    // this.fields.sort( (a, b) => a.order - b.order );


    // add controls from active behaviours
    // TODO: refactor to a function
    this.behaviours = this.behaviourService.behaviours;
    this.behaviours
      .filter(behave => behave.isActive && behave.forProfile === profile)
      .forEach((behave) => {
        if (behave.controls) {
          behave.controls.forEach((additionalField => {
            this.fields.push(additionalField);
          }));
        }
      });

    // sort fields by its order field
    this.fields.sort((a, b) => a.order - b.order).slice(0);

    this.form = this.qcs.toFormGroup(this.fields);

    // since objects in fields array are not cloned, it can have the previous repeatable fields set
    // which we have to reset
    // TODO: improve by making fields really immutable from service
    let repeatFields = this.fields.filter(pField => (<Container>pField).isRepeatable);
    repeatFields.forEach((repeatField: Container) => {
      this.resetArrayGroup(repeatField.key);
    });

    this.form.reset();
    this.data = this.form.value;

    this.formularService.currentProfile = profile;

  }

  updateRepeatableFields(data: any) {
    // set repeatable fields according to loaded data
    let repeatFields = this.fields.filter(pField => (<Container>pField).isRepeatable);

    repeatFields.forEach((repeatField: Container) => {
      this.resetArrayGroup(repeatField.key);
      if (data[repeatField.key]) {
        let repeatData = data[repeatField.key];
        for (let i = 0; i < repeatData.length; i++) {
          let partialKey = Object.keys(repeatData[i])[0];
          this.addArrayGroup(repeatField, partialKey);
        }
      }
    });
  }

  resetArrayGroup(name: string) {
    let group = <Container>this.fields.filter(f => (<Container>f).key === name)[0];

    // remove from definition fields
    while (group.children.length > 0) group.children.pop();
    let formArray = <FormArray>this.form.controls[name];

    // remove from form element
    while (formArray.length > 0) formArray.removeAt(formArray.length - 1);
  }

  addArrayGroup(repeatField: any, key: string) {
    let partial = this.addPartialToField(repeatField, key);

    this.addPartialToForm(partial, <FormArray>this.form.controls[repeatField.key]);

    if (!this.data[repeatField.key]) this.data[repeatField.key] = [];
    this.data[repeatField.key].push({});
  }

  removeArrayGroup(name: string, pos: number) {
    // remove from fields definition
    let group = <Container>this.fields.filter(f => (<Container>f).key === name)[0];
    group.children.splice(pos, 1);

    // remove from form element
    let ctrls = <FormArray>this.form.controls[name];
    ctrls.removeAt(pos);

    // remove from data object
    this.data[name].splice(pos, 1);
  }

  addPartialToField(field: any, partialKey: string): any {
    let partial = field.partials.filter( (part: any) => part.key === partialKey )[0];
    let clonedPartial = Object.assign({}, partial);
    field.children.push(clonedPartial);
    return partial;
  }

  addPartialToForm(partial: any, formArray: FormArray) {
    let additionalFormGroup = this.qcs.toFormGroup([partial]);
    // let complete = {};
    // complete[partial.key] = additionalFormGroup;
    // let additionalComplete = new FormGroup( complete );
    // set link to parent so that we are updated correctly
    // additionalComplete.setParent(formArray);
    // formArray.controls.push(additionalComplete);
    additionalFormGroup.setParent(formArray);
    formArray.controls.push(additionalFormGroup);
  }

  addSection(data: any) {
    // use target-key or similar to have no conflicts with other fields with same name
    let field = <PartialGeneratorField>this.fields.filter(f => (<Container>f).key === data.key)[0];
    // let partial = field.partials.filter( part => part.key === data.section )[0];
    // let clonedPartial = Object.assign({}, partial);
    // field.children.push(clonedPartial);
    let partial = this.addPartialToField(field, data.section);
    let formArray = <FormArray>this.form.controls[data.key];
    this.addPartialToForm(partial, formArray);

    // let additionalFormGroup = this.qcs.toFormGroup([partial]);
    // let complete = {};
    // complete[partial.key] = additionalFormGroup;
    // let additionalComplete = new FormGroup( complete );
    // let formArray = <FormArray>this.form.controls[data.key];
    // // set link to parent so that we are updated correctly
    // additionalComplete.setParent(formArray);
    // formArray.controls.push(additionalComplete);

    if (!this.data[data.key]) this.data[data.key] = [];
    let newSectionData = {};
    newSectionData[data.section] = {};
    this.data[data.key].push(newSectionData);
  }
}
