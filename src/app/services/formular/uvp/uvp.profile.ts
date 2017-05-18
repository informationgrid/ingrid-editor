import {TextareaField, TextboxField, Container, DropdownField} from "../../../+form/controls";
import {MapField} from "../../../+form/controls/field-map";
import {LatLng, TileLayer} from "leaflet";
import {PartialGeneratorField} from "../../../+form/controls/field-partial-generator";
import {OpenTableField} from "../../../+form/controls/field-opentable";
import {Profile} from "../profile";
import {LinkDatasetField} from '../../../+form/controls/field-link-dataset';
import {CodelistService} from '../../../+form/services/codelist.service';
import {FieldBase} from '../../../+form/controls/field-base';

export class UVPProfile implements Profile {


  /*linkDocTypes = {
   values: ['PDF', 'XML', 'ZIP', 'TXT', 'andere']
   };*/

  codelistService: CodelistService = null;

  profile: Array<FieldBase<any>> = null;

  constructor(codelistService: CodelistService) {
    this.codelistService = codelistService;
    /*const codelistDropDown = new DropdownField( {
      key: 'numberString',
      label: 'Zahl',
      options: []
    } );*/
    const uvpNumberSelect = new DropdownField( {
      key: 'uvpNumber',
      label: 'UVP Nummer',
      options: []
    } );

    /*this.codelistService.byId( '8000' ).then( codelist => {
      codelistDropDown.options = codelist;
    } );*/
    this.codelistService.byId( '9000' ).then( codelist => {
      uvpNumberSelect.options = codelist;
    } );

    this.profile = [

      // codelistDropDown,

      new Container( {
        key: 'mainInfo',
        domClass: 'half',
        children: [
          new TextboxField( {
            key: 'taskId',
            label: 'Vorhabensnummer',
            // domClass: 'half',
            order: 1,
            required: true
          } ),

          new TextboxField( {
            key: 'title',
            label: 'Titel',
            // domClass: 'half',
            order: 10
          } ),

          new TextareaField( {
            key: 'description',
            label: 'Beschreibung',
            // domClass: 'half',
            rows: 10,
            order: 20
          } ),
        ]
      } ),

      new MapField( {
        key: 'bbox',
        label: 'Karte',
        domClass: 'half',
        height: 340,
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
        order: 12
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
              new TextboxField( {
                key: 'date',
                label: 'Datum',
                // domClass: 'half',
                type: 'date'
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
    let title = doc['mainInfo.title'];
    if (!title) {
      title = doc.mainInfo ? doc.mainInfo.title : '???';
    }
    return title;
  }

  getTitleFields(): string[] {
    return ['mainInfo.title'];
  }
}
