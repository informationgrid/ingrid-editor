// when adding a new plugin then it must be loaded from the PluginManager by import statement
// then this plugin can be listed and activated
// - what is the difference to a bahaviour?
//   - plugins are pre-configured and cannot be changed
//   - maybe it's possible to change a few settings
//   - they're also defined for all catalogs
//   - they can change the behaviour system wide
//   - a behaviour can be created by the user dynamically and is valid for a catalog
//   - these only change the behaviour of the formular(?)
//     - might not be flexible enough, see UVP example!!!
//     - or should it be realised as a plugin?

import { Subscription } from "rxjs";
import { FormlyFieldConfig } from "@ngx-formly/core";

export abstract class Plugin {
  id: string;
  abstract name: string;
  group: string;
  description: string;
  isActive: boolean;
  defaultActive: boolean;
  hide = false;
  _state?: string;
  forAddress = false;
  subscriptions: Subscription[] = [];
  formSubscriptions: Subscription[] = [];
  fields?: FormlyFieldConfig[] = [];
  data?: any;
  hideInAddress = false;

  register(): void {
    console.log("Register Plugin: ", this.name);
    this.isActive = true;
  }

  registerForm(): void {
    console.log("Register Form-Plugin: ", this.name);
  }

  unregister(): void {
    console.log("Unregister Plugin: ", this.name);
    this.isActive = false;
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  unregisterForm(): void {
    if (this.isActive) {
      console.log("Unregister Form-Plugin: ", this.name);
      this.formSubscriptions.forEach((sub) => sub.unsubscribe());
      this.formSubscriptions = [];
    }
  }

  update(): void {}

  setForAddress(forAddress: boolean): void {
    this.forAddress = forAddress;
  }
}
