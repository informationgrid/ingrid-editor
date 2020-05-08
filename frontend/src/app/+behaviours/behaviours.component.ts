import {Component, OnInit} from '@angular/core';
import {BehaviourService} from '../services/behavior/behaviour.service';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {FormBuilder, FormGroup} from '@angular/forms';
import {BehaviourQuery} from '../store/behaviour/behaviour.query';
import {PluginInfo} from '../store/behaviour/behaviour.store';
import {tap} from 'rxjs/operators';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  templateUrl: './behaviours.component.html',
  styleUrls: ['./behaviours.component.scss'],
  animations: [
    trigger('openClose', [
      state('collapsed, void', style({height: '0px', 'padding-top': 0, 'padding-bottom': 0, overflow: 'hidden'})),
      state('expanded', style({height: '*'})),
      transition('collapsed => expanded', animate('200ms ease-in')),
      transition('expanded => collapsed', animate('300ms ease-out'))
    ])
  ]
})
export class BehavioursComponent implements OnInit {

  plugins: PluginInfo[];
  selectedPlugins: string[];

  // behaviours: any;
  // behavioursLabel: string[];

  behaviourTab: string;
  expanded: any = {};

  pluginForm: FormGroup = new FormGroup({});
  behaviourForm: FormGroup = new FormGroup({});
  modifiedPluginStates: string[];

  static toggleField(plugin: any) {
    plugin._state === 'collapsed' ? plugin._state = 'expanded' : plugin._state = 'collapsed';
  }

  constructor(private formBuilder: FormBuilder,
              private behaviourQuery: BehaviourQuery,
              private behaviourService: BehaviourService) {
  }

  ngOnInit() {
    // this.behaviourService.initialized.then( () => {
    // this.plugins.push( ...this.statService.getPlugins() );
    // this.plugins.push( ...this.behaviourService.systemBehaviours );
    // this.plugins.forEach(p => p._state = 'collapsed');
    // this.behaviours = this.prepareFormBehaviours(this.behaviourService.behaviours);
    // this.behavioursLabel = Object.keys(this.behaviours);
    this.behaviourTab = 'SYSTEM';

    this.behaviourQuery.selectAll()
      .pipe(
        untilDestroyed(this),
        tap((items: PluginInfo[]) => {
          console.log('Item: ', items);
          const initialForm = items.reduce((acc: any, val: PluginInfo) => {
            acc[val.id] = false;
            return acc;
          }, {});
          this.pluginForm = this.formBuilder.group(initialForm);
          console.log(this.pluginForm.controls);
        })
      )
      .subscribe(items => this.plugins = items);

    this.behaviourQuery.selectActiveId()
      .pipe(
        untilDestroyed(this),
      )
      .subscribe((ids: string[]) => this.updateSelectedIds(ids));

  }

  private updateSelectedIds(ids: string[]) {
    this.selectedPlugins = ids;
    this.modifiedPluginStates = this.plugins.map(plugin => {
      if (plugin.initialActive && ids.indexOf(plugin.id) === -1) {
        return plugin.id;
      } else if (!plugin.initialActive && ids.indexOf(plugin.id) !== -1) {
        return plugin.id;
      } else {
        return null;
      }
    }).filter(mapped => mapped);
  }

  togglePlugin(pluginId: string, isSelected: boolean) {
    if (isSelected) {
      this.behaviourService.enable(pluginId);
    } else {
      this.behaviourService.disable(pluginId);
    }
  }

  /*toggleBehaviour(value: string, isChecked: boolean) {
    isChecked ? this.behaviourService.enable(value) : this.behaviourService.disable(value);
  }*/

  /*private prepareFormBehaviours(behaviours: Behaviour[]) {
    const mapped = {};
    behaviours.forEach(behaviour => {

      // set state to collapsed
      behaviour._state = 'collapsed';

      if (!mapped[behaviour.forProfile]) {
        mapped[behaviour.forProfile] = [];
      }
      mapped[behaviour.forProfile].push(behaviour);
    });
    return mapped;
  }*/

  /*toggleField(plugin: Plugin) {
    plugin._state === 'expanded' ? plugin._state = 'collapsed' : plugin._state = 'expanded';
  }*/
}
