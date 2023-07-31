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
    }
  ));

  xit("should include external behaviours", () => {});

  xit("should include external user behaviours written in javascript", () => {});

  xit("should remove a default behaviour", () => {});
});
