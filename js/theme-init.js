define(['jquery'],function(jQuery){
	// Theme config
	var theme = localStorage.getItem('theme');
	if ( theme && theme!='none') {
	    jQuery('head').append('<link rel="stylesheet" href="../css/themes/' + theme + '/bootstrap.min.css" />');
	}
});
