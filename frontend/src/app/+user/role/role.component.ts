import {Component, OnInit} from '@angular/core';
import {ModalService} from '../../services/modal/modal.service';
import {RoleService} from '../../services/role/role.service';
import {Group} from '../../models/user-role';
import {Observable, Subject} from 'rxjs';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Permissions} from '../user';
import {debounceTime, tap} from 'rxjs/operators';
import {UntilDestroy} from '@ngneat/until-destroy';
import {dirtyCheck} from '@ngneat/dirty-check-forms';

@UntilDestroy()
@Component({
  selector: 'ige-group-manager',
  templateUrl: './role.component.html'
})
export class RoleComponent implements OnInit {

  isDirty$: Observable<boolean>;
  state$ = new Subject<any>();

  groups: Group[] = [];

  isNewGroup = false;
  form: FormGroup;

  initialValue = {
    id: null,
    _type: '',
    name: '',
    description: '',
    permissions: new Permissions()
  };

  constructor(private modalService: ModalService,
              private fb: FormBuilder,
              private groupService: RoleService) {
  }

  ngOnInit() {
    this.fetchGroups().subscribe();

    this.form = this.fb.group({
      id: [],
      _type: [],
      name: [],
      description: [],
      permissions: []
    });

    this.isDirty$ = dirtyCheck(this.form, this.state$, {debounce: 100})
      // add debounceTime with same as in dirtyCheck to prevent save button flicker
      .pipe(debounceTime(100));
  }

  fetchGroups(): Observable<Group[]> {
    return this.groupService.getGroups()
      .pipe(tap(groups => this.groups = groups));
  }

  addGroup() {
    this.isNewGroup = true;
    this.form.setValue(this.initialValue);
  }

  loadGroup(id: string) {
    this.isNewGroup = false;
    this.form.disable();
    this.groupService.getGroup(id)
      .subscribe(fetchedGroup => {
        this.form.reset(fetchedGroup);
        this.form.enable();
        // we need to make a general object of the group in order to compare
        // its state with the form value correctly
        this.state$.next(JSON.parse(JSON.stringify(fetchedGroup)));
      });
  }

  saveGroup() {
    let observer: Observable<Group>;
    const group = this.form.value;

    if (this.isNewGroup) {
      observer = this.groupService.createGroup(group);

    } else {
      observer = this.groupService.updateGroup(group);

    }

    // send request and handle error
    observer.subscribe(
      () => {
        this.isNewGroup = false;
        this.fetchGroups()
          .pipe(tap(() => this.form.markAsPristine()))
          .subscribe();
      }, (err: any) => {
        if (err.status === 406) {
          if (this.isNewGroup) {
            this.modalService.showJavascriptError('Es existiert bereits ein Benutzer mit dem Login: ' + this.form.get('name'));
          } else {
            this.modalService.showJavascriptError('Es existiert kein Benutzer mit dem Login: ' + this.form.get('name'));
          }
        } else {
          throw err;
        }
      });
  }

  deleteGroup(group: Group) {
    this.groupService.deleteGroup(group.id)
      .subscribe(
        () => {
          this.fetchGroups()
            .pipe(
              tap(() => this.form.reset())
            )
            .subscribe();
        }
      );
  }

}
