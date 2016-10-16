import {Component, OnInit, AfterViewInit, OnDestroy, ViewChild} from '@angular/core';
import {FormGroup, FormArray} from '@angular/forms';
import {FormControlService} from '../services/form-control.service';
import {FieldBase, Container} from './controls';
import {BehaviourService} from '../services/behaviour/behaviour.service';
import {FormularService} from '../services/formular/formular.service';
import {Behaviour} from '../services/behaviour/behaviours';
import {FormToolbarService} from './toolbar/form-toolbar.service';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {Split} from '../../node_modules/split.js/split';
// import {StorageDummyService as StorageService} from '../services/storage/storage.dummy.service';
import {StorageService} from '../services/storage/storage.service';
import {ModalService} from "../services/modal/modal.service";
import {Modal} from "ng2-modal";
import {PartialGeneratorField} from "./controls/field-partial-generator";

interface FormData extends Object {
  _id?: string;
  taskId?: string;
  title?: string;
}

@Component({
  selector: 'dynamic-form',
  template: require('./dynamic-form.component.html'),
  styles: [require('./dynamic-form.component.css')],
  providers: [FormControlService]
})
export class DynamicFormComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('newDocModal') newDocModal: Modal;
  @ViewChild('deleteConfirmModal') deleteConfirmModal: Modal;

  fields: FieldBase<any>[] = [];
  form: FormGroup;
  data: FormData = {};
  behaviours: Behaviour[];
  observers: Subscription[] = [];
  saving = false;
  error = false;
  choiceNewDoc: string = 'UVP';
  expandedField = {};

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
        this.modalService.showError('Die Detailansicht ist noch nicht implementiert.');
      }
    });

    this.observers.push(loadSaveSubscriber);

    this.behaviourService.initialized.then(() => {
      this.route.params.subscribe(params => {
        let id = params['id'];
        this.load(id);
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
    this.formularService.formDataSubject.asObservable().subscribe( (container: any) => {
      container.form = this.form;
      container.value = {
        _id: this.data._id,
        _profile: this.formularService.currentProfile
      };
      Object.assign(container.value, this.form.value);
    });

    this.storageService.datasetsChanged.asObservable().subscribe(() => this.load(this.data._id));
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
    })
  }

  newDoc() {
    this.newDocModal.open();
  }

  prepareNewDoc() {
    let profile = this.choiceNewDoc;
    if (this.formularService.currentProfile !== profile) {
      this.switchProfile(profile);
    }
    this.data = {mainInfo: {taskId: 999}};
    this.newDocModal.close();
  }

  load(id: string) {
    // since data always stays the same there's no change detection if we load the same data again
    // even if we already have changed the formular
    // since loading will be async, we only have to reset the data first

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
    data._profile = this.formularService.currentProfile;
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

    this.form.reset();
    this.data = this.form.value;

    this.formularService.currentProfile = profile;

  }

  updateRepeatableFields(data: any) {
    // set repeatable fields according to loaded data
    let repeatFields = this.fields.filter(pField => (<Container>pField).isRepeatable);
    repeatFields.forEach((repeatField: Container) => {
      this.resetArrayGroup(repeatField.key);
      let repeatSize = data[repeatField.key] ? data[repeatField.key].length : 0;
      for (let i = 1; i < repeatSize; i++) this.addArrayGroup(repeatField.key);
    });
  }

  resetArrayGroup(name: string) {
    let group = <Container>this.fields.filter(f => (<Container>f).key === name)[0];
    while (group.children.length > 1) group.children.pop();
    let formArray = <FormArray>this.form.controls[name];
    while (formArray.length > 1) formArray.removeAt(formArray.length - 1);
  }

  addArrayGroup(name: string) {
    let group = <Container>this.fields.filter(f => (<Container>f).key === name)[0];
    let newGroupArray: any[] = [];
    group.children[0].forEach((c: any) => newGroupArray.push(Object.assign({}, c)));
    group.children.push(
      newGroupArray
    );

    let additionalFormGroup = this.qcs.toFormGroup(newGroupArray);
    let formArray = <FormArray>this.form.controls[name];
    // set link to parent so that we are updated correctly
    additionalFormGroup.setParent(formArray);
    formArray.controls.push(additionalFormGroup);
    this.data[name].push({});
  }

  removeArrayGroup(name: string, pos: number) {
    let group = <Container>this.fields.filter(f => (<Container>f).key === name)[0];
    group.children.splice(pos, 1);
    let ctrls = <FormArray>this.form.controls[name];
    ctrls.removeAt(pos);
  }

  addSection(data: any) {
    debugger;
    // use target-key or similar to have no conflicts with other fields with same name
    let field = <PartialGeneratorField>this.fields.filter(f => (<Container>f).key === data.key)[0];
    // let fieldPartial = this.fields.filter(f => (<Container>f).targetKey === data.key)[0];
    let partial = field.partials.filter( part => part.key === data.section )[0];
    // let newGroupArray: any[] = [];
    // newGroupArray.push(Object.assign({}, partial));
    let clonedPartial = Object.assign({}, partial);
    // field.children[0].forEach((c: any) => newGroupArray.push(Object.assign({}, c)));
    field.children.push(clonedPartial);

    let additionalFormGroup = this.qcs.toFormGroup([partial]);
    let formArray = <FormArray>this.form.controls[data.key];
    // set link to parent so that we are updated correctly
    additionalFormGroup.setParent(formArray);
    formArray.controls.push(additionalFormGroup);

    if (!this.data[data.key]) this.data[data.key] = [];
    this.data[data.key].push({});
  }
}
