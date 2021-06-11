import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {TreePermission} from "../../user";
import {MatTableDataSource} from "@angular/material/table";

export enum PermissionLevel {
  WRITE,
  READ,
  NONE,
}

@Component({
  selector: 'permission-table',
  templateUrl: './permission-table.component.html',
  styleUrls: ['./permission-table.component.scss'],
})
export class PermissionTableComponent implements OnInit, AfterViewInit {


  @Input() title: string;
  @Input() permissions: TreePermission[];

  displayedColumns: string[] = ['title', 'permissionLevel', 'settings'];
  dataSource = new MatTableDataSource([{
    title: "Ordner1",
    path: "pfad ordner/ ... / letzter ordner",
    permissionLevel: PermissionLevel.READ,
    subPermissionLevel: PermissionLevel.NONE
  }]);


  constructor() {
    const initialSelection = [];
    const allowMultiSelect = false;
  }

  ngOnInit() {
  }


  ngAfterViewInit() {

  }

  encodePermission(oldStylePermission: string): [PermissionLevel, PermissionLevel] {
    let folderPermission = PermissionLevel.NONE
    let subFolderPermission = PermissionLevel.NONE
    switch (oldStylePermission) {
      case "writeSubTree":
        subFolderPermission = PermissionLevel.WRITE
        return
      case "readSubTree":
        subFolderPermission = PermissionLevel.READ
        return
      case "writeTree":
        folderPermission = PermissionLevel.WRITE
        subFolderPermission = PermissionLevel.WRITE
        return
      case "readTree":
        folderPermission = PermissionLevel.READ
        subFolderPermission = PermissionLevel.READ
        return
      case "writeDataset":
        folderPermission = PermissionLevel.WRITE
        return
      case "readDataset":
        folderPermission = PermissionLevel.READ
        return
    }
    return [folderPermission, subFolderPermission]
  }

  decodePermission(folderPermission: PermissionLevel, subFolderPermission: PermissionLevel): string[] {
    let encodedPermissions = []
    if (folderPermission == PermissionLevel.WRITE && subFolderPermission == PermissionLevel.WRITE) {
      encodedPermissions.push("writeTree")
    }
    if (folderPermission == PermissionLevel.READ && subFolderPermission == PermissionLevel.READ) {
      encodedPermissions.push("readTree")
    }
    if (folderPermission == PermissionLevel.NONE && subFolderPermission == PermissionLevel.READ) {
      encodedPermissions.push("readSubTree")
    }
    if (folderPermission == PermissionLevel.NONE && subFolderPermission == PermissionLevel.WRITE) {
      encodedPermissions.push("writeSubTree")
    }
    if (folderPermission == PermissionLevel.WRITE && subFolderPermission == PermissionLevel.NONE) {
      encodedPermissions.push("writeDataset")
    }
    if (folderPermission == PermissionLevel.READ && subFolderPermission == PermissionLevel.NONE) {
      encodedPermissions.push("readDataset")
    }

    // TODO Attention! The next 3 cases can't be described as a single permission with the old style
    if (folderPermission == PermissionLevel.WRITE && subFolderPermission == PermissionLevel.READ) {
      encodedPermissions.push("writeDataset")
      encodedPermissions.push("readSubTree")
    }
    if (folderPermission == PermissionLevel.READ && subFolderPermission == PermissionLevel.WRITE) {
      encodedPermissions.push("readDataset")
      encodedPermissions.push("writeSubTree")
    }
    if (folderPermission == PermissionLevel.NONE && subFolderPermission == PermissionLevel.NONE) {
      //NO Rights
    }

    return encodedPermissions
  }

}
