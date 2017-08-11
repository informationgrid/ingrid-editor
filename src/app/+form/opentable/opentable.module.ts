import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SelectRenderComponent } from './renderComponents/select.render.component';
import { ComboEditorComponent } from './editorComponents/combo.editor.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    SelectRenderComponent,
    ComboEditorComponent
  ],
  entryComponents: [SelectRenderComponent, ComboEditorComponent]
})
export class OpentableModule {
}
