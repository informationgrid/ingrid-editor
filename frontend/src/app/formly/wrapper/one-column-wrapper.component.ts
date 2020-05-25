import {AfterViewInit, Component, ElementRef, ViewChild, ViewContainerRef} from '@angular/core';
import {FieldWrapper} from '@ngx-formly/core';
import {ConfigService} from '../../services/config/config.service';
import {ContextHelpService} from '../../services/context-help/context-help.service';

@Component({
  selector: 'ige-one-column-wrapper',
  templateUrl: './one-column-wrapper.component.html',
  styleUrls: ['./one-column-wrapper.component.scss']
})
export class OneColumnWrapperComponent extends FieldWrapper implements AfterViewInit {

  @ViewChild('fieldComponent', {read: ViewContainerRef, static: true}) fieldComponent: ViewContainerRef;

  private profile: string;
  private docType: string;
  private fieldId: string;

  constructor(public configService: ConfigService,
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

    const target = new ElementRef(evt.currentTarget);
    const infoElement = target.nativeElement as HTMLElement;
    this.contextHelpService.showContextHelp(this.profile, this.docType, this.fieldId, this.to.externalLabel, infoElement);

  }
}
