import {Component, OnInit} from '@angular/core';
import {Plugin} from './plugin';
import {Behaviour} from './behaviours';
import {BehaviourService} from '../services/behavior/behaviour.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component( {
  templateUrl: './behaviours.component.html',
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
    }
  `],
  animations: [
    trigger('openClose', [
      state('collapsed, void', style({ height: '0px', 'padding-top': 0, 'padding-bottom': 0, overflow: 'hidden' })),
      state('expanded', style({ height: '*' })),
      transition('collapsed => expanded', animate('200ms ease-in')),
      transition('expanded => collapsed', animate('300ms ease-out'))
    ])
  ]
} )
export class PluginsComponent implements OnInit {

  plugins: Plugin[] = [];
  behaviours: any;
  behavioursLabel: string[];

  behaviourTab: string;
  expanded: any = {};

  pluginForm: FormGroup = new FormGroup({});
  behaviourForm: FormGroup = new FormGroup({});

  static toggleField(plugin: any) {
    plugin._state === 'collapsed' ? plugin._state = 'expanded' : plugin._state = 'collapsed';
  }

  constructor(private formBuilder: FormBuilder, private behaviourService: BehaviourService) {
  }

  ngOnInit() {
    this.behaviourService.initialized.then( () => {
      // this.plugins.push( ...this.statService.getPlugins() );
      this.plugins.push( ...this.behaviourService.systemBehaviours );
      this.plugins.forEach(p => p._state = 'collapsed');
      this.behaviours = this.prepareFormBehaviours(this.behaviourService.behaviours);
      this.behavioursLabel = Object.keys(this.behaviours);
      this.behaviourTab = 'SYSTEM';

      const pluginFormGroup = {};
      const behaviourFormGroup = {};
      this.plugins.forEach( p => {
        pluginFormGroup[p.id] = p.isActive;
      } );

      this.behaviourService.behaviours.forEach( b => {
        behaviourFormGroup[b.id] = b.isActive;
      } );
      this.pluginForm = this.formBuilder.group(pluginFormGroup);
      this.behaviourForm = this.formBuilder.group(behaviourFormGroup);
    });
  }

  togglePlugin(plugin: Plugin, isChecked: boolean, event: Event) {
    // event.stopImmediatePropagation();
    if (isChecked) {
      plugin.register();
      this.behaviourService.enable( plugin.id );
    } else {
      plugin.unregister();
      this.behaviourService.disable( plugin.id );
    }
  }

  toggleBehaviour(value: string, isChecked: boolean) {
    isChecked ? this.behaviourService.enable( value ) : this.behaviourService.disable( value );
  }

  private prepareFormBehaviours(behaviours: Behaviour[]) {
    const mapped = {};
    behaviours.forEach( behaviour => {

      // set state to collapsed
      behaviour._state = 'collapsed';

      if (!mapped[behaviour.forProfile]) {
        mapped[behaviour.forProfile] = [];
      }
      mapped[behaviour.forProfile].push( behaviour );
    });
    return mapped;
  }

  toggleField(plugin: Behaviour) {
    plugin._state === 'expanded' ? plugin._state = 'collapsed' : plugin._state = 'expanded';
  }
}
