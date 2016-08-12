import {Plugin} from '../plugin';
import {MenuService} from '../../menu/menu.service';
import {StatisticComponent} from './statistic.component';
import {Inject, Injectable} from '@angular/core';

@Injectable()
export class StatisticPlugin extends Plugin {
  id = 'plugin.statistic';
  _name = 'Statistic Plugin';

  constructor(@Inject( MenuService ) private menuService: MenuService) {
    super();
    this.isActive = true;
  }

  get name() {
    return this._name;
  }

  register() {
    super.register();

    // add menu item
    this.menuService.addMenuItem( 'Statistic', 'statistic', StatisticComponent );
  };

  unregister() {
    super.unregister();

    this.menuService.removeMenuItem( 'statistic' );
  }
}