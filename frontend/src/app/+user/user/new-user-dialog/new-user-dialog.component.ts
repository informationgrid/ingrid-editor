import { Component, Inject, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { UserService } from "../../../services/user/user.service";
import { FrontendUser } from "../../user";
import { ConfigService } from "../../../services/config/config.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { IgeError } from "../../../models/ige-error";
import { SelectOption } from "../../../services/codelist/codelist.service";
import { tap } from "rxjs/operators";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { CodelistEntry } from "../../../store/codelist/codelist.model";

@Component({
  selector: "ige-new-user-dialog",
  templateUrl: "./new-user-dialog.component.html",
  styleUrls: ["./new-user-dialog.component.css"],
})
export class NewUserDialogComponent implements OnInit {
  users: Observable<FrontendUser[]> = this.userService
    .getExternalUsers()
    .pipe(tap((users) => (this.noAvailableUsers = users.length === 0)));
  form: FormGroup;
  roles: SelectOption[];
  noAvailableUsers = true;
  importExternal: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private userService: UserService,
    private configService: ConfigService
  ) {}

  ngOnInit(): void {
    this.initRoles();
    this.importExternal = this.data?.importExternal ?? false;

    this.form = new FormGroup({
      role: new FormControl("", Validators.required),
    });
    if (this.importExternal) {
      this.form.addControl("user", new FormControl("", Validators.required));
    } else {
      this.form.addControl(
        "userLogin",
        new FormControl("", Validators.required)
      );
    }
  }

  private initRoles() {
    const userRole = this.configService.$userInfo.value.role;
    switch (userRole) {
      case "ige-super-admin":
      case "cat-admin":
        this.roles = this.userService.availableRoles;
        break;
      case "md-admin":
        this.roles = this.userService.availableRoles.filter(
          (r) => r.value !== "cat-admin"
        );
        break;
      case "author":
      default:
        throw new IgeError("Als Autor dürfen Sie keine Nutzer anlegen");
    }
  }
}
