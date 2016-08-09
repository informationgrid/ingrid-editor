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
            register: function (form, eventManager) {
                var taskEl = document.querySelector( '#taskId' );
                eventManager.addEventListener( taskEl, 'click', function () {
                    console.log( 'user behaviour click' );
                    form.find( [ 'mainInfo', 'title' ] ).updateValue( 'from user behaviour updated' );
                } );
            }
        }
    ]
} );
