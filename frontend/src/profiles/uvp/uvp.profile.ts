import {Container, DropdownField, FieldBase, TextareaField, TextboxField} from '../../app/+form/controls';
import {MapField} from '../../app/+form/controls/field-map';
import {PartialGeneratorField} from '../../app/+form/controls/field-partial-generator';
import {OpenTableField} from '../../app/+form/controls/field-opentable';
import {LinkDatasetField} from '../../app/+form/controls/field-link-dataset';
import {CodelistService} from '../../app/services/codelist/codelist.service';
import {DatepickerField} from '../../app/+form/controls/field-datepicker';
import {DocumentService} from '../../app/services/document/document.service';
import {BaseProfile} from '../base.profile';

export class UVPProfile extends BaseProfile {

  id = 'UVP';

  label = 'UVP-Verfahren';

  codelistService = null;

  iconClass = 'fa fa-file-o'; // TODO: make icons same size for better presentation in tree/browser

  constructor(storageService: DocumentService, codelistService: CodelistService) {
    super();

    this.codelistService = codelistService;
    const uvpNumberSelect = new DropdownField( {
      key: 'uvpNumber',
      label: 'UVP Nummer',
      options: []
    } );

    this.codelistService.byId( '9000' ).then( codelist => {
      uvpNumberSelect.options = codelist;
    } );

/*    this.fields = [

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
          center: [ 40.731253, -73.996139 ],
          zoom: 12,
          minZoom: 4,
          maxZoom: 19,
          layers: [
            // {
            //   urlTemplate: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            //   attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
            // }
            // new TileLayer( '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            //   attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
            // } )
          ]
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

    ]*/;
  }

  getTitle(doc: any): string {
    return doc.title ? doc.title : '???';
  }

  getTitleFields(): string[] {
    return ['title'];
  }

  applyValidations(form) {
    console.log('UVP Form validation !?', form);
  };
}
