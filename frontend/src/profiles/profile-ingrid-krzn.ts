import { Component, NgModule } from "@angular/core";
import { InGridComponent } from "./profile-ingrid";

@Component({
  template: "",
})
class InGridKrznComponent extends InGridComponent {
  constructor() {
    super();
  }
}

@NgModule({
  declarations: [InGridKrznComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return InGridKrznComponent;
  }
}
