import {Component, Inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {PagePermission} from './page-permission';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'ige-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss']
})
export class PermissionsComponent implements OnInit {

  pagePermissions: PagePermission[];

  constructor(private router: Router,
              @Inject( MAT_DIALOG_DATA ) public data: any) { }

  ngOnInit(): void {
    this.pagePermissions = this.router.config
      .filter(route => route.data)
      .map( route => new PagePermission('', route.data.title))
  }

}
