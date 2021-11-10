import { Component, Inject, Input, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ModalService } from "../../services/modal/modal.service";
import { UserService } from "../../services/user/user.service";
import { FrontendUser } from "../../+user/user";
import { EmailValidator } from "../../formly/ige-formly.module";

@Component({
  selector: "ige-change-email-dialog",
  templateUrl: "./change-email-dialog.component.html",
})
export class ChangeEmailDialogComponent implements OnInit {
  form = new FormGroup({
    email: new FormControl("", [EmailValidator, Validators.required]),
  });

  constructor(
    private modalService: ModalService,
    public dialogRef: MatDialogRef<ChangeEmailDialogComponent>,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  oldMailAddress: string;

  ngOnInit(): void {
    this.oldMailAddress = this.data?.email ?? "";
  }

  changeMailAddress() {
    const newAddress = this.form.value.email;
    this.userService
      .updateCurrentUser(
        new FrontendUser({
          attributes: [],
          creationDate: undefined,
          firstName: "",
          lastName: "",
          login: "",
          modificationDate: undefined,
          organisation: "",
          role: "",
          email: newAddress,
        })
      )
      .subscribe((user) => {
        if (user) {
          this.dialogRef.close(user);
        }
      });
  }
}
