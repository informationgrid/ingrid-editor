import { EventService } from "./event.service";

describe("EventService", () => {
  let service: EventService;

  beforeEach(() => {
    service = new EventService();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
