import {Component, OnInit} from '@angular/core';
import {PluginsService} from './plugins.service';
import {Plugin} from './plugin';
import {Behaviour} from '../services/behaviour/behaviours';
import {BehaviourService} from '../services/behaviour/behaviour.service';

@Component( {
  template: require( './plugins.component.html' ),
  styles: [`
    .panel-default>.panel-heading { background-color: #ffffff;}
  `]
} )
export class PluginsComponent implements OnInit {

  plugins: any[] = [];
  behaviours: any;
  behavioursLabel: string[];

  behaviourTab: string;
  expanded: any = {};

  constructor(private statService: PluginsService, private behaviourService: BehaviourService) {
  }

  ngOnInit() {
    this.behaviourService.initialized.then( () => {
      this.plugins.push( ...this.statService.getPlugins() );
      this.behaviours = this.prepareBehaviours(this.behaviourService.behaviours);
      this.behavioursLabel = Object.keys(this.behaviours);
      this.behaviourTab = 'SYSTEM';
    });
  }

  togglePlugin(plugin: Plugin, isChecked: boolean, event: Event) {
    event.stopImmediatePropagation();
    if (isChecked) {
      plugin.register();
    } else {
      plugin.unregister();
    }
  }

  toggleBehaviour(value: string, isChecked: boolean) {
    isChecked ? this.behaviourService.enable( value ) : this.behaviourService.disable( value );
  }

  private prepareBehaviours(behaviours: Behaviour[]) {
    let mapped = {};
    behaviours.forEach( behaviour => {
      if (!mapped[behaviour.forProfile]) mapped[behaviour.forProfile] = [];
      mapped[behaviour.forProfile].push( behaviour );
    });
    return mapped;
  }
}