import {StatisticComponent} from './statistic.component';
import {Injectable} from '@angular/core';
import {MenuService} from '../../../menu/menu.service';
import {Plugin} from '../../plugin';

@Injectable()
export class StatisticPlugin extends Plugin {
  id = 'plugin.statistic';
  _name = 'Statistic Plugin';
  defaultActive = true;

  constructor(private menuService: MenuService) {
    super();
    console.log('INIT STATISTIC PLUGIN');
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
