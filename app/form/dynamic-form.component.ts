import {Component, Input, OnInit, AfterViewInit} from '@angular/core';
import {FormGroup, REACTIVE_FORM_DIRECTIVES} from '@angular/forms';
import {DynamicFieldComponent} from './dynamic-field.component';
import {QuestionControlService} from '../services/question-control.service';
import {FieldBase} from './controls/field-base';
import {BehaviourService} from '../services/behaviour/behaviour.service';
import {FormularService} from '../services/formular/formular.service';
import {Behaviour, BehavioursDefault} from '../services/behaviour/behaviours';
import {CustomInput} from './table/table.component';

interface FormData {
  taskId?: string;
  title?: string;
}

@Component( {
  selector: 'dynamic-form',
  template: require( './dynamic-form.component.html' ),
  directives: [DynamicFieldComponent, REACTIVE_FORM_DIRECTIVES, CustomInput],
  providers: [QuestionControlService, BehaviourService, FormularService, BehavioursDefault]
} )
export class DynamicFormComponent implements OnInit, AfterViewInit {

  fields: FieldBase<any>[] = [];
  form: FormGroup;
  payLoad = '';
  data: FormData = {};
  behaviours: Behaviour[];

  constructor(private qcs: QuestionControlService, private behaviourService: BehaviourService,
              private formularService: FormularService) {
    this.fields = formularService.getFields();
  }

  // noinspection JSUnusedGlobalSymbols
  ngOnInit() {
    this.behaviours = this.behaviourService.behaviours;
    debugger;
    this.behaviours.forEach( (behave) => {
      if (behave.controls) {
        behave.controls.forEach( (additionalField => {
          this.fields.push( additionalField );
        }) );
      }
    } );
    this.fields.sort( (a, b) => a.order - b.order );
    this.form = this.qcs.toFormGroup( this.fields );
  }

  // noinspection JSUnusedGlobalSymbols
  ngAfterViewInit(): any {
    this.behaviourService.apply( this.form );
  }

  onSubmit() {
    this.payLoad = JSON.stringify( this.form.value );
    console.log( 'before emit', this.form );
    let errors: any[] = [];
    this.formularService.onBeforeSave.emit( {data: this.form.value, errors: errors} );
    console.log( 'after emit', errors );
  }

  load(id: string) {
    // since data always stays the same there's no change detection if we load the same data again
    // even if we already have changed the formular
    // since loading will be async, we only have to reset the data first
    this.data = {};
    this.formularService.loadData( id ).then( data => this.data = data );
  }

  toggleBehaviour(event: MouseEvent) {
    let target = <HTMLInputElement>event.target;
    target.checked ? this.behaviourService.enable( target.value, this.form ) : this.behaviourService.disable( target.value );
  }
}
