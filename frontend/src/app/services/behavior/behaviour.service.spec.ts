import { BehaviourService } from "./behaviour.service";
import { inject } from "@angular/core/testing";
import { OpenDataBehaviour } from "../../+catalog/+behaviours/form/OpenData/open-data.behaviour";
import { Behaviour } from "./behaviour";
import { createServiceFactory, SpectatorService } from "@ngneat/spectator";

// const behaviourService: BehaviourService;

class StorageServiceMock {
  beforeSave;
}

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
    new OpenDataBehaviour(null),
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

      // behaviourService = TestBed.get( BehaviourService );
      expect(behaviourService.behaviours.length).toEqual(2);
      expect(behaviourService.behaviours[0].id).toEqual("xxx");
      expect(behaviourService.behaviours[1].id).toEqual("open-data");
    }
  ));

  xit("should include external behaviours", () => {});

  xit("should include external user behaviours written in javascript", () => {});

  xit("should remove a default behaviour", () => {});
});
