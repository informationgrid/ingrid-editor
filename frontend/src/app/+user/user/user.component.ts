import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalService } from '../../services/modal/modal.service';
import { UserService } from '../../services/user/user.service';
import { ErrorService } from '../../services/error.service';
import { User } from '../user';
import { Role } from '../../models/user-role';
import { Observable } from 'rxjs';

@Component( {
  selector: 'ige-user-manager',
  templateUrl: './user.component.html',
  styles: [`
    ::ng-deep .mat-tab-group, ::ng-deep .mat-tab-body-wrapper {
      flex: 1;
    }
  `]
} )
export class UserComponent implements OnInit, AfterViewInit {

  @ViewChild( 'loginRef', {static: true} ) loginRef: ElementRef;

  users: User[];
  currentTab: string;

  selectedUser: User = new User();

  isNewUser = false;

  show = false;

  constructor(private modalService: ModalService, private userService: UserService,
              private errorService: ErrorService) {
  }

  ngOnInit() {
    this.currentTab = 'users';

    this.fetchUsers();
  }

  fetchUsers() {
    this.userService.getUsers().subscribe(
      users => this.users = users ? users : []
      // error => this.errorService.handleOwn('Problem fetching all user', error)
    );
  }

  ngAfterViewInit(): void {
    setTimeout( () => {
      this.show = true;
    }, 0 );
  }

  loadUser(userToLoad: User) {
    console.log( 'user', userToLoad );
    this.isNewUser = false;
    this.userService.getUser( userToLoad.login )
      .subscribe( user => {
        this.selectedUser = user;
        console.log( 'selectedUser:', this.selectedUser );
      } );
  }

  addUser() {
    this.isNewUser = true;
    this.selectedUser = new User();
    setTimeout( () => this.loginRef.nativeElement.focus(), 200 );
  }

  deleteUser(login: string) {
    this.userService.deleteUser( login )
      .subscribe( () => {
          this.selectedUser = new User();
          this.fetchUsers();
        },
        (err: any) => this.modalService.showJavascriptError( err, err.text() )
      );
  }

  saveUser(user: User) {
    let observer: Observable<User> = null;

    // convert roles to numbers
    user.roles = user.roles.map( role => +role );

    if (this.isNewUser) {
      observer = this.userService.createUser( user );

    } else {
      observer = this.userService.saveUser( user );

    }

    // send request and handle error
    observer.subscribe(
      () => {
        this.isNewUser = false;
        this.fetchUsers();
      }, (err: any) => {
        if (err.status === 406) {
          if (this.isNewUser) {
            this.modalService.showJavascriptError( 'Es existiert bereits ein Benutzer mit dem Login: ' + this.selectedUser.login );
          } else {
            this.modalService.showJavascriptError( 'Es existiert kein Benutzer mit dem Login: ' + this.selectedUser.login );
          }
        } else {
          this.modalService.showJavascriptError( err, err.text() );
        }
      } );
  }

  onSubmit() {

  }

}
