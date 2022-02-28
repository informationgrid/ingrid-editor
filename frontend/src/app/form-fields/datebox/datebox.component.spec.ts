import { DateboxComponent } from "./datebox.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";

describe("DateboxComponent", () => {
  let spectator: Spectator<DateboxComponent>;
  const createComponent = createComponentFactory({
    component: DateboxComponent,
    imports: [MatDatepickerModule, MatNativeDateModule],
    detectChanges: false,
  });

  beforeEach(() => (spectator = createComponent()));

  it("should create", () => {
    expect(spectator).toBeTruthy();
  });
});
