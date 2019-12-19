import {Component, OnInit} from '@angular/core';
import {ModalService} from './services/modal/modal.service';
import {BehaviourService} from './services/behavior/behaviour.service';
import {RoleService} from './services/role/role.service';
import {ApiService} from "./services/ApiService";
import {ConfigService} from './services/config/config.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'ige-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  username: Observable<string>;

  // TODO: modal zoom -> https://codepen.io/wolfcreativo/pen/yJKEbp/

  constructor(private behaviourService: BehaviourService, private modalService: ModalService,
              private apiService: ApiService, private configService: ConfigService, registry: MatIconRegistry, domSanitizer: DomSanitizer,
              private roleService: RoleService) {

    // const roles = KeycloakService.auth.authz.resourceAccess['ige-ng'].roles;
    // TODO: get RoleMapping from each role so that we can give permissions in client correctly
    this.roleService.getRoleMapping('admin')
      .subscribe(role => {
        console.log('my roles:', role);
        // KeycloakService.auth.roleMapping.push(role);
      });

    this.username = this.configService.$userInfo.pipe(
      map(info => info.name)
    );

    registry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/icon-navigation.svg'));
    registry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/icon-form.svg'));

  }

  ngOnInit() {

    this.behaviourService.initialized.then(() => {
      const systemBehaviours = this.behaviourService.systemBehaviours;
      console.log('got system behaviours:', systemBehaviours);
      systemBehaviours
        .filter(systemBehaviour => systemBehaviour.isActive)
        .forEach(systemBehaviour => {
          console.log('register system behaviour: ' + systemBehaviour.name);
          systemBehaviour.register();
        });
    });
  }

  logout() {
    this.apiService.logout().subscribe(() => {
      debugger;
      window.location.reload(true);
    })
  }

}
