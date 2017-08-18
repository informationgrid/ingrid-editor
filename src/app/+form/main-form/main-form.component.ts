import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { Container, FieldBase } from '../controls';
import { PartialGeneratorField } from '../controls/field-partial-generator';

@Component({
  selector: 'ige-main-form',
  templateUrl: './main-form.component.html',
  styleUrls: ['./main-form.component.css']
})
export class MainFormComponent implements OnInit {

  @Input() form: FormGroup;
  @Input() fields: FieldBase<any>[];
  @Output() onAddSection = new EventEmitter<any>();

  expandedField = {};

  constructor() {
  }

  ngOnInit() {
  }

  removeArrayGroup(name: string, pos: number) {
    // remove from fields definition
    const group = <Container>this.fields.filter(f => (<Container>f).key === name)[0];
    group.children.splice(pos, 1);

    // remove from form element
    const ctrls = <FormArray>this.form.controls[name];
    ctrls.removeAt(pos);
  }

  addSection(data: any) {
    this.onAddSection.emit(data);
  }

}
