import {Component, OnInit} from '@angular/core';
import {ApiService} from "../services/ApiService";
import {map} from "rxjs/operators";
import {Observable} from "rxjs";
import {ConfigService} from "../services/config/config.service";
import {NavigationEnd, Router} from "@angular/router";

@Component({
  selector: 'ige-main-header',
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss']
})
export class MainHeaderComponent implements OnInit {

  username: Observable<string>;
  showShadow: boolean;

  constructor(private apiService: ApiService, private configService: ConfigService,
              private router: Router) {


    this.username = this.configService.$userInfo.pipe(
      map(info => info.name)
    );
  }

  ngOnInit() {
    this.router.events.subscribe(
      (event: any) => {
        if (event instanceof NavigationEnd) {
          this.showShadow = this.router.url !== '/dashboard';
        }
      }
    );
  }

  logout() {
    this.apiService.logout().subscribe(() => {
      window.location.reload(true);
    })
  }

}
