import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SelectRenderComponent } from './renderComponents/select.render.component';
import { ComboEditorComponent } from './editorComponents/combo.editor.component';
import { ComboBoxModule } from 'ng2-combobox';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule, FormsModule, ComboBoxModule
  ],
  declarations: [
    SelectRenderComponent,
    ComboEditorComponent
  ],
  entryComponents: [SelectRenderComponent, ComboEditorComponent]
})
export class OpentableModule {
}
