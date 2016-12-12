import {Component, OnInit, trigger, animate, style, transition, state} from '@angular/core';
import {PluginsService} from './plugins.service';
import {Plugin} from './plugin';
import {Behaviour} from '../services/behaviour/behaviours';
import {BehaviourService} from '../services/behaviour/behaviour.service';

@Component( {
  template: require( './plugins.component.html' ),
  styles: [`
    .panel-default>.panel-heading { background-color: #ffffff;}
  `],
  animations: [
    trigger('openClose', [
      state('collapsed, void', style({ height:"0px", 'padding-top': 0, 'padding-bottom': 0, overflow: 'hidden' })),
      state('expanded', style({ height:"*" })),
      transition("collapsed => expanded", animate('200ms ease-in')),
      transition("expanded => collapsed", animate('300ms ease-out'))
    ])
  ]
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
      this.plugins.forEach(p => p._state = 'collapsed');
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

  toggleField(plugin: any) {
    // let previousState = this.expanded[id];
    // previousState === 'collapsed' ? this.expanded[id] = 'expanded' : this.expanded[id] = 'collapsed';
    plugin._state === 'collapsed' ? plugin._state = 'expanded' : plugin._state = 'collapsed';
  }

  toggleBehaviour(value: string, isChecked: boolean) {
    isChecked ? this.behaviourService.enable( value ) : this.behaviourService.disable( value );
  }

  private prepareBehaviours(behaviours: Behaviour[]) {
    let mapped = {};
    behaviours.forEach( behaviour => {

      // set state to collapsed
      behaviour._state = 'collapsed';

      if (!mapped[behaviour.forProfile]) mapped[behaviour.forProfile] = [];
      mapped[behaviour.forProfile].push( behaviour );
    });
    return mapped;
  }
}