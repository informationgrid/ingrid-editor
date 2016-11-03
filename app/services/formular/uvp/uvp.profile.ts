import {TextareaField, TextboxField, Container, DropdownField} from "../../../+form/controls";
import {MapField} from "../../../+form/controls/field-map";
import {LatLng, TileLayer} from "leaflet";
import {PartialGeneratorField} from "../../../+form/controls/field-partial-generator";
import {OpenTableField} from "../../../+form/controls/field-opentable";
import {Profile} from "../profile";

export class UVPProfile implements Profile {


  /*linkDocTypes = {
    values: ['PDF', 'XML', 'ZIP', 'TXT', 'andere']
  };*/

  profile = [

    new Container({
      key: 'mainInfo',
      domClass: 'half',
      children: [
        new TextboxField({
          key: 'taskId',
          label: 'Vorhabensnummer',
          // domClass: 'half',
          order: 1
        }),

        new TextboxField({
          key: 'title',
          label: 'Titel',
          // domClass: 'half',
          order: 10
        }),

        new TextareaField({
          key: 'description',
          label: 'Beschreibung',
          // domClass: 'half',
          rows: 10,
          order: 20
        }),
      ]
    }),

    new MapField({
      key: 'bbox',
      label: 'Karte',
      domClass: 'half',
      height: 340,
      options: {
        zoomControl: true,
        center: new LatLng(40.731253, -73.996139),
        zoom: 12,
        minZoom: 4,
        maxZoom: 19,
        layers: [new TileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        })]
      },
      settings: {}
    }),


    new OpenTableField({
      key: 'categories',
      label: 'Kategorien',
      columns: [
        new TextboxField({
          key: 'category',
          label: 'Kategorie'
        })
      ],
      order: 2
    }),

    /*new Container({
     useGroupKey: 'publicDisplay',
     label: 'Öffentliche Auslegung',
     isRepeatable: true,
     order: 10,
     children: [[
     new TextboxField({
     key: 'date',
     label: 'Datum',
     // domClass: 'half',
     type: 'date'
     }),
     new TableField({
     key: 'constructionInfo',
     label: 'Auslegungsinformationen',
     columns: [
     {headerName: 'Titel', field: 'title', editable: true},
     {headerName: 'Link', field: 'link', editable: true},
     {headerName: 'Typ', field: 'type', editable: true, cellEditor: 'select', cellEditorParams: linkDocTypes},
     {headerName: 'Größe', field: 'size', editable: true},
     {headerName: 'Gültig bis', field: 'expiresAt', editable: true}
     ]
     }),
     new TableField({
     key: 'applicationDocs',
     label: 'Antragsunterlagen',
     columns: [
     {headerName: 'Titel', field: 'title', editable: true},
     {headerName: 'Link', field: 'link', editable: true},
     {headerName: 'Typ', field: 'type', editable: true, cellEditor: 'select', cellEditorParams: linkDocTypes},
     {headerName: 'Größe', field: 'size', editable: true},
     {headerName: 'Gültig bis', field: 'expiresAt', editable: true}
     ]
     }),
     new TableField({
     key: 'reportsAndRecommendations',
     label: 'Berichte und Empfehlungen',
     columns: [
     {headerName: 'Titel', field: 'title', editable: true},
     {headerName: 'Link', field: 'link', editable: true},
     {headerName: 'Typ', field: 'type', editable: true, cellEditor: 'select', cellEditorParams: linkDocTypes},
     {headerName: 'Größe', field: 'size', editable: true},
     {headerName: 'Gültig bis', field: 'expiresAt', editable: true}
     ]
     }),
     new TableField({
     key: 'additionalDocs',
     label: 'Weitere Unterlagen',
     columns: [
     {headerName: 'Titel', field: 'title', editable: true},
     {headerName: 'Link', field: 'link', editable: true},
     {headerName: 'Typ', field: 'type', editable: true, cellEditor: 'select', cellEditorParams: linkDocTypes},
     {headerName: 'Größe', field: 'size', editable: true},
     {headerName: 'Gültig bis', field: 'expiresAt', editable: true}
     ]
     })
     ]]
     }),


     new Container({
     useGroupKey: 'publicHearingDates',
     label: 'Erörterungstermin',
     isRepeatable: true,
     order: 15,
     children: [[
     new TextboxField({
     key: 'date',
     label: 'Datum',
     // domClass: 'half',
     type: 'date'
     }),
     new TableField({
     key: 'announcements',
     label: 'Bekanntmachung',
     columns: [
     {headerName: 'Titel', field: 'title', editable: true},
     {headerName: 'Link', field: 'link', editable: true},
     {headerName: 'Typ', field: 'type', editable: true, cellEditor: 'select', cellEditorParams: linkDocTypes},
     {headerName: 'Größe', field: 'size', editable: true},
     {headerName: 'Gültig bis', field: 'expiresAt', editable: true}
     ]
     })
     ]]
     }),

     new Container({
     useGroupKey: 'approvalDecisions',
     label: 'Zulassungsentscheidung',
     isRepeatable: true,
     order: 20,
     children: [[
     new TextboxField({
     key: 'date',
     label: 'Datum',
     // domClass: 'half',
     type: 'date'
     }),
     new TextareaField({
     key: 'paymentDecision',
     label: 'Zahlungsentscheidung',
     // domClass: 'half',
     rows: 5
     }),
     new TableField({
     key: 'constructionInfo',
     label: 'Auslegungsinformationen',
     columns: [
     {headerName: 'Titel', field: 'title', editable: true},
     {headerName: 'Link', field: 'link', editable: true},
     {headerName: 'Typ', field: 'type', editable: true, cellEditor: 'select', cellEditorParams: linkDocTypes},
     {headerName: 'Größe', field: 'size', editable: true},
     {headerName: 'Gültig bis', field: 'expiresAt', editable: true}
     ]
     })
     ]]
     })*/

    new PartialGeneratorField({
      key: 'sections',
      label: 'Sektion hinzufügen',
      order: 5,
      partials: [
        new Container({
          key: 'publicDisplay',
          label: 'Öffentliche Auslegung',
          children: [
            new TextboxField({
              key: 'date',
              label: 'Datum',
              // domClass: 'half',
              type: 'date'
            }),
            new OpenTableField({
              key: 'constructionInfo',
              label: 'Auslegungsinformationen',
              columns: [
                new TextboxField({
                  key: 'title',
                  label: 'Titel'
                }),
                new TextboxField({
                  key: 'link',
                  label: 'Link'
                }),
                new DropdownField({
                  key: 'type',
                  label: 'Typ',
                  options: [{key: 'pdf', value: 'my pdf'}, {key: 'xml', value: 'my xml'}]
                }),
                new TextboxField({
                  key: 'size',
                  label: 'Größe'
                }),
                new TextboxField({
                  key: 'expiresAt',
                  label: 'Gültig bis',
                  type: 'date'
                })
              ]
            }),
            new OpenTableField({
              key: 'applicationDocs',
              label: 'Antragsunterlagen',
              columns: [
                new TextboxField({
                  key: 'title',
                  label: 'Titel'
                }),
                new TextboxField({
                  key: 'link',
                  label: 'Link'
                }),
                new TextboxField({
                  key: 'type',
                  label: 'Typ'
                }),
                new TextboxField({
                  key: 'size',
                  label: 'Größe'
                }),
                new TextboxField({
                  key: 'expiresAt',
                  label: 'Gültig bis',
                  type: 'date'
                })
              ]
            }),
            new OpenTableField({
              key: 'reportsAndRecommendations',
              label: 'Berichte und Empfehlungen',
              columns: [
                new TextboxField({
                  key: 'title',
                  label: 'Titel'
                }),
                new TextboxField({
                  key: 'link',
                  label: 'Link'
                }),
                new TextboxField({
                  key: 'type',
                  label: 'Typ'
                }),
                new TextboxField({
                  key: 'size',
                  label: 'Größe'
                }),
                new TextboxField({
                  key: 'expiresAt',
                  label: 'Gültig bis',
                  type: 'date'
                })
              ]
            }),
            new OpenTableField({
              key: 'additionalDocs',
              label: 'Weitere Unterlagen',
              columns: [
                new TextboxField({
                  key: 'title',
                  label: 'Titel'
                }),
                new TextboxField({
                  key: 'link',
                  label: 'Link'
                }),
                new TextboxField({
                  key: 'type',
                  label: 'Typ'
                }),
                new TextboxField({
                  key: 'size',
                  label: 'Größe'
                }),
                new TextboxField({
                  key: 'expiresAt',
                  label: 'Gültig bis',
                  type: 'date'
                })
              ]
            })
          ]
        }),
        new Container({
          key: 'approvalDecisions',
          label: 'Zulassungsentscheidung',
          children: [
            new TextboxField({
              key: 'date',
              label: 'Datum',
              // domClass: 'half',
              type: 'date'
            }),
            new TextareaField({
              key: 'paymentDecision',
              label: 'Zahlungsentscheidung',
              // domClass: 'half',
              rows: 5
            }),
            new OpenTableField({
              key: 'constructionInfo',
              label: 'Auslegungsinformationen',
              columns: [
                new TextboxField({
                  key: 'title',
                  label: 'Titel'
                }),
                new TextboxField({
                  key: 'link',
                  label: 'Link'
                }),
                new TextboxField({
                  key: 'type',
                  label: 'Typ'
                }),
                new TextboxField({
                  key: 'size',
                  label: 'Größe'
                }),
                new TextboxField({
                  key: 'expiresAt',
                  label: 'Gültig bis',
                  type: 'date'
                })
              ]
            })
          ]
        }),
        new Container({
          key: 'publicHearingDates',
          label: 'Erörterungstermin',
          children: [
            new TextboxField({
              key: 'date',
              label: 'Datum',
              // domClass: 'half',
              type: 'date'
            }),
            new OpenTableField({
              key: 'announcements',
              label: 'Bekanntmachung',
              columns: [
                new TextboxField({
                  key: 'title',
                  label: 'Titel'
                }),
                new TextboxField({
                  key: 'link',
                  label: 'Link'
                }),
                new TextboxField({
                  key: 'type',
                  label: 'Typ'
                }),
                new TextboxField({
                  key: 'size',
                  label: 'Größe'
                }),
                new TextboxField({
                  key: 'expiresAt',
                  label: 'Gültig bis',
                  type: 'date'
                })
              ]
            })
          ]
        })
      ]
    })

  ];

  getTitle(doc: any): string {
    let title = doc['mainInfo.title'];
    if (!title) {
      title = doc.mainInfo.title;
    }
    return title;
  }

  getTitleFields(): string[] {
    return ['mainInfo.title'];
  }
}