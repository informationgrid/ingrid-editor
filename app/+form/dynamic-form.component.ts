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

interface FormData {
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

  @ViewChild('newDocModal') newDocModal: any;
  @ViewChild('deleteConfirmModal') deleteConfirmModal: any;

  fields: FieldBase<any>[] = [];
  form: FormGroup;
  payLoad = '';
  data: FormData = {};
  behaviours: Behaviour[];
  observers: Subscription[] = [];
  saving = false;
  error = false;
  choiceNewDoc: string = 'UVP';

  docTypes = [
    {id: 'UVP', label: 'UVP'},
    {id: 'ISO', label: 'ISO'}
  ];

  constructor(private qcs: FormControlService, private behaviourService: BehaviourService,
              private formularService: FormularService, private formToolbarService: FormToolbarService,
              private storageService: StorageService, private route: ActivatedRoute) {

    let loadSaveSubscriber = this.formToolbarService.getEventObserver().subscribe(eventId => {
      console.log('generic toolbar handler');
      if (eventId === 'SAVE') {
        this.save();
      } else if (eventId === 'NEW_DOC') {
        this.newDoc();
      } else if (eventId === 'DELETE') {
        this.deleteDoc();
      }
    });

    this.observers.push(loadSaveSubscriber);

    this.route.params.subscribe(params => {
      let id = params['id'];
      this.load(id);
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
      Object.assign(container, this.form.value);
      container._id = this.data._id;
      container._profile = this.formularService.currentProfile;
    });

    this.storageService.datasetsChanged.asObservable().subscribe(() => this.load(this.data._id));
  }

  // noinspection JSUnusedGlobalSymbols
  ngAfterViewInit(): any {
    Split(['#sidebar', '#form'], {
      gutterSize: 8,
      sizes: [10, 90],
      minSize: [200]
    });
  }

  /*onSubmit() {
    this.payLoad = JSON.stringify(this.form.value);
    console.log('before emit', this.form);
    let errors: any[] = [];
    // this.formularService.onBeforeSave.emit( {data: this.form.value, errors: errors} );
    this.storageService.beforeSave.next({data: this.form.value, errors: errors});
    console.log('after emit', errors);
  }*/

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
      console.log( 'loaded data:', data );
      let profile = data._profile;
      // switch to the right profile depending on the data
      if (this.formularService.currentProfile !== profile) {
        this.switchProfile(profile);
      }
      // set correct number of repeatable fields
      this.updateRepeatableFields(data);

      this.data = data;
    });
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

    this.form = this.qcs.toFormGroup(this.fields);

    this.formularService.currentProfile = profile;

    setTimeout(() => {
      /*let map = new L.Map( 'map', {
       zoomControl: false,
       center: new L.LatLng( 40.731253, -73.996139 ),
       zoom: 12,
       minZoom: 4,
       maxZoom: 19,
       layers: [new L.TileLayer( "http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
       attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
       } )]
       } );

       L.control.zoom( {position: 'topright'} ).addTo( map );
       // L.control.layers(this.mapService.baseMaps).addTo(map);
       L.control.scale().addTo( map );*/

      this.behaviourService.apply(this.form, profile);
    });
  }

  updateRepeatableFields(data: any) {
    // set repeatable fields according to loaded data
    let repeatFields = this.fields.filter(pField => (<Container>pField).isRepeatable);
    repeatFields.forEach((repeatField: Container) => {
      this.resetArrayGroup(repeatField.useGroupKey);
      let repeatSize = data[repeatField.useGroupKey] ? data[repeatField.useGroupKey].length : 0;
      for (let i = 1; i < repeatSize; i++) this.addArrayGroup(repeatField.useGroupKey);
    });
  }

  resetArrayGroup(name: string) {
    let group = <Container>this.fields.filter(f => (<Container>f).useGroupKey === name)[0];
    while (group.children.length > 1) group.children.pop();
    let formArray = <FormArray>this.form.controls[name];
    while (formArray.length > 1) formArray.removeAt(formArray.length - 1);
  }

  addArrayGroup(name: string) {
    debugger;
    let group = <Container>this.fields.filter(f => (<Container>f).useGroupKey === name)[0];
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
    let group = <Container>this.fields.filter(f => (<Container>f).useGroupKey === name)[0];
    group.children.splice(pos, 1);
    let ctrls = <FormArray>this.form.controls[name];
    ctrls.removeAt(pos);
  }
}
