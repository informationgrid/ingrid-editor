import {
  Component,
  TemplateRef,
  ViewChild,
  AfterViewInit,
} from "@angular/core";
import { FieldWrapper } from "@ngx-formly/core";
import { MatInputModule } from "@angular/material/input";

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
      // Note: for text use `textPrefix` property (only in Angular Material >= 15)
      this.props.prefix = this.matPrefix;
    }

    if (this.matSuffix) {
      // Note: for text use `textSuffix` property (only in Angular Material >= 15)
      this.props.suffix = this.matSuffix;
    }
  }

  addonRightClick($event: any) {
    if (this.props.addonRight.onClick) {
      this.props.addonRight.onClick(this.to, this, $event);
    }
  }

  addonLeftClick($event: any) {
    if (this.props.addonLeft.onClick) {
      this.props.addonLeft.onClick(this.to, this, $event);
    }
  }
}
