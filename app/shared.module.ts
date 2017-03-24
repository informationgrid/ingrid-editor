import {NgModule} from '@angular/core';
import {MetadataTreeComponent} from './+form/sidebars/tree/tree.component';
import {TreeModule} from 'angular2-tree-component';
import {CommonModule} from '@angular/common';
@NgModule({
  imports: [CommonModule, TreeModule],
  declarations: [MetadataTreeComponent],
  exports: [MetadataTreeComponent]
})
export class SharedModule {
}