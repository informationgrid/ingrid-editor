import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {routing} from './user.routing';
import {UserComponent} from './user.component';
import {UserService} from '../services/user/user.service';
import {FormsModule} from '@angular/forms';
import {RoleService} from '../services/role/role.service';
import {RoleComponent} from './role.component';
import {SharedModule} from '../shared.module';
import {MatButtonModule, MatIconModule, MatInputModule, MatTabsModule} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';

@NgModule({
  imports: [FormsModule, CommonModule, routing, SharedModule,
            MatTabsModule, MatIconModule, MatButtonModule, MatInputModule,
            FlexLayoutModule
  ],
  declarations: [UserComponent, RoleComponent],
  providers: [UserService, RoleService],
  exports: []
})
export class UserModule {

}
