import { Component, OnInit } from '@angular/core';
import {Role} from '../../models/user-role';

@Component({
  selector: 'ige-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

  roles: Role[];

  constructor() { }

  ngOnInit(): void {
  }

  updateRoles(roles: Role[]) {
    this.roles = roles;
  }
}
