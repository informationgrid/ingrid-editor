import {Component, OnInit} from '@angular/core';
import {ApiService} from '../services/ApiService';
import {ConfigService, UserInfo, Version} from '../services/config/config.service';
import {NavigationEnd, Router} from '@angular/router';
import {SessionQuery} from '../store/session.query';

@Component({
  selector: 'ige-main-header',
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss']
})
export class MainHeaderComponent implements OnInit {

  userInfo$ = this.configService.$userInfo;
  showShadow: boolean;
  pageTitle: string;
  version: Version;
  timeout$ = this.session.select('sessionTimeoutIn');

  constructor(private apiService: ApiService, private configService: ConfigService,
              private session: SessionQuery,
              private router: Router) {
  }

  ngOnInit() {

    this.version = this.configService.$userInfo.getValue().version;

    this.router.events.subscribe(
      (event: any) => {
        if (event instanceof NavigationEnd) {
          this.showShadow = this.router.url !== '/dashboard';
          this.pageTitle = this.getPageTitleFromRoute(this.router.url);
        }
      }
    );
  }

  logout() {
    this.apiService.logout().subscribe(() => {
      window.location.reload(true);
    })
  }

  private getPageTitleFromRoute(url: string) {
    const firstPart = url.split(';')[0];
    switch (firstPart) {
      case('/form'):
        return 'Daten';
      case('/address'):
        return 'Adressen';
      default:
        return '';
    }
  }

  getInitials(user: UserInfo) {
    return user.firstName[0]+user.lastName[0];
  }
}
