import {NgModule} from '@angular/core';
import {MetadataTreeComponent} from './+form/sidebars/tree/tree.component';
import {CommonModule} from '@angular/common';
import {MatButtonModule, MatIconModule, MatTreeModule} from "@angular/material";
import {AngularSplitModule} from "angular-split";

@NgModule({
  imports: [CommonModule, MatIconModule, MatTreeModule, AngularSplitModule.forRoot(), MatButtonModule],
  declarations: [MetadataTreeComponent],
  exports: [MetadataTreeComponent, MatIconModule, MatButtonModule]
})
export class SharedModule {
}
