import {Component, Input, OnInit, AfterViewInit} from "@angular/core";
import {FormGroup, REACTIVE_FORM_DIRECTIVES} from "@angular/forms";
import {DynamicFormQuestionComponent} from "./dynamic-form-question.component";
import {QuestionControlService} from "./services/question-control.service";
import {FieldBase} from "./controls/field-base";
import {BehaviourService} from "./services/behaviour.service";
import {FormularService} from "./services/formular.service";
import {Behaviour} from "./services/behaviours";

interface FormData {
  taskId?: string;
  title?: string;
}


@Component( {
  selector: 'dynamic-form',
  template: require( './dynamic-form.component.html' ),
  directives: [DynamicFormQuestionComponent, REACTIVE_FORM_DIRECTIVES],
  providers: [QuestionControlService, BehaviourService]
} )
export class DynamicFormComponent implements OnInit, AfterViewInit {

  @Input() fields: FieldBase<any>[] = [];
  form: FormGroup;
  payLoad = '';
  data: FormData = {};
  behaviours: Behaviour[];

  constructor(private qcs: QuestionControlService, private behaviourService: BehaviourService,
  private formularService: FormularService) {
  }

  ngOnInit() {
    this.form = this.qcs.toFormGroup( this.fields );
    this.behaviours = this.behaviourService.behaviours;
  }

  ngAfterViewInit(): any {
    this.behaviourService.apply(this.form);
  }

  onSubmit() {
    this.payLoad = JSON.stringify( this.form.value );
  }

  load(id) {
    // since data always stays the same there's no change detection if we load the same data again
    // even if we already have changed the formular
    // since loading will be async, we only have to reset the data first
    this.data = {};
    this.formularService.loadData( id ).then(data => this.data = data);
  }

  toggleBehaviour(event: MouseEvent) {
    debugger;
    let target = event.target;
    target.checked ? this.behaviourService.enable(target.value, this.form) : this.behaviourService.disable(target.value);
  }
}
