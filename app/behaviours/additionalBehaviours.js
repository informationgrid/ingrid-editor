(function (name, definition) {
    if (typeof module != 'undefined' && module.exports) module.exports = definition();
    else if (typeof define == 'function' && define.amd) define( definition );
    else this[ name ] = definition()
})( 'additionalBehaviours', function () {
    return [
        {
            id: 'addBehaviour1',
            title: 'My user behaviour 1',
            defaultActive: false,
            forProfile: 'ISO',
            listeners: [],
            controls: [
                {
                    controlType: 'textbox',
                    key: 'additionalField',
                    label: 'new control',
                    domClass: 'full'
                }
            ],
            register: function (form, eventManager) {
                var taskEl = document.querySelector( '#title' );
                var listener = eventManager.addEventListener( taskEl, 'click', function () {
                    console.log( 'user behaviour click' );
                    form.find( [ 'title' ] ).updateValue( 'from user behaviour updated' );
                } );
                this.listeners.push( listener );
            },
            unregister: function() {
                this.listeners.forEach(function (l) {
                    l();
                });
            }
        }
    ]
} );
