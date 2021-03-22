import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  tabIndex = 0;
  private mapTabToRoute = [];

  constructor(private router: Router, route: ActivatedRoute, private location: Location) {
    this.tabIndex = route.snapshot.routeConfig?.data?.index ?? 0;

    this.prepareTabToRouteMap();
  }

  private prepareTabToRouteMap() {
    this.router.config
      .find(r => r.path === 'settings')
      // @ts-ignore
      ._loadedConfig?.routes
      ?.filter(r => r.data?.index !== undefined)
      ?.forEach(r => {
        this.mapTabToRoute[r.data.index] = r.path;
      });
  }

  ngOnInit(): void {
  }

  updateRoute(index: number) {
    let path = `/settings/${this.mapTabToRoute[index]}`;
    this.location.replaceState(path);
  }
}
