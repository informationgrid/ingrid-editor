import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {routing} from './user.routing';
import {UserComponent} from './user.component';
import {UserService} from '../services/user/user.service';
import {FormsModule} from '@angular/forms';
import {RoleService} from '../services/role/role.service';
import {RoleComponent} from './role.component';
import {SharedModule} from '../shared.module';
import {MatButtonModule, MatIconModule, MatInputModule, MatListModule, MatTabsModule} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';
import {RouterModule, Routes} from "@angular/router";
import {AngularSplitModule} from "angular-split";

const routes: Routes = [
  {
    path: '',
    component: UserComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), AngularSplitModule.forChild(), FormsModule, CommonModule, routing, SharedModule,
            MatTabsModule, MatIconModule, MatButtonModule, MatInputModule, MatListModule,
            FlexLayoutModule
  ],
  declarations: [UserComponent, RoleComponent],
  providers: [UserService, RoleService],
  exports: [RouterModule]
})
export class UserModule {

}
