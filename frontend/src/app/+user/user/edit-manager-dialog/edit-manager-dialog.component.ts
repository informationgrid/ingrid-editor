import { Component, Inject, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { FrontendUser } from "../../user";
import { getManagerFormFields } from "./manager.formly-fields";
import { UserService } from "../../../services/user/user.service";
import { map } from "rxjs/operators";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Group } from "../../../models/user-group";
import { GroupService } from "../../../services/role/group.service";

@Component({
  selector: "ige-edit-manager-dialog",
  templateUrl: "./edit-manager-dialog.component.html",
  styleUrls: ["./edit-manager-dialog.component.scss"],
})
export class EditManagerDialogComponent implements OnInit {
  constructor(
    private userService: UserService,
    public dialogRef: MatDialogRef<EditManagerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  user: FrontendUser;
  group: Group;
  form: FormGroup;
  formlyFieldConfig: FormlyFieldConfig[];
  forGroup: boolean;

  ngOnInit(): void {
    if (this.data.group) this.forGroup = true;
    this.user = this.data.user;
    this.group = this.data.group;
    console.log(this.user, this.group);
    const potentialManagers = this.userService.getPotentialManagers(
      this.user,
      this.forGroup
    );
    this.formlyFieldConfig = getManagerFormFields(
      potentialManagers.pipe(
        map((users) =>
          users.map((user) => {
            return {
              label: `${user.firstName} ${user.lastName} (${user.login})`,
              value: user.login,
            };
          })
        )
      )
    );

    this.form = new FormGroup({});
  }

  updateManager() {
    this.dialogRef.close(this.user);
  }
}
