import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { FieldWrapper } from "@ngx-formly/core";
@Component({
  selector: "ige-button",
  templateUrl: "./button-wrapper.component.html",
  styleUrls: ["./button-wrapper.component.scss"],
})
export class ButtonWrapperComponent
  extends FieldWrapper
  implements AfterViewInit
{
  @ViewChild("buttonConfig", { static: true }) buttonConfig!: TemplateRef<any>;
  ngAfterViewInit() {
    if (this.buttonConfig) {
      this.props.buttonConfig = this.buttonConfig;
    }
  }

  addonRightClick($event: any) {
    if (this.props.buttonConfig.onClick) {
      this.props.buttonConfig.onClick(this.to, this, $event);
    }
  }
}
