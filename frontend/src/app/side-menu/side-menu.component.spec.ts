import { SideMenuComponent } from "./side-menu.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import { RouterTestingModule } from "@angular/router/testing";
import { ConfigService } from "../services/config/config.service";
import { MenuService } from "../menu/menu.service";

describe("SideMenuComponent", () => {
  let spectator: Spectator<SideMenuComponent>;
  const createHost = createComponentFactory({
    component: SideMenuComponent,
    imports: [RouterTestingModule],
    mocks: [ConfigService, MenuService],
    detectChanges: false,
  });

  beforeEach(() => {
    spectator = createHost();
  });

  it("should create", () => {
    expect(spectator).toBeTruthy();
  });
});
