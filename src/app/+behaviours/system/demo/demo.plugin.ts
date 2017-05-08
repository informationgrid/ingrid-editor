import {Inject, Injectable} from '@angular/core';
import {DemoComponent} from './demo.component';
import {MenuService} from '../../../menu/menu.service';
import {Plugin} from '../../plugin';

@Injectable()
export class DemoPlugin extends Plugin {
  id = 'plugin.demo';
  _name = 'Demo Plugin';

  constructor(@Inject( MenuService ) private menuService: MenuService) {
    super();
  }

  get name() {
    return this._name;
  }

  register() {
    super.register();

    // add menu item
    this.menuService.addMenuItem( 'Demo', 'demo', DemoComponent );
  };

  unregister() {
    super.unregister();

    this.menuService.removeMenuItem( 'demo' );
  }
}