import {Component, OnInit} from '@angular/core';
import {PluginsService} from './plugins.service';
import {Plugin} from './plugin';

@Component( {
  template: require( './plugins.component.html' )
} )
export class PluginsComponent implements OnInit {

  plugins: any[] = [];

  constructor(private statService: PluginsService) {
  }

  ngOnInit() {
    debugger;
    this.plugins.push( ...this.statService.getPlugins() );
  }

  togglePlugin(plugin: Plugin) {
    plugin.register();
  }
}