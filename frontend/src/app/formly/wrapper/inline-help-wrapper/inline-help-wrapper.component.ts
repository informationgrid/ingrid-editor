import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
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
  @ViewChild("matSuffix", { static: true }) matSuffix!: TemplateRef<any>;

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

    if (this.matSuffix && !this.props.isSuffixUnsupported) {
      this.props._matSuffix = this.props.suffix;
      this.props.suffix = this.matSuffix;
    }
  }

  showContextHelp(evt: MouseEvent) {
    if (!this.props.hasInlineContextHelp) {
      return;
    }

    evt.stopImmediatePropagation();

    const target = new ElementRef(evt.currentTarget);
    const infoElement = target.nativeElement as HTMLElement;
    const title =
      this.props.fieldLabel ?? this.props.label ?? this.props.externalLabel;
    this.contextHelpService.showContextHelp(
      this.profile,
      this.formState.mainModel?._type,
      this.field.props.contextHelpId || this.fieldId,
      title,
      infoElement
    );
  }
}
