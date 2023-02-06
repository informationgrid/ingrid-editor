import { AfterViewInit, Component, ElementRef, OnInit } from "@angular/core";
import { FieldWrapper } from "@ngx-formly/core";
import { ContextHelpService } from "../../../services/context-help/context-help.service";
import { ConfigService } from "../../../services/config/config.service";

@Component({
  selector: "ige-inline-help-wrapper",
  templateUrl: "./inline-help-wrapper.component.html",
  styleUrls: ["./inline-help-wrapper.component.scss"],
})
export class InlineHelpWrapperComponent
  extends FieldWrapper
  implements OnInit, AfterViewInit
{
  private profile: string;
  private fieldId: string;

  constructor(
    public configService: ConfigService,
    public contextHelpService: ContextHelpService
  ) {
    super();
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.profile = this.configService.$userInfo.getValue().currentCatalog.type;
    this.fieldId = <string>this.field.key;
  }

  showContextHelp(evt: MouseEvent) {
    if (!this.props.hasInlineContextHelp) {
      return;
    }

    evt.stopImmediatePropagation();

    const target = new ElementRef(evt.currentTarget);
    const infoElement = target.nativeElement as HTMLElement;
    const title = this.props.label ?? this.props.externalLabel;
    this.contextHelpService.showContextHelp(
      this.profile,
      this.formState.mainModel?._type,
      this.fieldId,
      title,
      infoElement
    );
  }
}
