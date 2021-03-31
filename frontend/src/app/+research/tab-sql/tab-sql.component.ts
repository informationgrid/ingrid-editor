import {Component, OnInit, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'ige-tab-sql',
  templateUrl: './tab-sql.component.html',
  styleUrls: ['./tab-sql.component.scss']
})
export class TabSqlComponent implements OnInit {

  @Output() query = new EventEmitter();

  sqlValue: string = '';

  constructor() { }

  ngOnInit(): void {
  }

  updateSql(index: number) {
    if (index === 0) {
      this.sqlValue = `SELECT *
                       FROM document_wrapper
                              JOIN document document1 ON
                         CASE
                           WHEN document_wrapper.draft IS NULL THEN document_wrapper.published = document1.id
                           ELSE document_wrapper.draft = document1.id
                           END
                       WHERE document1.type = 'AddressDoc'
                         AND LOWER(title) LIKE '%test%'`;
    } else if (index === 1) {
      this.sqlValue = `SELECT *
                       FROM document_wrapper
                              JOIN document document1 ON
                         CASE
                           WHEN document_wrapper.draft IS NULL THEN document_wrapper.published = document1.id
                           ELSE document_wrapper.draft = document1.id
                           END
                       WHERE document1.type = 'mCloudDoc'
                         AND data -> 'mCloudCategories' @> '"aviation"'`;
    }
  }

}
