import {Component, Inject, OnInit} from '@angular/core';
import {UserService} from '../../services/user/user.service';
import {User} from '../../+user/user';
import {Observable} from 'rxjs';
import {CatalogService} from '../services/catalog.service';
import {ConfigService} from '../../services/config/config.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {NewCatalogDialogComponent} from '../../dialogs/catalog/new-catalog/new-catalog-dialog.component';
import {map, share} from 'rxjs/operators';
import {Catalog} from '../services/catalog.model';

export interface CatalogDetailResponse {
  deleted?: boolean;
  settings?: Catalog
}

@Component({
  selector: 'ige-catalog-detail',
  templateUrl: './catalog-detail.component.html',
  styleUrls: ['./catalog-detail.component.css']
})
export class CatalogDetailComponent implements OnInit {

  display = false;

  users: Observable<User[]>;
  catAdmins: Observable<User[]>;
  otherUsers: Observable<User[]>;

  selectedUsers: string[] = [];

  constructor(public dialogRef: MatDialogRef<NewCatalogDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public catalog: Catalog,
              private userService: UserService, private catalogService: CatalogService,
              private configService: ConfigService) {
  }

  ngOnInit() {
    this.users = this.userService.getUsers().pipe(share());
    this.userService.getAssignedUsers(this.catalog.id).subscribe(result => {
      this.catAdmins = this.users.pipe(
        map(users => users.filter(user => result.indexOf(user.login) !== -1))
      );
      this.otherUsers = this.users.pipe(
        map(users => users.filter(user => result.indexOf(user.login) === -1))
      );
    });

    this.catalogService.getCatalog(this.catalog.id);
  }

  showCatAdmins() {
    this.display = true;
  }

  submit(selectedUser) {
    console.log('TODO', selectedUser);

    // get this user again to update internal user info to update webapp
    this.catalogService.setCatalogAdmin(this.catalog.id, this.selectedUsers)
      .subscribe(() => this.configService.getCurrentUserInfo());
    const response: CatalogDetailResponse = {settings: this.catalog};
    this.dialogRef.close(response);
  }

  deleteCatalog() {
    const response: CatalogDetailResponse = {deleted: true};
    this.dialogRef.close(response);
  }

}
