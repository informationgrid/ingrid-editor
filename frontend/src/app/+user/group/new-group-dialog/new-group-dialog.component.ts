import { Component, Input, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { GroupService } from "../../../services/role/group.service";
import { Group } from "../../../models/user-group";
import { ModalService } from "../../../services/modal/modal.service";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "ige-new-group-dialog",
  templateUrl: "./new-group-dialog.component.html",
})
export class NewGroupDialogComponent implements OnInit {
  form = new FormGroup({
    name: new FormControl("", Validators.required),
  });

  groups: Group[];

  constructor(
    private groupService: GroupService,
    private modalService: ModalService,
    public dialogRef: MatDialogRef<NewGroupDialogComponent>
  ) {}

  ngOnInit(): void {
    this.groupService.getGroups().subscribe((groups) => (this.groups = groups));
  }

  createGroup() {
    const newGroup = new Group({
      id: null,
      name: this.form.value.name,
    });
    if (this.groups?.filter((group) => group.name === newGroup.name).length) {
      this.modalService.showJavascriptError(
        "Es existiert bereits eine Gruppe mit diesem Namen"
      );
    } else {
      this.groupService.createGroup(newGroup).subscribe((group) => {
        this.dialogRef.close(group);
      });
    }
  }
}
