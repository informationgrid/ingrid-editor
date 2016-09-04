import {Component, OnInit, AfterViewInit, OnDestroy} from "@angular/core";
import {FormGroup, FormArray} from "@angular/forms";
import {FormControlService} from "../services/form-control.service";
import {FieldBase} from "./controls/field-base";
import {BehaviourService} from "../services/behaviour/behaviour.service";
import {FormularService} from "../services/formular/formular.service";
import {Behaviour} from "../services/behaviour/behaviours";
import {FormToolbarService} from "./toolbar/form-toolbar.service";
import {Subscription} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {Container} from "./controls/container";

interface FormData {
  taskId?: string;
  title?: string;
}

@Component({
  selector: 'dynamic-form',
  template: require('./dynamic-form.component.html'),
  providers: [FormControlService]
})
export class DynamicFormComponent implements OnInit, OnDestroy, AfterViewInit {

  fields: FieldBase<any>[] = [];
  form: FormGroup;
  payLoad = '';
  data: FormData = {};
  behaviours: Behaviour[];
  observers: Subscription[] = [];

  constructor(private qcs: FormControlService, private behaviourService: BehaviourService,
              private formularService: FormularService, private formToolbarService: FormToolbarService,
              private route: ActivatedRoute) {

    let loadSaveSubscriber = this.formToolbarService.getEventObserver().subscribe(eventId => {
      console.log('generic toolbar handler');
      if (eventId === 'LOAD') {
        this.load('0');
      } else if (eventId === 'SAVE') {
        this.save();
      } else if (eventId === 'NEW_DOC') {
        this.new();
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
  }

  // noinspection JSUnusedGlobalSymbols
  ngAfterViewInit(): any {
  }

  onSubmit() {
    this.payLoad = JSON.stringify(this.form.value);
    console.log('before emit', this.form);
    let errors: any[] = [];
    // this.formularService.onBeforeSave.emit( {data: this.form.value, errors: errors} );
    this.formularService.beforeSave.next({data: this.form.value, errors: errors});
    console.log('after emit', errors);
  }

  new() {
    let profile = 'ISO';
    if (this.formularService.currentProfile !== profile) {
      this.switchProfile(profile);
    }
    this.data = {};
  }

  load(id: string) {
    // since data always stays the same there's no change detection if we load the same data again
    // even if we already have changed the formular
    // since loading will be async, we only have to reset the data first
    this.data = {};
    this.formularService.loadData(id).then(data => {
      let profile = data._profile;
      if (this.formularService.currentProfile !== profile) {
        this.switchProfile(profile);
      }
      this.data = data;
    });
  }

  save() {
    debugger;
    let errors: string[] = [];
    alert('This form is valid: ' + this.form.valid);
    this.formularService.saveData();
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

      // TODO: this.behaviourService.apply(this.form, profile);
    });
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
  }

  removeArrayGroup(name: string, pos: number) {
    let group = <Container>this.fields.filter(f => (<Container>f).useGroupKey === name)[0];
    group.children.splice(pos, 1);
    let ctrls = <FormArray>this.form.controls[name];
    ctrls.removeAt(pos);
  }
}
