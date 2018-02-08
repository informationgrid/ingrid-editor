import { Component, OnInit } from '@angular/core';
import { UserService } from '../../+user/user.service';
import { Observable } from 'rxjs/Observable';
import { User } from '../../+user/user';

@Component({
  selector: 'ige-catalog-detail',
  templateUrl: './catalog-detail.component.html',
  styleUrls: ['./catalog-detail.component.css']
})
export class CatalogDetailComponent implements OnInit {

  display = false;
  currentUserSelection: string;

  users: Observable<User[]>;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.users = this.userService.getUsers();
  }

  showCatAdmins() {
    this.display = true;
  }

  addUserAsCatAdmin() {
    console.log('TODO');
  }

}
