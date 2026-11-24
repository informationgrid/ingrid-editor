import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { InGridComponent } from "./profile-ingrid";

@Component({
  template: "",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
})
class SampleProfileComponent extends InGridComponent {}

export class ProfilePack {
  static getMyComponent() {
    return SampleProfileComponent;
  }
}
