import {Component, ElementRef, OnInit} from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
import {ContextHelpComponent} from "./context-help/context-help.component";
import { MatDialog } from "@angular/material/dialog";
import {Overlay, RepositionScrollStrategy} from "@angular/cdk/overlay";

@Component({
  selector: 'ige-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  description = new FormControl('', [Validators.required]);

  constructor(public dialog: MatDialog, private overlay: Overlay) { }

  ngOnInit() {
  }

  showContextHelp(evt: MouseEvent) {

    const target = new ElementRef(evt.currentTarget);
    this.overlay.position().flexibleConnectedTo(target).positionChanges.subscribe( posChange => {
      console.log("Position changed", posChange);
    });
    let dialogRef = this.dialog.open(ContextHelpComponent, {
      hasBackdrop: false,
      closeOnNavigation: true,

      //data: { dialogRef: dialogRef }
      position: {
        // @ts-ignore
        left: `${target.nativeElement.getBoundingClientRect().left}px`,
        // @ts-ignore
        top: `${target.nativeElement.getBoundingClientRect().top}px`
      },
      /*scrollStrategy: this.overlay.scrollStrategies.reposition({
        autoClose: true
      }),*/
      // height: '400px',
      width: '330px',
    });
  }
}
