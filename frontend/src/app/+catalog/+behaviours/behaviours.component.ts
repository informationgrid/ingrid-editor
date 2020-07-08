import {Component, OnInit} from '@angular/core';
import {BehaviourService} from '../../services/behavior/behaviour.service';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {tap} from 'rxjs/operators';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {Plugin} from './plugin';
import {FormlyFormBuilder} from '@ngx-formly/core';
import {FormPluginsService} from '../../+form/form-shared/form-plugins.service';

@UntilDestroy()
@Component({
  selector: 'ige-behaviours',
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
  formPlugins: Plugin[];

  behaviourTab: string;
  expanded: any = {};

  behaviourFields: any = {};
  formBehaviourFields: any = {};


  constructor(private formBuilder: FormBuilder,
              private builder: FormlyFormBuilder,
              private behaviourService: BehaviourService,
              private formPluginsService: FormPluginsService) {
  }

  ngOnInit() {
    this.behaviourTab = 'SYSTEM';

    this.behaviourService.theSystemBehaviours$
      .pipe(
        untilDestroyed(this),
        tap((items: Plugin[]) => this.behaviourFields = this.createModelFromPlugins(items))
      )
      .subscribe(plugins => this.plugins = plugins);

    this.formBehaviourFields = this.createModelFromPlugins(this.formPluginsService.plugins);
    this.formPlugins = this.formPluginsService.plugins;

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

  hasDirtyForm() {
    return Object.keys(this.behaviourFields)
      .some(key => this.behaviourFields[key].active.dirty || this.behaviourFields[key].form.dirty);
  }

  updateFieldState(plugin: Plugin, checked: boolean) {
    const form = this.behaviourFields[plugin.id].form;
    checked ? form.enable() : form.disable();
  }

  private createModelFromPlugins(items: Plugin[]) {
    return items.reduce((acc: any, val: Plugin) => {
      const formGroup = new FormGroup({});

      // initially set disabled state for fields
      if (val.fields.length > 0 && !val.isActive) {
        // we need to build form when we want to set it disabled initialially
        this.builder.buildForm(formGroup, val.fields, val.data ? val.data : {}, {});
        formGroup.disable();
      }

      acc[val.id] = {
        form: formGroup,
        active: new FormControl(val.isActive),
        modified: val.isActive !== val.defaultActive,
        fields: val.fields,
        data: val.data ? val.data : {}
      };
      return acc;
    }, {})
  }
}
