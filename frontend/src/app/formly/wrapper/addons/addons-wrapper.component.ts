import {
  AfterViewInit,
  Component,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { FieldWrapper } from "@ngx-formly/core";

@Component({
  selector: "ige-addons",
  templateUrl: "./addons-wrapper.component.html",
  styleUrls: ["./addons-wrapper.component.scss"],
})
export class AddonsWrapperComponent
  extends FieldWrapper
  implements AfterViewInit
{
  @ViewChild("matPrefix", { static: true }) matPrefix!: TemplateRef<any>;
  @ViewChild("matSuffix", { static: true }) matSuffix!: TemplateRef<any>;

  ngAfterViewInit() {
    if (this.matPrefix) {
      if (this.props?.addonLeft?.icon != undefined) {
        this.props.prefix = this.matSuffix;
      } else {
        this.props.textPrefix = this.matPrefix;
      }
    }

    if (this.matSuffix) {
      if (this.props?.addonRight?.icon != undefined) {
        this.props.suffix = this.matSuffix;
      } else {
        this.props.textSuffix = this.matSuffix;
      }
    }
  }

  addonRightClick($event: any) {
    if (this.props.addonRight.onClick) {
      this.props.addonRight.onClick(this.props, this, $event);
    }
  }

  addonLeftClick($event: any) {
    if (this.props.addonLeft.onClick) {
      this.props.addonLeft.onClick(this.props, this, $event);
    }
  }
}
