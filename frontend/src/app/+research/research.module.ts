import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ResearchComponent} from './research/research.component';
import {routing} from './research.routing';


@NgModule({
  declarations: [ResearchComponent],
  imports: [
    CommonModule,
    routing
  ]
})
export class ResearchModule {
}
