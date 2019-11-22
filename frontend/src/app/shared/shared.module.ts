import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatTreeModule} from "@angular/material/tree";
import {AngularSplitModule} from "angular-split";
import {TreeComponent} from '../+form/sidebars/tree/tree.component';

@NgModule({
  imports: [CommonModule, MatIconModule, MatTreeModule, AngularSplitModule.forRoot(), MatButtonModule, MatProgressBarModule],
  declarations: [TreeComponent],
  exports: [TreeComponent, MatIconModule, MatButtonModule]
})
export class SharedModule {
}
