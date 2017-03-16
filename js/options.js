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

			// Dynamic labels
			projectLabel : ko.observable(),
			projectStatus : ko.observable(false),

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
                this.setProjectLabel();
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
			},

			parseProjects : function(){
            	var self1 = this;
            	this.setProjectLabel(true);
            	setTimeout(function(){
            		chrome.storage.sync.get('options',function(items){
	                    if ( typeof(items.options) == 'undefined') {
	                        window.location.href='options.html';
	                    }

	                    var options = items.options;
	                    var stopFlag = false;
	                    var step = 0;
	                    var counter = 0;
	                    var safeCounter = 0;
	                    localStorage.setItem('projects',JSON.stringify({}));
	                    var self = self1;

	                    do {
	                    	safeCounter++;
	                        $.ajax({
	                            contentType : 'application/json',
	                            headers : {
	                                'X-Redmine-API-Key' : options['redmineApi']
	                            },
	                            url : options['redmineUrl'] + 'projects.json?limit=100&offset='+step*100,
	                            async: false,
	                            success : function( data ){
	                            	if ( data.projects.length < 100 ) {
	                            		stopFlag = true;
									}
	                                var i;
	                            	var savedProjects = JSON.parse(localStorage.getItem('projects'));
	                                var projects = ( savedProjects ) ? savedProjects : {};
	                                for ( i in data.projects ) {
	                                    var name = data.projects[i]['identifier'];
	                                    var desc = data.projects[i]['name'].replace('&','and');
	                                    if ( data.projects[i]['description'].length ) {
	                                    	desc += ': ' + data.projects[i]['description']
													.substring(0,50)
													.replace('&',' and ');
										}
	                                    projects[counter] = {
	                                        content: 		name,
	                                        description: 	desc
	                                    };
	                                    counter++;
	                                }
	                                step++;
	                                localStorage.setItem('projects',JSON.stringify(projects));
	                            }
	                        });
						} while ( !stopFlag && safeCounter < 20 );

	                    self.projectStatus(true);
	                    self.setProjectLabel();
	                    // self.toggleLoader(currentTarget);
	                });
            	}, 200);
            	
			},
			setProjectLabel : function( loading = false ){
				if ( loading ) {
					this.projectLabel('Projects are being downloaded ...');
					return true;
				}

				if ( typeof(localStorage.projects) == 'undefined') {
					this.projectLabel('There is no parsed projects yet. Please click here to parse them.');
					this.projectStatus(false);
					return true;
				}
				var savedProjects = JSON.parse(localStorage.projects);
				if ( savedProjects ){
					var counter = 0;
					for ( var i in savedProjects ) {
						counter++;
					}
				} else {
					this.projectStatus(false);
					this.projectLabel('There are no parsed projects');
					return true;
				}
				this.projectLabel('There are ' + counter + ' projects saved.');
				this.projectStatus(true);
			},

			toggleLoader : function( obj,event ){
				var elem = event.currentTarget.parentElement;
				elem.classList.toggle('is-loading');
				this.parseProjects();
			},

			getProjectStyle: function(){
				return ( this.projectStatus() )
                ? 'btn-info'
                : 'btn-warning';
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
