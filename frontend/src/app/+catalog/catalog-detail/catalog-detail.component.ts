import {Component, Inject, OnInit} from '@angular/core';
import {UserService} from '../../services/user/user.service';
import {User} from '../../+user/user';
import {Observable} from 'rxjs';
import {CatalogService} from '../services/catalog.service';
import {ConfigService} from '../../services/config/config.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {NewCatalogDialogComponent} from '../../dialogs/catalog/new-catalog/new-catalog-dialog.component';

@Component({
  selector: 'ige-catalog-detail',
  templateUrl: './catalog-detail.component.html',
  styleUrls: ['./catalog-detail.component.css']
})
export class CatalogDetailComponent implements OnInit {

  display = false;
  currentUserSelection: string;

  users: Observable<User[]>;
  private catalogId: string;

  constructor(public dialogRef: MatDialogRef<NewCatalogDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private userService: UserService, private catalogService: CatalogService,
              private configService: ConfigService) {
    this.catalogId = data;
  }

  ngOnInit() {
    this.users = this.userService.getUsers();
  }

  showCatAdmins() {
    this.display = true;
  }

  addUserAsCatAdmin(selectedUser) {
    console.log('TODO', selectedUser);

    // get this user again to update internal user info to update webapp
    this.catalogService.setCatalogAdmin(this.catalogId, selectedUser.value.login)
      .subscribe(() => this.configService.getCurrentUserInfo());
    this.dialogRef.close();
  }

  deleteCatalog() {
    this.catalogService.deleteCatalog(this.catalogId).subscribe();
    this.dialogRef.close();
  }

}
