import {Plugin} from '../plugin';
import {MenuService} from '../../services/menu/menu.service';
import {StatisticComponent} from './statistic.component';
import {Inject, Injectable} from '@angular/core';

@Injectable()
export class StatisticPlugin implements Plugin {
  id = 'plugin.statistic';
  _name = 'Statistic Plugin';

  constructor(@Inject( MenuService ) private menuService: MenuService) {
  }

  get name() {
    return this._name;
  }

  register() {
    // add menu item
    this.menuService.addMenuItem( 'Statistic', 'statistic', StatisticComponent );
  };
}