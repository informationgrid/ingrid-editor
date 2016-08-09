import {Component, OnInit} from '@angular/core';
import {PluginsService} from './plugins.service';
import {Plugin} from './plugin';
import {Behaviour} from '../services/behaviour/behaviours';
import {BehaviourService} from '../services/behaviour/behaviour.service';

@Component( {
  template: require( './plugins.component.html' )
} )
export class PluginsComponent implements OnInit {

  plugins: any[] = [];
  behaviours: Behaviour[];

  constructor(private statService: PluginsService, private behaviourService: BehaviourService) {
  }

  ngOnInit() {
    this.plugins.push( ...this.statService.getPlugins() );
    this.behaviours = this.behaviourService.behaviours;
  }

  togglePlugin(plugin: Plugin, isChecked: boolean) {
    if (isChecked) {
      plugin.register();
    } else {
      plugin.unregister();
    }
  }

  toggleBehaviour(value: string, isChecked: boolean) {
    isChecked ? this.behaviourService.enable( value ) : this.behaviourService.disable( value );
  }
}