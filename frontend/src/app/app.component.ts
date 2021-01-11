import {Component, OnInit} from '@angular/core';
import {RoleService} from './services/role/role.service';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {BehaviourService} from './services/behavior/behaviour.service';

@Component({
  selector: 'ige-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  // TODO: modal zoom -> https://codepen.io/wolfcreativo/pen/yJKEbp/

  constructor(private behaviourService: BehaviourService/*for initialization!*/,
              registry: MatIconRegistry, domSanitizer: DomSanitizer,
              private roleService: RoleService) {

    // TODO: get RoleMapping from each role so that we can give permissions in client correctly
    /*this.roleService.getRoleMapping('admin')
      .subscribe(role => {
        console.log('my roles:', role);
      });*/

    // useful tool for merging SVG files: merge-svg-files via npm
    registry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/icon-navigation.svg'));
    registry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/icon-doc-types.svg'));
    registry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/icon-toolbar.svg'));
    registry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/icon-general.svg'));
    registry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/icon-button.svg'));
    registry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('assets/images/banner.svg'));

  }

  ngOnInit() {
  }

}
