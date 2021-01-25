import {Component, OnInit} from '@angular/core';
import {ModalService} from '../../services/modal/modal.service';
import {GroupService} from '../../services/role/group.service';
import {Group} from '../../models/user-group';
import {Observable, Subject} from 'rxjs';
import {AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn} from '@angular/forms';
import {Permissions} from '../user';
import {debounceTime, tap} from 'rxjs/operators';
import {UntilDestroy} from '@ngneat/until-destroy';
import {dirtyCheck} from '@ngneat/dirty-check-forms';
import {ConfirmDialogComponent, ConfirmDialogData} from '../../dialogs/confirm/confirm-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@UntilDestroy()
@Component({
  selector: 'ige-group-manager',
  templateUrl: './group.component.html'
})
export class GroupComponent implements OnInit {

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
  selectedGroup = new FormControl();

  constructor(private modalService: ModalService,
              private fb: FormBuilder,
              private dialog: MatDialog,
              private groupService: GroupService) {
  }

  ngOnInit() {
    this.fetchGroups().subscribe();

    this.form = this.fb.group({
      id: [],
      _type: [],
      name: ['', this.forbiddenNameValidator()],
      description: [],
      permissions: []
    });

    this.isDirty$ = dirtyCheck(this.form, this.state$, {debounce: 100})
      // add debounceTime with same as in dirtyCheck to prevent save button flicker
      .pipe(debounceTime(100));
  }

  fetchGroups(): Observable<Group[]> {
    const currentValue = this.selectedGroup.value;

    return this.groupService.getGroups()
      .pipe(
        tap(groups => this.groups = groups),
        tap(() => setTimeout(() => this.selectedGroup.setValue(currentValue)))
      );
  }

  addGroup() {
    this.isNewGroup = true;
    this.form.setValue(this.initialValue);
    this.state$.next(this.initialValue);
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

  deleteGroup(id: string) {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Gruppe löschen',
        message: 'Möchten Sie die Gruppe wirklich löschen?'
      } as ConfirmDialogData
    }).afterClosed().subscribe(result => {
      if (result) {
        this.groupService.deleteGroup(id)
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
    })
  }

  forbiddenNameValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const forbidden = this.groups.filter(group => group.name === control.value).length > 0;
      return forbidden ? {forbiddenName: {value: control.value}} : null;
    };
  }

}
