import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ListFormWizardsComponent} from './list-form-wizards/list-form-wizards.component';
import {OpenDataWizardComponent} from './open-data-wizard/open-data-wizard.component';
import {RouterModule} from '@angular/router';
import {WizardService} from './wizard.service';

@NgModule( {
  imports: [
    CommonModule, RouterModule
  ],
  providers: [WizardService],
  declarations: [ListFormWizardsComponent, OpenDataWizardComponent],
  exports: [ListFormWizardsComponent, OpenDataWizardComponent]
} )
export class IgeWizardModule {
}
