(function($){
	$(document).ready(function(){
		var optionsViewModel = {
			// Titles, Labels & Messages
			optionsPageTitle 		: chrome.i18n.getMessage('optionsPageTitle'),
			labelBackNewTab 		: chrome.i18n.getMessage('labelBackNewTab'),
            saveOptionsLabel 		: chrome.i18n.getMessage('saveOptionsLabel'),
            resetOptionsLabel 		: chrome.i18n.getMessage('resetOptionsLabel'),
            optionsSavedMessage 	: chrome.i18n.getMessage('optionsSavedMessage'),
            resetLocalOptionsLabel 	: chrome.i18n.getMessage('resetLocalOptionsLabel'),

			// Control variables
			optionsSaved : ko.observable(false),

			// Options
			optionsDefinition : {
				redmineUrl 			: '#redmineLink',
				redmineApi			: '#redmineApiKey',
                issuesUpdateInterval: '#updateTime',
				theme				: '#theme',
                issueDetailEnabled	: '#issueDetailEnabled',
                openIssuesNewTab 	: '#openIssuesNewTab',
                myAccountLink		: '#myAccountLink',
				showTime			: '#showTime'
			},

			optionsToLocalSave : [
				'openIssuesNewTab',
				'issueDetailEnabled',
				'issuesUpdateInterval',
				'theme'
			],

			init : function(){
				var self = this;
                chrome.storage.sync.get('options',function(items){
                	var optionsAreSaved = ( Object.keys(items).length > 0 );
                	for ( var key in items.options ) {
						$(self.optionsDefinition[key]).val(items.options[key]);
					}
                });
                return this;
			},

			saveOptions : function(){
				var self = this;
				var options = {};

				for ( var key in self.optionsDefinition ) {
					var valuetoSave = $(self.optionsDefinition[key]).val();
					if ( key == 'redmineUrl') {
						if ( valuetoSave.substr(-1) != '/' ) {
                            valuetoSave += '/';
                            $(self.optionsDefinition[key]).val(valuetoSave);
						}

						if ( valuetoSave.substr(0,4) != 'http' ) {
							valuetoSave = 'https://' + valuetoSave;
						}

					}
					if ( this.optionsToLocalSave.indexOf(key) != -1 ) {
						localStorage.setItem(key,valuetoSave);
					}
                    options[key] = valuetoSave;
				}

				chrome.storage.sync.set({
					'options' : options
				},function(){
					self.optionsSaved(true);
					setTimeout(function(){
						self.optionsSaved(false);
					},3000)
				})
			},

            resetOptions : function(){
				var self = this;
				chrome.storage.sync.remove('options',function(){
					self.optionsSaved(false);
				});
			},

            /**
			 * Completely removes all data which were save to local storage.
             */
            resetLocalOptions : function() {
            	this.optionsToLocalSave.forEach(function(item){
            		localStorage.removeItem(item);
				});

            	// Additional locally saved data.
            	localStorage.removeItem('currentUser');
            	localStorage.removeItem('issueDetails');
            	localStorage.removeItem('issuesLastUpdated');
            	localStorage.removeItem('projectsData');
            	localStorage.removeItem('redmineIssues');
			}
		};

		ko.applyBindings(optionsViewModel.init());
        $('[data-toggle="tooltip"]').tooltip();
	});
})(jQuery);

// Theme config
var theme = localStorage.getItem('theme');
if ( theme && theme!='none') {
    jQuery('head').append('<link rel="stylesheet" href="../css/themes/' + theme + '/bootstrap.min.css" />')
}
