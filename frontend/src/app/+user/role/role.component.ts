import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ModalService} from '../../services/modal/modal.service';
import {RoleService} from '../../services/role/role.service';
import {Group} from '../../models/user-role';
import {Observable} from 'rxjs';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'ige-group-manager',
  templateUrl: './role.component.html'
})
export class RoleComponent implements OnInit {

  @Input() doSave: EventEmitter<void>;
  @Input() doDelete: EventEmitter<void>;

  @Output() canSave = new EventEmitter<boolean>();

  groups: Group[] = [];
  // selectedGroup: Group;

  private isNewGroup = false;
  permissions: any;
  form: FormGroup;

  constructor(private modalService: ModalService,
              private fb: FormBuilder,
              private groupService: RoleService) {
  }

  ngOnInit() {
    this.fetchGroups();

    if (this.doSave) {
      this.doSave.subscribe(() => this.saveGroup(this.form.value));
    }

    if (this.doDelete) {
      this.doDelete.subscribe(() => this.deleteGroup(this.form.value));
    }

    this.form = this.fb.group({
      id: [],
      _type: [],
      name: [],
      description: [],
      permissions: []
    });

    this.form.valueChanges.subscribe(() => this.canSave.emit(this.form.dirty));
  }

  fetchGroups() {
    this.groupService.getGroups().subscribe(groups => this.groups = groups);
  }

  addGroup() {
    this.isNewGroup = true;
    // this.selectedGroup = new Group();
    this.form.setValue({});
    this.canSave.next(true);
  }

  loadGroup(group: Group) {
    this.isNewGroup = false;
    this.groupService.getGroup(group.name)
      .subscribe(fetchedGroup => {
        this.form.reset();
        this.form.setValue(fetchedGroup, {emitEvent: false});
        this.permissions = fetchedGroup.permissions;
      });
  }

  saveGroup(group: Group) {
    let observer: Observable<Group>;
    group.permissions = this.permissions;

    if (this.isNewGroup) {
      observer = this.groupService.createGroup(group);

    } else {
      observer = this.groupService.updateGroup(group);

    }

    // send request and handle error
    observer.subscribe(
      () => {
        this.isNewGroup = false;
        // this.form.reset();
        this.form.markAsPristine();
        this.fetchGroups();
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
          this.form.reset();
          this.fetchGroups();
        },
        (err: any) => this.modalService.showJavascriptError(err, err.text())
      );
  }

}
