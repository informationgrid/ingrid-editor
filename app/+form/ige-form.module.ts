import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {DynamicFieldComponent} from "./dynamic-field.component";
import {FormToolbarComponent} from "./toolbar/form-toolbar.component";
import {ReactiveFormsModule, FormsModule} from "@angular/forms";
import {DynamicFormComponent} from "./dynamic-form.component";
import {LeafletComponent} from "./leaflet/leaflet.component";
import {CustomInput} from "./table/table.component";
import {AgGridNg2} from "ag-grid-ng2";
import {routing} from "./ige-form.routing";

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, routing],
  declarations: [FormToolbarComponent,DynamicFieldComponent, CustomInput, LeafletComponent, DynamicFormComponent, AgGridNg2],
  exports: []
})
export class IgeFormModule {}
