import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ModalService } from "../../services/modal/modal.service";
import { UserService } from "../../services/user/user.service";

@Component({
  selector: "ige-change-name-dialog",
  templateUrl: "./change-name-dialog.component.html",
})
export class ChangeNameDialogComponent implements OnInit {
  form = new FormGroup({
    firstName: new FormControl("", Validators.required),
    lastName: new FormControl("", Validators.required),
  });

  constructor(
    private modalService: ModalService,
    public dialogRef: MatDialogRef<ChangeNameDialogComponent>,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  ngOnInit(): void {
    this.form.setValue({
      firstName: this.data?.firstName ?? "",
      lastName: this.data?.lastName ?? "",
    });
  }

  changeName() {
    this.userService
      .updateCurrentUser({
        firstName: this.form.value.firstName,
        lastName: this.form.value.lastName,
      })
      .subscribe(() => this.dialogRef.close(true));
  }
}
