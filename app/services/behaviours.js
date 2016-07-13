this.behaviours = {
    "clickAndChangeTitle": {
      "title": "Click and change title",
          "description": "",
          "description_en": "",
          "defaultActive": true,
          "run": function (form) {
            var taskEl = document.querySelector( '#taskId' );
            this.eventManager.addEventListener( taskEl, 'click', function() {
                console.log( 'Element was clicked' );
                form.controls['title'].updateValue( "remotely updated" );
            } );
          }
},
    "mapAndChangeTitle": {
      "title": "Enter map and change title",
          "description": "",
          "description_en": "",
          "defaultActive": true,
          "run": function (form) {
            form.controls['map'].valueChanges.subscribe( function(val) {
              if (val === 'map') {
                form.controls['title'].updateValue( 'Map was entered' );
              }
            });
          }
    }
};