import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import {ModalService} from '../services/modal/modal.service';
import {ConfigService} from '../services/config/config.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private modalService: ModalService, private configService: ConfigService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = this.configService.$userInfo.getValue();
    const path = state.url;


    if (user.assignedCatalogs.length === 0 && state.url.indexOf('/catalogs') === -1) {
      this.router.navigate(['/catalogs']);
      return false;
    }

    return true;

    /*let url: string = state.url;

    // If user is not logged in we'll send them to the homepage
    if (!this.auth.loggedIn()) {
      // return (roles == null || roles.indexOf("the-logged-user-role") != -1);

      this.auth.redirectUrl = url;
      this.router.navigate( ['/login'] );
      return false;
    }
    let roles = route.data['roles'] as Array<string>;

    let validPages = this.auth.getAccessiblePages();
    let nextPath = '/' + route.url[0].path;

    let mayContinue = this.containsValidPage(validPages, nextPath);

    // if page was explicitly allowed or if not then default page rules apply
    if (mayContinue || (validPages.length === 0 && (!roles || this.auth.hasRole( roles )))) {
      return true;
    } else {
      this.modalService.showError( 'Sie haben nicht die nötigen Rechte!' );
      return false;
    }*/

    // console.log('auth service');
    // return true;
  }

  private containsValidPage(validPages: string[], page: string) {
    return validPages.length === 0 || validPages.some( validPage => validPage.indexOf( page ) !== -1 );
  }
}
