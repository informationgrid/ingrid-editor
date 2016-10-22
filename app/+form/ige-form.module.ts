import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {DynamicFieldComponent} from "./dynamic-field.component";
import {FormToolbarComponent} from "./toolbar/form-toolbar.component";
import {ReactiveFormsModule, FormsModule} from "@angular/forms";
import {DynamicFormComponent} from "./dynamic-form.component";
import {LeafletComponent} from "./leaflet/leaflet.component";
import {routing} from "./ige-form.routing";
import {BrowserComponent} from "./sidebars/browser/browser.component";
import {ModalModule} from "ng2-modal";
import {OpenTable} from "./opentable/opentable.component";
import {PartialGenerator} from "./partialGenerator/partial-generator.component";

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, routing, ModalModule],
  declarations: [FormToolbarComponent, DynamicFieldComponent, OpenTable, PartialGenerator, BrowserComponent, LeafletComponent, DynamicFormComponent],
  exports: []
})
export class IgeFormModule {
}
