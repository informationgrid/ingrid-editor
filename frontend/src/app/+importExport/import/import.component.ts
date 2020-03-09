import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ImportExportService } from '../import-export-service';
import { ConfigService } from '../../services/config/config.service';
import { TextboxField } from '../../+form/controls';
import { ErrorService } from '../../services/error.service';

@Component({
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportExportComponent implements OnInit {

  file: File;

  currentTab: string;

  formFields = [];
  form = null;

  msgs: any[];
  uploadedFiles: any[] = [];

  uploadUrl: string;

  constructor(private importExportService: ImportExportService, config: ConfigService,
              private errorService: ErrorService) {

    // this.uploader = new FileUploader({url: config.getConfiguration().backendUrl + '/upload'});
    this.uploadUrl = config.getConfiguration().backendUrl + '/upload';

    // new FormControl()
    this.formFields = [
      new TextboxField({
        key: 'title',
        label: 'Titel',
        help: 'Hier wird der Titel für das Dokument eingetragen'
        // domClass: 'half'
      })
    ];

    const ctrl = new FormControl('xxx');
    this.form = new FormGroup({title: ctrl});
  }

  ngOnInit(): void {
    this.currentTab = 'import';
  }

  import(files: File[]) {
    const file = files[0];
    console.log(file);
    this.importExportService.import(file).subscribe(data => {
      console.log('Import result:', data);
    });
  }

  onUpload(event) {
    for (const file of event.files) {
      this.uploadedFiles.push(file);
    }

    this.msgs = [];
    this.msgs.push({severity: 'info', summary: 'File Uploaded', detail: ''});
  }

  /*handleError(event) {
    this.errorService.handle(event.xhr);
  }*/
}
