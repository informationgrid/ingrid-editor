import {AfterViewInit, Component, ElementRef, ViewChild, ViewContainerRef} from '@angular/core';
import {FieldWrapper} from '@ngx-formly/core';
import {ContextHelpComponent} from '../../+demo-layout/form/context-help/context-help.component';
import {MatDialog} from '@angular/material/dialog';
import {ConfigService} from '../../services/config/config.service';
import {ContextHelpService} from '../../services/context-help/context-help.service';

@Component({
  selector: 'ige-one-column-wrapper',
  template: `
    <div [class.hasContextHelp]="to.hasContextHelp" fxLayout="row">
      <div *ngIf="to.hasContextHelp" class="contextHelpIcon">
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

  private static contextDialogHeight = 400;

  @ViewChild('fieldComponent', {read: ViewContainerRef, static: true}) fieldComponent: ViewContainerRef;

  private profile: string;
  private docType: string;
  private fieldId: string;

  private static getLeftPosition = (infoElement: HTMLElement) => `${infoElement.getBoundingClientRect().left}px`

  private static getTopPosition(infoElement: HTMLElement) {
    const topPosition = window.innerHeight - infoElement.getBoundingClientRect().top;
    const enoughSpaceBeneath = topPosition > OneColumnWrapperComponent.contextDialogHeight;

    return enoughSpaceBeneath
      ? `${infoElement.getBoundingClientRect().top}px`
      : `${infoElement.getBoundingClientRect().top - OneColumnWrapperComponent.contextDialogHeight}px`
  }


  constructor(public dialog: MatDialog,
              public configService: ConfigService,
              public contextHelpService: ContextHelpService) {
    super();
  }

  ngAfterViewInit() {

    this.profile = this.configService.$userInfo.getValue().currentCatalog.type;
    this.docType = this.model._type;
    this.fieldId = this.field.key;

  }

  showContextHelp(evt: MouseEvent) {

    if (!this.to.hasContextHelp) {
      return;
    }
    const helptext = this.contextHelpService.getContexthelpText(this.profile, this.docType, this.fieldId);

    const target = new ElementRef(evt.currentTarget);
    const infoElement = target.nativeElement as HTMLElement;


    this.dialog.open(ContextHelpComponent, {
      data: {
        title: this.to.externalLabel,
        description$: helptext
      },
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      closeOnNavigation: true,
      position: {
        left: OneColumnWrapperComponent.getLeftPosition(infoElement),
        top: OneColumnWrapperComponent.getTopPosition(infoElement)
      },
      autoFocus: false,
      height: OneColumnWrapperComponent.contextDialogHeight + 'px',
      width: '330px'
    });

  }
}
