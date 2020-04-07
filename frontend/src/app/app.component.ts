import {Component, OnInit} from '@angular/core';
import {ModalService} from './services/modal/modal.service';
import {BehaviourService} from './services/behavior/behaviour.service';
import {RoleService} from './services/role/role.service';
import {ApiService} from './services/ApiService';
import {ConfigService} from './services/config/config.service';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'ige-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  // TODO: modal zoom -> https://codepen.io/wolfcreativo/pen/yJKEbp/

  constructor(private behaviourService: BehaviourService, private modalService: ModalService,
              private apiService: ApiService, private configService: ConfigService, registry: MatIconRegistry, domSanitizer: DomSanitizer,
              private roleService: RoleService) {

    // TODO: get RoleMapping from each role so that we can give permissions in client correctly
    this.roleService.getRoleMapping('admin')
      .subscribe(role => {
        console.log('my roles:', role);
      });

    // useful tool for merging SVG files: merge-svg-files via npm
    registry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/icon-navigation.svg'));
    registry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/icon-doc-types.svg'));
    registry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/icon-toolbar.svg'));
    registry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/icon-general.svg'));
    registry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('assets/images/banner.svg'));

  }

  ngOnInit() {

    // this.behaviourService.initialized.then(() => {
      const systemBehaviours = this.behaviourService.systemBehaviours;
      console.log('got system behaviours:', systemBehaviours);
      systemBehaviours
        .filter(systemBehaviour => systemBehaviour.isActive)
        .forEach(systemBehaviour => {
          console.log('register system behaviour: ' + systemBehaviour.name);
          systemBehaviour.register();
        });
    // });
  }

}
