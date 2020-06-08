import {AfterViewInit, Component, ElementRef, OnInit} from '@angular/core';
import {FieldWrapper} from '@ngx-formly/core';
import {ContextHelpService} from '../../../services/context-help/context-help.service';
import {ConfigService} from '../../../services/config/config.service';

@Component({
  selector: 'ige-inline-help-wrapper',
  templateUrl: './inline-help-wrapper.component.html',
  styleUrls: ['./inline-help-wrapper.component.scss']
})
export class InlineHelpWrapperComponent extends FieldWrapper implements OnInit, AfterViewInit {

  private profile: string;
  private docType: string;
  private fieldId: string;

  constructor(public configService: ConfigService, public contextHelpService: ContextHelpService) {
    super();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {

    this.profile = this.configService.$userInfo.getValue().currentCatalog.type;
    this.docType = this.model._type;
    this.fieldId = this.field.key;

  }

  showContextHelp(evt: MouseEvent) {

    if (!this.to.hasInlineContextHelp) {
      return;
    }

    const target = new ElementRef(evt.currentTarget);
    const infoElement = target.nativeElement as HTMLElement;
    this.contextHelpService.showContextHelp(this.profile, this.docType, this.fieldId, this.to.externalLabel, infoElement);

  }

}
