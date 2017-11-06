import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SelectRenderComponent } from './renderComponents/select.render.component';
import { ComboEditorComponent } from './editorComponents/combo.editor.component';
import { FormsModule } from '@angular/forms';
import { TitleRenderComponent } from './renderComponents/title.render.component';

@NgModule({
  imports: [
    CommonModule, FormsModule
  ],
  declarations: [
    SelectRenderComponent,
    TitleRenderComponent,
    ComboEditorComponent
  ],
  entryComponents: [SelectRenderComponent, TitleRenderComponent, ComboEditorComponent]
})
export class OpentableModule {
}
