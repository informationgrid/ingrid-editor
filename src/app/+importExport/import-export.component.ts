import {Component, OnInit} from '@angular/core';
import {ImportExportService} from './import-export-service';
import {FileUploader} from 'ng2-file-upload';
import {FormControl, FormGroup} from '@angular/forms';
import {TextboxField} from '../+form/controls/field-textbox';
import {ConfigService} from '../config/config.service';

@Component({
  templateUrl: './import-export.component.html',
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    
    [accordion-heading] span {
      vertical-align: middle;
    }
    
    .nv-file-over { border: dotted 3px green; } /* Default class applied to drop zones on over */
    
    .btn-file {
      position: relative;
      overflow: hidden;
    }
    .btn-file input[type=file] {
      position: absolute;
      top: 0;
      right: 0;
      min-width: 100%;
      min-height: 100%;
      font-size: 100px;
      text-align: right;
      filter: alpha(opacity=0);
      opacity: 0;
      outline: none;
      background: white;
      cursor: inherit;
      display: block;
    }
  `]
})
export class ImportExportComponent implements OnInit {

  file: File;

  public uploader:FileUploader = null;
  public hasBaseDropZoneOver:boolean = false;

  currentTab: string;

  formFields = [];
  form = null;

  constructor(private importExportService: ImportExportService, config: ConfigService) {

    this.uploader = new FileUploader({url: config.getConfiguration().backendUrl + '/upload'});

    // new FormControl()
    this.formFields = [
      new TextboxField({
        key: 'title',
        label: 'Titel',
        help: 'Hier wird der Titel für das Dokument eingetragen'
        // domClass: 'half'
      })
    ];

    let ctrl = new FormControl('xxx');
    this.form = new FormGroup({ title: ctrl });
  }

  ngOnInit(): void {
    this.currentTab = 'import';
  }

  public fileOverBase(e:any):void {
    this.hasBaseDropZoneOver = e;
  }

  // onChange(event: EventTarget) {
  //   let eventObj: MSInputMethodContext = <MSInputMethodContext> event;
  //   let target: HTMLInputElement = <HTMLInputElement> eventObj.target;
  //   let files: FileList = target.files;
  //   this.file = files[0];
  //   console.log(this.file);
  // }

  import(files: File[]) {
    let file = files[0];
    console.log(file);
    this.importExportService.import(file).subscribe(data => {
      console.log('Import result:', data);
    });
  }

}
