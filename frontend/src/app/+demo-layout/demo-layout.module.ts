import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormComponent} from './form/form.component';
import {RouterModule, Routes} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDialogModule } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
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
