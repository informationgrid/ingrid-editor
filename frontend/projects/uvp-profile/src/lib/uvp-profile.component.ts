import { Component, OnInit } from '@angular/core';
import {UvpProfileService} from "./uvp-profile.service";

@Component({
  selector: 'lib-UvpProfile',
  template: `
    <p>
      uvp-profile works from menu!
    </p>
  `,
  styles: []
})
export class UvpProfileComponent implements OnInit {

  constructor(service: UvpProfileService) { }

  ngOnInit() {
  }

}
