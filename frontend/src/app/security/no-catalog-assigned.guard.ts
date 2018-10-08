import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import {ModalService} from '../services/modal/modal.service';
import {ConfigService} from "../services/config.service";
import {IgeError} from "../models/ige-error";

@Injectable()
export class NoCatalogAssignedGuard implements CanActivate {

  constructor(private configService: ConfigService, private modalService: ModalService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

    let userInfo = this.configService.getUserInfo();
    if (userInfo.assignedCatalogs.length === 0) {
      this.modalService.showIgeError(new IgeError({message: 'The user has no catalog assigned'}));
      return false;
    }

    return true;
  }

}
