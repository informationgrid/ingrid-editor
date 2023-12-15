/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { BehaviourService } from "./behaviour.service";
import { inject } from "@angular/core/testing";
import { Behaviour } from "./behaviour";
import { createServiceFactory, SpectatorService } from "@ngneat/spectator";

class BehaviourMock {
  behaviours: Behaviour[] = [
    {
      id: "xxx",
      title: "Dummy",
      description: "This is a dummy behaviour",
      defaultActive: true,
      forProfile: "UVP",
      register: function (form) {},
      unregister: function () {},
    },
  ];
}

describe("Behaviour", () => {
  let spectator: SpectatorService<BehaviourService>;
  const createService = createServiceFactory(BehaviourService);

  beforeEach(() => (spectator = createService()));

  xit("should have a bunch of defined behaviours on startup", inject(
    [BehaviourService],
    (behaviourService: BehaviourService) => {
      console.log("in test");
      // fixture.detectChanges();
    },
  ));

  xit("should include external behaviours", () => {});

  xit("should include external user behaviours written in javascript", () => {});

  xit("should remove a default behaviour", () => {});
});
