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
import {
  FormMessageComponent,
  FormMessageType,
} from "./form-message.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import { MatIconModule } from "@angular/material/icon";
import { fakeAsync, tick } from "@angular/core/testing";
import { FormMessageService } from "../../../services/form-message.service";
import { MatButtonModule } from "@angular/material/button";

describe("FormMessageComponent", () => {
  const INFO_MESSAGE: FormMessageType = {
    severity: "info",
    message: "Dies ist eine Infonachricht",
  };

  const ERROR_MESSAGE: FormMessageType = {
    severity: "error",
    message: "Dies ist eine Fehlernachricht",
  };

  let spectator: Spectator<FormMessageComponent>;
  // const db: SpyObject<DynamicDatabase>;
  const createHost = createComponentFactory({
    component: FormMessageComponent,
    imports: [MatIconModule, MatButtonModule],
  });

  beforeEach(() => {
    spectator = createHost();
  });

  it("should create", () => {
    expect(spectator.component).toBeTruthy();
  });

  it("should be hidden if no message was received", () => {
    spectator.detectChanges();
    const wrapper = spectator.query(".wrapper");
    expect(wrapper).not.toExist();
  });

  it("should show info message", () => {
    const service = spectator.inject(FormMessageService);
    service.message$.next(INFO_MESSAGE);

    spectator.detectChanges();

    const wrapper = spectator.query(".wrapper");
    expect(wrapper).toExist();
    expect(wrapper).toContainText("Dies ist eine Infonachricht");
    expect(wrapper).toHaveClass("info");
  });

  it("should hide an info message after 3s", fakeAsync(() => {
    const service = spectator.inject(FormMessageService);
    service.message$.next(INFO_MESSAGE);

    spectator.detectChanges();
    tick(3000);
    spectator.detectChanges();

    const wrapper = spectator.query(".wrapper");
    expect(wrapper).not.toExist();
  }));

  it("should show an error message", () => {
    const service = spectator.inject(FormMessageService);
    service.message$.next(ERROR_MESSAGE);

    spectator.detectChanges();

    const wrapper = spectator.query(".wrapper");
    expect(wrapper).toExist();
    expect(wrapper).toContainText("Dies ist eine Fehlernachricht");
    expect(wrapper).toHaveClass("error");
  });

  it("should not hide an error message after 3s", fakeAsync(() => {
    const service = spectator.inject(FormMessageService);
    service.message$.next(ERROR_MESSAGE);

    spectator.detectChanges();
    tick(3000);
    spectator.detectChanges();

    const wrapper = spectator.query(".wrapper");
    expect(wrapper).toExist();
  }));

  xit("should jump to next and previous error", () => {});

  xit("should explicitly close an error message", () => {});
});
