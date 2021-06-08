import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLinkActive} from "@angular/router";

@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  activeLink = 'general';

  constructor(private router: Router) {
    this.activeLink = router.getCurrentNavigation().extractedUrl.root.children.primary.segments[1]?.path ?? 'general';
  }

  ngOnInit(): void {
  }

}
