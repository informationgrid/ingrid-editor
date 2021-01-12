import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ModalService} from '../../services/modal/modal.service';
import {RoleService} from '../../services/role/role.service';
import {Group} from '../../models/user-role';
import {merge, Observable, Subject} from 'rxjs';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Permissions} from '../user';
import {map, tap} from 'rxjs/operators';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'ige-group-manager',
  templateUrl: './role.component.html'
})
export class RoleComponent implements OnInit {

  @Input() doSave: EventEmitter<void>;
  @Input() doDelete: EventEmitter<void>;

  @Output() canSave = new EventEmitter<boolean>();

  groups: Group[] = [];

  isNewGroup = false;
  permissions: Permissions;
  form: FormGroup;

  initialValue = {
    id: '',
    _type: '',
    name: '',
    description: '',
    permissions: new Permissions()
  }
  manualDirtySet = new Subject<boolean>();

  constructor(private modalService: ModalService,
              private fb: FormBuilder,
              private groupService: RoleService) {
  }

  ngOnInit() {
    this.fetchGroups().subscribe();

    if (this.doSave) {
      this.doSave
        .pipe(untilDestroyed(this))
        .subscribe(() => this.saveGroup(this.form.value));
    }

    if (this.doDelete) {
      this.doDelete
        .pipe(untilDestroyed(this))
        .subscribe(() => this.deleteGroup(this.form.value));
    }

    this.form = this.fb.group({
      id: [],
      _type: [],
      name: [],
      description: [],
      permissions: []
    });

    merge(this.form.valueChanges, this.manualDirtySet)
      .pipe(
        map(() => this.form.dirty)
      )
      .subscribe(dirty => this.canSave.emit(dirty));
  }

  fetchGroups(): Observable<Group[]> {
    return this.groupService.getGroups()
      .pipe(tap(groups => this.groups = groups));
  }

  addGroup() {
    this.isNewGroup = true;
    this.permissions = new Permissions();
    this.form.setValue(this.initialValue);
    this.manualDirtySet.next(true);
  }

  loadGroup(group: Group) {
    this.isNewGroup = false;
    this.groupService.getGroup(group.name)
      .subscribe(fetchedGroup => {
        this.form.reset();
        this.form.setValue(fetchedGroup);
        this.manualDirtySet.next(false);
        this.permissions = fetchedGroup.permissions;
      });
  }

  saveGroup(group: Group) {
    let observer: Observable<Group>;

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
            .pipe(tap(() => this.form.reset()))
            .subscribe();
        }
      );
  }

  updatePermissions(newPermissions: Permissions) {
    this.form.patchValue({permissions: newPermissions});
    this.manualDirtySet.next(true);
  }
}
