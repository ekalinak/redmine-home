var Redmine = {};

Redmine.Omnibox = {
    options : false,
    projects : {},
    loadConfig : function(){
        var self = this;
        if ( this.options ) {
            return this.options;
        }
        chrome.storage.sync.get('options',function(items){
            if ( typeof(items.options) == 'undefined') {
                self.options = {};
            }

            self.options = items.options;
        });
    },
    getConfig : function(){
        return this.options;
    },
    getProjects : function(){
        if ( typeof(localStorage.projects) == 'undefined' ) {
            localStorage.projects = {};
        }
        return JSON.parse(localStorage.projects);
    },
    searchProject : function(pattern){
        var i;
        var suggest = [];
        var projects = this.getProjects();

        for ( i in projects ) {
            if ( projects[i].content.toLowerCase().indexOf(pattern.toLowerCase()) != -1
                || projects[i].description.toLowerCase().indexOf(pattern.toLowerCase()) != -1 ) {
                suggest.push(projects[i]);
            }
        }
        return suggest;
    }
};

chrome.omnibox.onInputChanged.addListener(
    function(text, suggest) {
        var omni = Redmine.Omnibox;
        omni.loadConfig();
        if ( text.length > 2 ) {
            var suggestion = omni.searchProject(text);
            suggest(suggestion);
        }
    });

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(
    function(text) {
        var options = Redmine.Omnibox.getConfig();
        var redmineUrl = options.redmineUrl;
        var params = text.split(' ');
        if ( params[0] === 'issue' ) {
            chrome.tabs.update({url: redmineUrl + "issues/" + params[1]});
        } else {
            var project = params[0];
            if ( typeof(params[1]) !== 'undefined' ) {
                project += '/' + params[1];
            }
            chrome.tabs.update({url: redmineUrl + "projects/" + project});
        }
    });