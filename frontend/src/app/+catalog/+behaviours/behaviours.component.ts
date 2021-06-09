import {Component, Inject, Input, OnInit} from '@angular/core';
import {BehaviourFormatBackend, BehaviourService} from '../../services/behavior/behaviour.service';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {tap} from 'rxjs/operators';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {Plugin} from './plugin';
import {FormlyFormBuilder} from '@ngx-formly/core';
import {FormPluginToken} from '../../tokens/plugin.token';
import {ActivatedRoute, ParamMap} from "@angular/router";

@UntilDestroy()
@Component({
  selector: 'ige-behaviours',
  templateUrl: './behaviours.component.html',
  styleUrls: ['./behaviours.component.scss']
})
export class BehavioursComponent implements OnInit {

  type: string;

  plugins: any;
  // plugins: { [x: string]: Plugin[] };

  expanded: any = {};

  fields: any = {};
  title: string;

  constructor(private formBuilder: FormBuilder,
              private builder: FormlyFormBuilder,
              @Inject(FormPluginToken) private formPlugins: Plugin[],
              private route: ActivatedRoute,
              private behaviourService: BehaviourService) {
  }

  ngOnInit() {
    this.type = this.route.snapshot.paramMap.get('type');

    if (this.type === 'form') {
      this.title = 'Formularkonfiguration';
      this.behaviourService.applyActiveStates(this.formPlugins);
      this.plugins = this.groupBy(this.formPlugins, (plugin: Plugin) => plugin.group || 'Andere');
      this.fields = this.createModelFromPlugins(this.formPlugins);
    } else {
      this.title = 'Katalogverhalten';
      this.behaviourService.theSystemBehaviours$
        .pipe(
          untilDestroyed(this),
          tap(systemPlugins => {
            this.fields = this.createModelFromPlugins(systemPlugins);
            this.plugins = this.groupBy(systemPlugins, (plugin: Plugin) => plugin.group || 'Andere');
          })
        )
        .subscribe();
    }

  }

  private groupBy(array: any[], callback: (x: any) => any) {
    return array.reduce(
      (previous, current, index, a, field = callback(current)) => ((previous[field] || (previous[field] = [])).push(current), previous),
      {});
  }

  save() {

    // TODO: improve by saving only modified behaviours states
    const behaviours = this.type === 'form' ? this.formPlugins : this.behaviourService.theSystemBehaviours$.value;
    const updatedBehaviours = behaviours
      .map(item => this.mapBehaviourForBackend(item));

    this.behaviourService.saveBehaviours(updatedBehaviours);

  }

  private mapBehaviourForBackend(item: Plugin): BehaviourFormatBackend {
    return {
      _id: item.id,
      active: this.fields[item.id]?.active.value,
      data: this.fields[item.id]?.form.value
    };
  }

  hasInvalidForm() {
    return Object.keys(this.fields)
      .some(key => this.fields[key].form.invalid);
  }

  hasDirtyForm() {
    return Object.keys(this.fields)
      .some(key => this.fields[key].active.dirty || this.fields[key].form.dirty);
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
    }, {});
  }
}
