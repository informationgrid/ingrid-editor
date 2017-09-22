import { Container, DropdownField, TextareaField, TextboxField } from '../../../+form/controls';
import { MapField } from '../../../+form/controls/field-map';
import { LatLng, TileLayer } from 'leaflet';
import { PartialGeneratorField } from '../../../+form/controls/field-partial-generator';
import { OpenTableField } from '../../../+form/controls/field-opentable';
import { Profile } from '../profile';
import { LinkDatasetField } from '../../../+form/controls/field-link-dataset';
import { CodelistService } from '../../../+form/services/codelist.service';
import { FieldBase } from '../../../+form/controls/field-base';
import {Injectable} from '@angular/core';
import {DatepickerField} from '../../../+form/controls/field-datepicker';

@Injectable()
export class UVPProfile implements Profile {

  id = 'UVP';

  codelistService: CodelistService = null;

  profile: Array<FieldBase<any>> = null;

  treeIconClass = 'fa fa-file-o'; // TODO: make icons same size for better presentation in tree/browser

  constructor(codelistService: CodelistService) {
    this.codelistService = codelistService;
    const uvpNumberSelect = new DropdownField( {
      key: 'uvpNumber',
      label: 'UVP Nummer',
      options: []
    } );

    this.codelistService.byId( '9000' ).then( codelist => {
      uvpNumberSelect.options = codelist;
    } );

    this.profile = [

      new Container( {
        domClass: 'half',
        children: [
          new TextboxField( {
            key: 'taskId',
            label: 'Vorhabensnummer',
            order: 1,
            required: true
          } ),

          new TextboxField( {
            key: 'title',
            label: 'Titel',
            order: 10
          } ),

          new TextareaField( {
            key: 'description',
            label: 'Beschreibung',
            rows: 10,
            order: 20
          } ),
        ]
      } ),

      new MapField( {
        key: 'bbox',
        label: 'Karte',
        domClass: 'half',
        height: 365,
        options: {
          zoomControl: true,
          center: new LatLng( 40.731253, -73.996139 ),
          zoom: 12,
          minZoom: 4,
          maxZoom: 19,
          layers: [new TileLayer( 'http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          } )]
        },
        settings: {}
      } ),

      new LinkDatasetField( {
        key: 'publisher',
        label: 'Herausgeber',
        filter: {_profile: 'UVP'},
        order: 2
      } ),

      new OpenTableField( {
        key: 'categories',
        label: 'Kategorien',
        columns: [
          {editor: uvpNumberSelect, formatter: (key) => uvpNumberSelect.options.find( nr => nr.id === key ).value }
        ],
        order: 2
      } ),

      new PartialGeneratorField( {
        key: 'sections',
        label: 'Sektion hinzufügen',
        order: 5,
        partials: [
          new Container( {
            key: 'publicDisplay',
            label: 'Öffentliche Auslegung',
            children: [
              new DatepickerField( {
                key: 'date',
                label: 'Datum',
                // domClass: 'half',
              } ),
              new OpenTableField( {
                key: 'constructionInfo',
                label: 'Auslegungsinformationen',
                columns: [
                  {
                    editor: new TextboxField( {
                      key: 'title',
                      label: 'Titel'
                    } )
                  },
                  {
                    editor: new TextboxField( {
                      key: 'link',
                      label: 'Link'
                    } )
                  },
                  {
                    editor: new DropdownField( {
                      key: 'type',
                      label: 'Typ',
                      options: [{id: 'pdf', value: 'my pdf'}, {id: 'xml', value: 'my xml'}]
                    } )
                  },
                  {
                    editor: new TextboxField( {
                      key: 'size',
                      label: 'Größe'
                    } )
                  },
                  {
                    editor: new TextboxField( {
                      key: 'expiresAt',
                      label: 'Gültig bis',
                      type: 'date'
                    } )
                  }
                ]
              } ),
              new OpenTableField( {
                key: 'applicationDocs',
                label: 'Antragsunterlagen',
                columns: [
                  {
                    editor: new TextboxField( {
                      key: 'title',
                      label: 'Titel'
                    } )
                  },
                  {
                    editor: new TextboxField( {
                      key: 'link',
                      label: 'Link'
                    } )
                  },
                  {
                    editor: new TextboxField( {
                      key: 'type',
                      label: 'Typ'
                    } )
                  },
                  {
                    editor: new TextboxField( {
                      key: 'size',
                      label: 'Größe'
                    } )
                  },
                  {
                    editor: new TextboxField( {
                      key: 'expiresAt',
                      label: 'Gültig bis',
                      type: 'date'
                    } )
                  }
                ]
              } ),
              new OpenTableField( {
                key: 'reportsAndRecommendations',
                label: 'Berichte und Empfehlungen',
                columns: [
                  {
                    editor: new TextboxField( {
                      key: 'title',
                      label: 'Titel'
                    } )
                  },
                  {
                    editor: new TextboxField( {
                      key: 'link',
                      label: 'Link'
                    } )
                  },
                  {
                    editor: new TextboxField( {
                      key: 'type',
                      label: 'Typ'
                    } )
                  },
                  {
                    editor: new TextboxField( {
                      key: 'size',
                      label: 'Größe'
                    } )
                  },
                  {
                    editor: new TextboxField( {
                      key: 'expiresAt',
                      label: 'Gültig bis',
                      type: 'date'
                    } )
                  }
                ]
              } ),
              new OpenTableField( {
                key: 'additionalDocs',
                label: 'Weitere Unterlagen',
                columns: [
                  {
                    editor: new TextboxField( {
                      key: 'title',
                      label: 'Titel'
                    } )
                  },
                  {
                    editor: new TextboxField( {
                      key: 'link',
                      label: 'Link'
                    } )
                  },
                  {
                    editor: new TextboxField( {
                      key: 'type',
                      label: 'Typ'
                    } )
                  },
                  {
                    editor: new TextboxField( {
                      key: 'size',
                      label: 'Größe'
                    } )
                  },
                  {
                    editor: new TextboxField( {
                      key: 'expiresAt',
                      label: 'Gültig bis',
                      type: 'date'
                    } )
                  }
                ]
              } )
            ]
          } ),
          new Container( {
            key: 'approvalDecisions',
            label: 'Zulassungsentscheidung',
            children: [
              new TextboxField( {
                key: 'date',
                label: 'Datum',
                // domClass: 'half',
                type: 'date'
              } ),
              new TextareaField( {
                key: 'paymentDecision',
                label: 'Zahlungsentscheidung',
                // domClass: 'half',
                rows: 5
              } ),
              new OpenTableField( {
                key: 'constructionInfo',
                label: 'Auslegungsinformationen',
                columns: [
                  {
                    editor: new TextboxField( {
                      key: 'title',
                      label: 'Titel'
                    } )
                  },
                  {
                    editor: new TextboxField( {
                      key: 'link',
                      label: 'Link'
                    } )
                  },
                  {
                    editor: new TextboxField( {
                      key: 'type',
                      label: 'Typ'
                    } )
                  },
                  {
                    editor: new TextboxField( {
                      key: 'size',
                      label: 'Größe'
                    } )
                  },
                  {
                    editor: new TextboxField( {
                      key: 'expiresAt',
                      label: 'Gültig bis',
                      type: 'date'
                    } )
                  }
                ]
              } )
            ]
          } ),
          new Container( {
            key: 'publicHearingDates',
            label: 'Erörterungstermin',
            children: [
              new TextboxField( {
                key: 'date',
                label: 'Datum',
                // domClass: 'half',
                type: 'date'
              } ),
              new OpenTableField( {
                key: 'announcements',
                label: 'Bekanntmachung',
                columns: [
                  {
                    editor: new TextboxField( {
                      key: 'title',
                      label: 'Titel'
                    } )
                  },
                  {
                    editor: new TextboxField( {
                      key: 'link',
                      label: 'Link'
                    } )
                  },
                  {
                    editor: new TextboxField( {
                      key: 'type',
                      label: 'Typ'
                    } )
                  },
                  {
                    editor: new TextboxField( {
                      key: 'size',
                      label: 'Größe'
                    } )
                  },
                  {
                    editor: new TextboxField( {
                      key: 'expiresAt',
                      label: 'Gültig bis',
                      type: 'date'
                    } )
                  }
                ]
              } )
            ]
          } )
        ]
      } )

    ];
  }

  getTitle(doc: any): string {
    return doc.title ? doc.title : '???';
  }

  getTitleFields(): string[] {
    return ['title'];
  }
}
