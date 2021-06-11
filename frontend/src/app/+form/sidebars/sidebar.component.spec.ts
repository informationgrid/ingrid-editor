import { SidebarComponent } from "./sidebar.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import { Router } from "@angular/router";
import { MatDialogModule } from "@angular/material/dialog";
import { DocumentService } from "../../services/document/document.service";

describe("SidebarComponent", () => {
  let spectator: Spectator<SidebarComponent>;
  const createHost = createComponentFactory({
    component: SidebarComponent,
    imports: [MatDialogModule],
    mocks: [Router, DocumentService],
    detectChanges: false,
  });

  beforeEach(() => {
    spectator = createHost();
  });

  it("should create", () => {
    expect(spectator).toBeTruthy();
  });
});
