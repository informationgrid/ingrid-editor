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
import { computed, inject, Signal, signal } from "@angular/core";
import { GeneralStore } from "../../store/general.store";

export abstract class Plugin {
  abstract id: string;
  abstract name: string;
  group: string;
  description: string;
  isActive: boolean;
  defaultActive: boolean;
  hide = false;
  _state?: string;
  forAddress = signal<boolean>(false);
  subscriptions: Subscription[] = [];
  formSubscriptions: Subscription[] = [];
  fields?: FormlyFieldConfig[] = [];
  data?: any;
  hideInAddress = false;

  protected generalStore = inject(GeneralStore);
  protected formRegistered = signal<boolean>(false);

  protected activeNodes: Signal<number[]> = computed(() => {
    return this.forAddress()
      ? this.generalStore.activeAddressTreeNodes()
      : this.generalStore.activeTreeNodes();
  });

  register(): void {
    console.debug("Register Plugin: ", this.name);
    this.isActive = true;
  }

  registerForm(): void {
    console.debug("Register Form-Plugin: ", this.name);
    this.formRegistered.set(true);
  }

  unregister(): void {
    console.debug("Unregister Plugin: ", this.name);
    this.isActive = false;
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  unregisterForm(): void {
    if (this.isActive) {
      console.debug("Unregister Form-Plugin: ", this.name);
      this.formSubscriptions.forEach((sub) => sub.unsubscribe());
      this.formSubscriptions = [];
      this.formRegistered.set(false);
    }
  }

  update(): void {}

  setForAddress(forAddress: boolean): void {
    this.forAddress.set(forAddress);
  }
}
