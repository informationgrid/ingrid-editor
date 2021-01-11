import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router';
import {PagePermission} from './page-permission';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Permissions} from '../user';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'ige-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss']
})
export class PermissionsComponent implements OnInit {

  // @Input() data: Permissions;

  @Output() permissions = new EventEmitter<any>();

  pagePermissions: PagePermission[];
  formGroup: FormGroup;

  private _data: Permissions;
  @Input() set data(perms: Permissions) {
    this._data = perms;
    if (this.formGroup) {
      this.updateForm()
    }
/*    this.formGroup = this.fb.group({
      pages: this.fb.group(this.router.config.filter(route => route.data).reduce((prev, curr) => {
        prev[curr.path] = this.fb.control(this.data.pages[curr.path] === true);
        return prev;
      }, {})),
      actions: this.fb.group({demo: [this.data.actions.demo], test: [this.data.actions.test]}),
      documents: this.fb.control(this.data.documents),
      addresses: this.fb.control(this.data.addresses)
    })*/;
  }


  constructor(private router: Router,
              private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      pages: this.fb.group(this.router.config.filter(route => route.data).reduce((prev, curr) => {
        prev[curr.path] = this.fb.control(false);
        return prev;
      }, {})),
      actions: this.fb.group({demo: [false], test: [false]}),
      documents: this.fb.control([]),
      addresses: this.fb.control([])
    });

    if (this._data) {
      this.updateForm();
    }

    this.formGroup.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(value => this.permissions.next(value));

    this.pagePermissions = this.router.config
      .filter(route => route.data)
      .map(route => new PagePermission(route.path, route.data.title));
  }

  updateForm() {
    this.formGroup.reset();
    // const newValue = Object.assign(this.formGroup.value, this._data);
    this.formGroup.patchValue(this._data);
  }

}
