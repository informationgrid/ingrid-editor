import {Component, Inject, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {map, share} from 'rxjs/operators';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {User} from '../../../../+user/user';
import {UserService} from '../../../../services/user/user.service';

@Component({
  selector: 'ige-add-user-dialog',
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.scss']
})
export class AddUserDialogComponent implements OnInit {

  users: Observable<User[]>;

  constructor(private userService: UserService, @Inject( MAT_DIALOG_DATA ) public data: any) {

  }

  ngOnInit() {
    this.users = this.userService.getUsers().pipe(
      map(users => users
        .filter(user => this.data.excludeUserIDs.indexOf(user.login) === -1)
      )
    );
  }

}
