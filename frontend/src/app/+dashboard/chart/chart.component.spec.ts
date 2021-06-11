import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { ChartComponent } from "./chart.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import { RepeatListComponent } from "../../formly/types/repeat-list/repeat-list.component";

describe("ChartComponent", () => {
  let spectator: Spectator<ChartComponent>;
  const createHost = createComponentFactory({
    component: ChartComponent,
    detectChanges: false,
  });

  beforeEach(() => {
    spectator = createHost();
  });

  it("should create", () => {
    expect(spectator).toBeTruthy();
  });
});
