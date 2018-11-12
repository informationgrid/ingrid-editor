import {Component, OnInit} from '@angular/core';
import {UserService} from '../../services/user/user.service';
import {User} from '../../+user/user';
import {Observable} from 'rxjs/index';
import {CatalogService} from '../services/catalog.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'ige-catalog-detail',
  templateUrl: './catalog-detail.component.html',
  styleUrls: ['./catalog-detail.component.css']
})
export class CatalogDetailComponent implements OnInit {

  display = false;
  currentUserSelection: string;

  users: Observable<User[]>;
  private catalogName: string;

  constructor(private userService: UserService, private catalogService: CatalogService, private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.catalogName = params['id'];
    });
  }

  ngOnInit() {
    this.users = this.userService.getUsers();
  }

  showCatAdmins() {
    this.display = true;
  }

  addUserAsCatAdmin(selectedUser) {
    console.log('TODO', selectedUser);
    this.catalogService.setCatalogAdmin(this.catalogName, selectedUser.value.login)
      .subscribe();
  }

}
