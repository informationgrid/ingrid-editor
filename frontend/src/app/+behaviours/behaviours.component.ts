import {Component, OnInit} from '@angular/core';
import {BehaviourService} from '../services/behavior/behaviour.service';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {BehaviourQuery} from '../store/behaviour/behaviour.query';
import {tap} from 'rxjs/operators';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {Plugin} from './plugin';

@UntilDestroy()
@Component({
  templateUrl: './behaviours.component.html',
  styleUrls: ['./behaviours.component.scss']/*,
  animations: [
    trigger('openClose', [
      state('collapsed, void', style({height: '0px', 'padding-top': 0, 'padding-bottom': 0, overflow: 'hidden'})),
      state('expanded', style({height: '*'})),
      transition('collapsed => expanded', animate('200ms ease-in')),
      transition('expanded => collapsed', animate('300ms ease-out'))
    ])
  ]*/
})
export class BehavioursComponent implements OnInit {

  plugins: Plugin[];

  form: { [x: string]: FormGroup } = {};

  behaviourTab: string;
  expanded: any = {};

  pluginForm: FormGroup = new FormGroup({});

  behaviourFields: any = {};


  constructor(private formBuilder: FormBuilder,
              private behaviourQuery: BehaviourQuery,
              private behaviourService: BehaviourService) {
  }

  ngOnInit() {
    this.behaviourTab = 'SYSTEM';

    this.behaviourService.theSystemBehaviours$
      .pipe(
        untilDestroyed(this),
        tap((items: Plugin[]) => {
          console.log('Item: ', items);
          const initialForm = items.reduce((acc: any, val: Plugin) => {
            acc[val.id] = false;
            return acc;
          }, {});
          this.pluginForm = this.formBuilder.group(initialForm);
          console.log(this.pluginForm.controls);
        }),
        tap((items: Plugin[]) => {

          this.behaviourFields = items
            .reduce((acc: any, val: Plugin) => {
              const formGroup = new FormGroup({});
              // initially set disabled state for fields
              if (val.fields.length > 0 && !val.isActive) {
                setTimeout(() => formGroup.disable());
              }
              acc[val.id] = {
                form: formGroup,
                active: new FormControl(val.isActive),
                modified: val.isActive !== val.defaultActive,
                fields: val.fields,
                data: val.data ? val.data : {}
              };
              return acc;
            }, {});
        })
      )
      .subscribe(plugins => this.plugins = plugins);

  }

  save() {

    // TODO: improve by saving only modified behaviours states
    const behaviours = this.behaviourService.theSystemBehaviours$.value
      .map(item => {
        return {
          _id: item.id,
          active: this.behaviourFields[item.id]?.active.value,
          data: this.behaviourFields[item.id]?.form.value
        }
      });

    this.behaviourService.saveBehaviours(behaviours);

  }

  hasInvalidForm() {
    return Object.keys(this.behaviourFields)
      .some(key => this.behaviourFields[key].form.invalid);
  }

  updateFieldState(plugin: Plugin, checked: boolean) {
    const form = this.behaviourFields[plugin.id].form;
    checked ? form.enable() : form.disable();
  }
}
