import { PermissionsShowComponent } from "./permissions-show.component";
import { createComponentFactory, Spectator } from "@ngneat/spectator";
import { MatDialogModule } from "@angular/material/dialog";

describe("PermissionsShowComponent", () => {
  let spectator: Spectator<PermissionsShowComponent>;
  const createHost = createComponentFactory({
    component: PermissionsShowComponent,
    imports: [MatDialogModule],
    declarations: [],
    mocks: [],
    detectChanges: false,
  });

  beforeEach(() => {
    spectator = createHost();
  });

  it("should create", () => {
    expect(spectator).toBeTruthy();
  });

  xit("should show permissions grouped by their types", () => {
    /*const user = <User>{
      permissions: [
        {type: PermissionType.PAGE, value: 'Dashboard'},
        {type: PermissionType.PAGE, value: 'Import'},
        {type: PermissionType.ACTION, value: 'ExportAction'},
        {type: PermissionType.DOCUMENTS, value: 'READ_1234'},
        {type: PermissionType.ADDRESSES, value: 'WRITE_2345'}
      ]
    };
    spectator.setInput('user', user);*/
    expect(spectator.queryAll(".permission").length).toBe(5);

    expect(spectator.queryAll(".permissions .page .permission").length).toBe(2);
    expect(spectator.queryAll(".permissions .action .permission").length).toBe(
      1
    );
    expect(
      spectator.queryAll(".permissions .documents .permission").length
    ).toBe(1);
    expect(
      spectator.queryAll(".permissions .addresses .permission").length
    ).toBe(1);
  });
});
