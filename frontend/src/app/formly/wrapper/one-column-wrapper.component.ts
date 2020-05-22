// panel-wrapper.component.ts
import {AfterViewInit, Component, ElementRef, ViewChild, ViewContainerRef} from '@angular/core';
import {FieldWrapper} from '@ngx-formly/core';
import {ContextHelpComponent} from '../../+demo-layout/form/context-help/context-help.component';
import {MatDialog} from '@angular/material/dialog';
import {Overlay} from '@angular/cdk/overlay';
import {ConfigService} from '../../services/config/config.service';
import {ContexthelpService} from '../../services/contexthelp.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'ige-one-column-wrapper',
  template: `
    <div [class.hasContexthelp]="hasContexthelp" fxLayout="row">
      <div *ngIf="hasContexthelp" class="contexthelpIcon">
        <mat-icon class="material-icons-outlined" svgIcon="info-24px"></mat-icon>
      </div>
      <div class="label-wrapper">
        <label (click)="showContextHelp($event)">
          {{ to.externalLabel }} <span *ngIf="to.required">*</span>
        </label>
      </div>
      <ng-container #fieldComponent></ng-container>
    </div>
  `,
  styleUrls: ['./one-column-wrapper.component.scss']
})
export class OneColumnWrapperComponent extends FieldWrapper implements AfterViewInit {
  @ViewChild('fieldComponent', {read: ViewContainerRef, static: true}) fieldComponent: ViewContainerRef;

  profile: string;
  docType: string;
  fieldId: string;
  hasContexthelp$: Observable<boolean>;
  hasContexthelp = false;


  constructor(public dialog: MatDialog,
              public configService: ConfigService,
              public contexthelpService: ContexthelpService,
              private overlay: Overlay) {
    super();
  }

  ngAfterViewInit() {
    this.profile = this.configService.$userInfo.getValue().currentCatalog.type;
    this.docType = this.model._profile;
    this.fieldId = this.field.key;
    this.hasContexthelp$ = this.contexthelpService.getAvailableHelpFieldIds(this.profile, this.docType).pipe(map(ids => ids.includes(this.fieldId)));
    this.hasContexthelp$.subscribe(hasContexthelp => this.hasContexthelp = hasContexthelp);
  }

  showContextHelp(evt: MouseEvent) {
    if (!this.hasContexthelp) {
      return;
    }
    const helptext = this.contexthelpService.getContexthelpText(this.profile, this.docType, this.fieldId);

    const contextDialogHeight = 400;

    const target = new ElementRef(evt.currentTarget);
    // @ts-ignore
    const enoughSpaceBeneath = (window.innerHeight - target.nativeElement.getBoundingClientRect().top) > contextDialogHeight;
    const dialogRef = this.dialog.open(ContextHelpComponent, {
      data: {title: this.to.externalLabel, description$: helptext},
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      closeOnNavigation: true,

      // data: { dialogRef: dialogRef }
      position: {
        // @ts-ignore
        left: `${target.nativeElement.getBoundingClientRect().left}px`,
        // @ts-ignore
        top: `${enoughSpaceBeneath ? target.nativeElement.getBoundingClientRect().top : target.nativeElement.getBoundingClientRect().top - contextDialogHeight}px`
        // top: `${target.nativeElement.getBoundingClientRect().top - 400}px`
      },
      /*scrollStrategy: this.overlay.scrollStrategies.reposition({
        autoClose: true
      }),*/
      autoFocus: false,
      height: contextDialogHeight + 'px',
      width: '330px'
    });
  }

}
