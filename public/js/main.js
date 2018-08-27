/*requirejs.config({
    paths: {
        vendor: '../vendor',
		postmonger: 'vendor/postmonger'
    },
    shim: {
        'vendor/jquery.min': {
            exports: '$'
        },
		'customActivity': {
			deps: ['vendor/jquery.min', 'vendor/postmonger']
		},
		'blocksdk': {
			deps: ['vendor/blocksdk.min', 'vendor/postmonger']
		}
    }
});

requirejs( ['vendor/jquery.min', 'customActivity', 'blocksdk'], function( $, customActivity ) {
	console.log( 'REQUIRE LOADED' );
});

requirejs.onError = function( err ) {
	//console.log( "REQUIRE ERROR: ", err );
	if( err.requireType === 'timeout' ) {
		console.log( 'modules: ' + err.requireModules );
	}

	throw err;
};*/




