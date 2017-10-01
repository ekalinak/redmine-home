requirejs.config({
	paths: {
		jquery: "../bower_components/jquery/dist/jquery.min",
		tooltipLib: "../bower_components/bootstrap/js/tooltip",
		popoverLib: "../bower_components/bootstrap/js/popover",
		knockoutLib: "knockout-3.4.0",
		bootstrapLib: "../bower_components/bootstrap/dist/js/bootstrap.min",
		newTab : "newTab",
		textile: "textile",
		theme : "theme-init",
		tooltip: "tooltip-init",
		knockout: "knockout-3.4.0",
		notes: "modules/Notes"
	}
});

require(['newTab'],function(){});