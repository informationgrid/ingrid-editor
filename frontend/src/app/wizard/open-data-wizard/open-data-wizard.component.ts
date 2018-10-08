import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {WizardService} from '../wizard.service';
import {Location} from '@angular/common';

@Component({
  selector: 'app-open-data-wizard',
  templateUrl: './open-data-wizard.component.html',
  styleUrls: ['./open-data-wizard.component.css']
})
export class OpenDataWizardComponent implements OnInit {

  page = 1;

  focusByPage = [
    'title',
    'isOpenData'
  ];

  constructor(private location: Location, private wizardService: WizardService) { }

  ngOnInit() {
    this.notifyPageturn();
  }

  nextPage() {
    this.page++;
    this.notifyPageturn();
  }

  previousPage() {
    this.page--;
    this.notifyPageturn();
  }

  private notifyPageturn() {
    this.wizardService.focusElements$.next( this.focusByPage[this.page - 1] );
  }

  close() {
    this.location.back();
    this.wizardService.focusElements$.next('');
  }
}
