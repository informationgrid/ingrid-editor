import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FieldBase } from '../controls/field-base';
import { FormArray, FormGroup } from '@angular/forms';
import { Container } from '../controls/container';

@Component({
  selector: 'ige-main-form-tabs',
  templateUrl: './main-form-tabs.component.html',
  styleUrls: ['./main-form-tabs.component.css']
})
export class MainFormTabsComponent implements OnInit, OnChanges {
  @Input() form: FormGroup;
  @Input() fields: FieldBase<any>[];
  @Input() isRootLevel = true;
  @Input() blurAllBut = null;
  @Output() onAddSection = new EventEmitter<any>();

  expandedField = {};

  categories: FieldBase<any>[];

  currentCategory: string;

  constructor() {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    // throw new Error('Method not implemented.');
    console.log( 'Categories:', changes );
    if (changes.fields) {
      this.categories = this.fields.filter(field => field.controlType === 'rubric');
      this.currentCategory = this.categories.length > 0 ? this.categories[0].label : null;
    }
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
