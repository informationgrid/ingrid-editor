import {Component, OnInit} from '@angular/core';
import {ImportExportService} from './import-export-service';

@Component({
  templateUrl: './import-export.component.html',
  styles: [`
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

  currentTab: string;

  constructor(private importExportService: ImportExportService) {

  }

  ngOnInit(): void {
    this.currentTab = 'import';
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
