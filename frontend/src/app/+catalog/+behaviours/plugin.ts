/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { Subscription } from "rxjs";
import { FormlyFieldConfig } from "@ngx-formly/core";

export abstract class Plugin {
  abstract id: string;
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
  private registeredInForm = false;

  register(): void {
    console.log("Register Plugin: ", this.name);
    this.isActive = true;
  }

  registerForm(): void {
    if (this.registeredInForm) {
      console.warn(
        `Plugin already registered in form and registration is skipped: ${this.name}`,
      );
      return;
    }

    console.log("Register Form-Plugin: ", this.name);
    this.registeredInForm = true;
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
      this.registeredInForm = false;
      this.formSubscriptions.forEach((sub) => sub.unsubscribe());
      this.formSubscriptions = [];
    }
  }

  update(): void {}

  setForAddress(forAddress: boolean): void {
    this.forAddress = forAddress;
  }
}
