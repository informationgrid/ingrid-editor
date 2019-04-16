import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormComponent} from './form/form.component';
import {RouterModule, Routes} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {
  MatButtonModule,
  MatCheckboxModule, MatDialogModule,
  MatDividerModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule, MatSelectModule
} from "@angular/material";
import {FlexLayoutModule} from "@angular/flex-layout";
import { ContextHelpComponent } from './form/context-help/context-help.component';
import {DragDropModule} from "@angular/cdk/drag-drop";

const routes: Routes = [
  {
    path: '',
    component: FormComponent
  }
];


@NgModule({
  declarations: [FormComponent, ContextHelpComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    DragDropModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatSelectModule,
    MatDialogModule,
    FlexLayoutModule
  ],
  entryComponents: [
    ContextHelpComponent
  ]
})
export class DemoLayoutModule { }
