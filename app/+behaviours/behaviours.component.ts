import {Component, OnInit, trigger, animate, style, transition, state} from '@angular/core';
import {Plugin} from './plugin';
import {Behaviour} from './behaviours';
import {BehaviourService} from './behaviour.service';

@Component( {
  template: require( './behaviours.component.html' ),
  styles: [`
    .panel-default>.panel-heading { background-color: #ffffff;}
    .clickable {
      cursor: pointer;
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

  plugins: any[] = [];
  behaviours: any;
  behavioursLabel: string[];

  behaviourTab: string;
  expanded: any = {};

  constructor(private behaviourService: BehaviourService) {
  }

  ngOnInit() {
    this.behaviourService.initialized.then( () => {
      // this.plugins.push( ...this.statService.getPlugins() );
      this.plugins.push( ...this.behaviourService.systemBehaviours );
      this.plugins.forEach(p => p._state = 'collapsed');
      this.behaviours = this.prepareFormBehaviours(this.behaviourService.behaviours);
      this.behavioursLabel = Object.keys(this.behaviours);
      this.behaviourTab = 'SYSTEM';
    });
  }

  togglePlugin(plugin: Plugin, isChecked: boolean, event: Event) {
    event.stopImmediatePropagation();
    if (isChecked) {
      plugin.register();
      this.behaviourService.enable( plugin.id );
    } else {
      plugin.unregister();
      this.behaviourService.disable( plugin.id );
    }
  }

  toggleField(plugin: any) {
    plugin._state === 'collapsed' ? plugin._state = 'expanded' : plugin._state = 'collapsed';
  }

  toggleBehaviour(value: string, isChecked: boolean) {
    isChecked ? this.behaviourService.enable( value ) : this.behaviourService.disable( value );
  }

  private prepareFormBehaviours(behaviours: Behaviour[]) {
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