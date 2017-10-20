import {NgModule} from '@angular/core';
import {MetadataTreeComponent} from './+form/sidebars/tree/tree.component';
import {TreeModule} from 'angular-tree-component';
import {CommonModule} from '@angular/common';
import {AngularSplitModule} from 'angular-split';
import { FocusDirective } from './directives/focus.directive';

@NgModule({
  imports: [CommonModule, TreeModule, AngularSplitModule],
  declarations: [MetadataTreeComponent, FocusDirective],
  exports: [MetadataTreeComponent, AngularSplitModule, FocusDirective]
})
export class SharedModule {
}
