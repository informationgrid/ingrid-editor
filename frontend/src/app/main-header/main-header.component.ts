import {Component, OnInit} from '@angular/core';
import {ApiService} from '../services/ApiService';
import {ConfigService} from '../services/config/config.service';
import {NavigationEnd, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {InfoDialogComponent} from './info-dialog/info-dialog.component';

@Component({
  selector: 'ige-main-header',
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss']
})
export class MainHeaderComponent implements OnInit {

  userInfo = this.configService.$userInfo;
  showShadow: boolean;
  pageTitle: string;

  constructor(private apiService: ApiService, private configService: ConfigService,
              private router: Router, private dialog: MatDialog) {
  }

  ngOnInit() {
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
      case('/form'): return 'Daten';
      case('/address'): return 'Adressen';
      default: return '';
    }
  }

  showInfo() {
    this.dialog.open(InfoDialogComponent)
  }

  getInitials(name: string) {
    return name.split(' ')
      .map(item => item[0])
      .join('');
  }
}
