import {NgModule} from '@angular/core';
import {MetadataTreeComponent} from './+form/sidebars/tree/tree.component';
import {TreeModule} from 'angular-tree-component';
import {CommonModule} from '@angular/common';
import {AngularSplitModule} from 'angular-split';

@NgModule({
  imports: [CommonModule, TreeModule, AngularSplitModule],
  declarations: [MetadataTreeComponent],
  exports: [MetadataTreeComponent, AngularSplitModule]
})
export class SharedModule {
}