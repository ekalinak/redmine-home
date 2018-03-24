define(['jquery','knockoutLib','tooltip','theme-init','textile','bootstrapLib'],function($, ko){

        var newTabViewModel = function(){
            var self = this;
            // Titles, Labels & Texts
            this.title                  = chrome.i18n.getMessage('mainHeader');
            this.optionsPageTitle       = chrome.i18n.getMessage('optionsPageTitle');
            this.originalSearchLabel    = chrome.i18n.getMessage('originalSearchLabel');
            this.optionsPageLabel       = chrome.i18n.getMessage('optionsPageLabel');
            this.googleCom              = chrome.i18n.getMessage('googleCom');
            this.refreshingData         = chrome.i18n.getMessage('refreshingData');
            this.refreshStatus          = chrome.i18n.getMessage('refreshStatus');
            this.subjectLabel           = chrome.i18n.getMessage('subjectLabel');
            this.projectNameLabel       = chrome.i18n.getMessage('projectNameLabel');
            this.priorityLabel          = chrome.i18n.getMessage('priority');
            this.trackerLabel           = chrome.i18n.getMessage('trackerLabel');

            // Class control variables
            this.issues             = ko.observableArray([]);
            this.issuesCount        = ko.observable(0);
            this.hiddenIssues       = ko.observable(0);
            self.options            = ko.observable();
            this.savingIssuesDetails= ko.observable(false);
            this.currentTime        = ko.observable(false);
            this.showTime           = ko.observable(false);
            this.progressCounter    = ko.observable(0);
            this.percentage         = ko.observable('0%');
            this.refreshingStatus   = ko.observable(false);
            this.stableStatus       = ko.observable(!this.refreshingStatus());
            this.lastIssuesUpdate   = ko.observable(false);
            this.haveIssues         = ko.observable(false);
            this.issueTableVisible  = ko.observable(true);
            this.searchVisible      = ko.observable(true);
            this.searchActive       = ko.observable(false);
            this.issueDetailActive  = ko.observable(false);
            this.issueDetailLoading = ko.observable(false);
            this.showMyAccount      = ko.observable(false);
            this.showMyIssues       = ko.observable(false);
            this.showTodos          = ko.observable(false);
            this.minimizeTodos      = ko.observable(true);
            this.mainColumnWidth    = ko.observable('col-xs-12');
            self.openedIssue        = ko.observable({
                name: 'init',
                id : '',
                description : '',
                notes : {}
            });

            // Identifiers
            this.searchInput = '#issuesSearch';

            /**
             * Init function. Fires with model instance.
             *
             * @returns {newTabViewModel}
             */
            this.init = function(){
                var self = this;
                var redmineIssues = this.getLocalIssues(true);

                this.handleTodos();

                // Fill stored issues
                if ( redmineIssues && redmineIssues.length ) {
                    this.issues(redmineIssues);
                    this.issuesCount(this.issues().length);
                    this.haveIssues(true);
                }

                // Init options
                chrome.storage.sync.get('options',function(items){
                    if ( typeof(items.options) == 'undefined') {
                        window.location.href='options.html';
                    }

                    self.options(items.options);

                    self.showMyAccount(parseInt(items.options['myAccountLink']));

                    if ( items.options['showTime'] && parseInt(items.options['showTime']) != 0 ) {
                        self.initTime((parseInt(items.options['showTime']) == 2));
                    }


                    // Init current user data
                    if ( !localStorage.getItem('currentUser') ) { 
                        self.getCurrentUserInfo();
                    } else {
                        self.showMyIssues(true);
                    }
                });

                return this;
            };

            /**
             * Function will render time value to template. ( also calls itself whenever
             * needed )
             *
             * @param showSeconds
             */
            self.initTime = function( showSeconds ){
                self.showTime(true);
                if ( typeof(this.valueOf()) != 'object' && showSeconds !== false ){
                    showSeconds = this.valueOf();
                }
                if ( typeof( showSeconds) == 'undefined' || showSeconds === false ) {
                    showSeconds = false;
                    setTimeout(self.initTime.bind(showSeconds), 60000);
                } else {
                    showSeconds = true;
                    setTimeout(self.initTime.bind(showSeconds), 1000);
                }

                var date = new Date();
                var hours = '0' + date.getHours();
                var minutes = '0' + date.getMinutes();
                var seconds = '0' + date.getSeconds();

                var time = hours.slice(-2) + ':' + minutes.slice(-2);

                if ( showSeconds ) {
                    time += ':' + seconds.slice(-2);
                }

                self.currentTime( time );
            };

            this.getCurrentUserInfo = function(){
                var self = this;
                $.ajax({
                    contentType : 'application/json',
                    headers : {
                        'X-Redmine-API-Key' : this.options()['redmineApi']
                    },
                    url : this.options()['redmineUrl'] + 'users/current.json',
                    success : function( data ){
                        localStorage.setItem('currentUser',JSON.stringify(data.user));
                        self.showMyIssues(true);
                    }
                });
            };

            /**
             * Retrieve issues from Redmine
             */
            this.getIssues = function(){
                var self = this;
                chrome.storage.sync.get('options',function(items){
                    self.options(items.options);
                    self.refreshingStatus(true);
                    // TODO: Make "limit" configurable
                    var ajaxUrl = items.options['redmineUrl'];
                    ajaxUrl += 'issues.json?assigned_to_id=me';
                    ajaxUrl += '&sort=';
                    if (parseInt(items.options['sortDueDate'])) {
                        ajaxUrl += 'due_date:asc,';
                    }
                    ajaxUrl += 'priority:desc,id:asc';
                    ajaxUrl += '&limit=100';

                    $.ajax({
                        contentType : 'application/json',
                        headers : {
                            'X-Redmine-API-Key' : items.options['redmineApi']
                        },
                        url : ajaxUrl,
                        success: function(data){
                            var date = new Date();

                            localStorage.setItem('redmineIssues', JSON.stringify(data));
                            localStorage.setItem('issuesLastUpdated', date.getTime() );
                            self.refreshingStatus(false);

                            var filteredIssues = self.filterIssues(data.issues);

                            self.issues(filteredIssues);
                            self.issuesUpdatedFlag(date.getTime());
                        }
                    });
                });
            };

            /**
             * Update information when was issues updated last time.
             *
             * @param lastUpdateTime
             * @param onlyOutput
             */
            this.issuesUpdatedFlag = function(lastUpdateTime, onlyOutput){
                if ( lastUpdateTime ) {
                    var lu = new Date(parseInt(lastUpdateTime));
                    var minutes =  (lu.getMinutes() < 10) ? '0' + lu.getMinutes() : lu.getMinutes();
                    var dateString = lu.getDate() + '.' + (lu.getMonth()+1) + '.' + lu.getFullYear() + ' ' + lu.getHours() + ':' + minutes;
                    if ( onlyOutput ) {
                        return dateString
                    }
                    self.lastIssuesUpdate(dateString);
                }
            };

            /**
             * Opens issue in Redmine system
             */
            self.redirectToIssue = function(){
                var url = self.options()['redmineUrl'] + 'issues/' + this.id;
                self.openLink(url);
            };

            this.redirectToHome = function(){
                var url = this.options()['redmineUrl'];
                if ( url ) {
                    this.openLink(url);    
                    return true;
                }
                return false;
            };

            /**
             *  Filter currently displayed issues
             *
             * @param classReference
             * @param eventData
             * @returns {boolean}
             */
            this.searchInIssues = function(classReference,eventData){
                if ( typeof(eventData) == 'undefined' || typeof(eventData.currentTarget) == 'undefined') {
                    return false;
                }
                this.issueTableVisible(true);
                var searchValue = eventData.currentTarget.value;
                var issuesToSearch = ( eventData.originalEvent.code == 'Backspace' || eventData.originalEvent.code == 'Delete' )
                                        ? this.getLocalIssues()
                                        : this.issues();
                var issuesLength = issuesToSearch.length;

                if ( searchValue.length == 0 ) {
                    this.issues(issuesToSearch);
                    this.searchActive(false);
                } else {
                    this.searchActive(true);
                }

                searchValue = searchValue.toLowerCase();
                var foundItems = [];

                for ( var i = 0; i < issuesLength; i++ ) {
                    if ( String(issuesToSearch[i]['id']).toLowerCase().indexOf(searchValue) != -1
                        || String(issuesToSearch[i]['subject']).toLowerCase().indexOf(searchValue) != -1
                        || String(issuesToSearch[i]['priority']['name']).toLowerCase().indexOf(searchValue) != -1
                        || String(issuesToSearch[i]['project']['name']).toLowerCase().indexOf(searchValue) != -1
                        || String(issuesToSearch[i]['tracker']['name']).toLowerCase().indexOf(searchValue) != -1
                    ) {
                        // this.issues.remove(this.issues()[i]);
                        //issuesToSearch.splice(i,1);
                        foundItems.push(issuesToSearch[i]);
                    }
                }

                if ( !foundItems.length ) {
                    this.issueTableVisible(false);
                }

                this.issuesCount(foundItems.length);
                this.issues(foundItems);
            };

            /**
             * Clears search input
             */
            this.clearSearch = function(){
                $(this.searchInput).val('');
                this.resetColumnIcons();
                this.issues(this.getLocalIssues());
                this.issuesCount(this.getLocalIssues().length);
                this.searchActive(false);
            };

            /**
             * Return locally saved issues. If needed, it updates list of issues
             * from remote.
             *
             * Init parameter is to avoid multiple definition of "setTimeout" function.
             *
             * @param init true|false
             * @returns {*}
             */
            this.getLocalIssues = function( init ){
                var localData = JSON.parse(localStorage.getItem('redmineIssues'));
                var date = new Date();

                var issuesLastUpldated = localStorage.getItem('issuesLastUpdated');
                this.issuesUpdatedFlag(issuesLastUpldated);
                var issuesUpdateInterval = localStorage.getItem('issuesUpdateInterval');
                var forceUpdate = ( (date.getTime() - issuesLastUpldated) > issuesUpdateInterval*60*1000 );

                if ( forceUpdate || !issuesLastUpldated || !localData ) {
                    self.getIssues();
                }

                if ( typeof(localData) != 'object' || !localData ){
                    return false;
                }

                if ( init ) {
                    setTimeout(this.getLocalIssues.bind(this, true), 3000);    
                }

                if ( !parseInt(localStorage.getItem('filterStatusFlag')) ) {
                    return localData.issues;
                }

                return this.filterIssues(localData.issues);

            };

            this.filterIssues = function( issues ){
                if ( !parseInt(localStorage.getItem('filterStatusFlag')) ) {
                    return issues;
                }

                var filterIssues = localStorage.getItem('filterStatus').split(',');
                var finalTasks = {};
                finalTasks.issues = [];

                var originalCount = issues.length;

                for ( var i in issues ) {
                    if (typeof(issues[i]['due_date']) === 'undefined') {
                       issues[i]['due_date'] = '';
                    }
                    if ( filterIssues.indexOf(issues[i].status.name) === -1 ) {
                        finalTasks.issues.push(issues[i]);
                    }
                }

                this.hiddenIssues(originalCount - finalTasks.issues.length);
                this.issuesCount(finalTasks.issues.length);

                return finalTasks.issues;
            }


            /**
             * Returns issue label class
             *
             * @param data
             * @returns {*}
             */
            self.getIssueLabel = function( data ){
                var returnClass = 'label';
                if ( !data ) {
                    return returnClass;
                }

                switch (data.priority.name) {
                    case 'Immediate':
                        return returnClass + ' label-danger';
                        break;
                    case 'Urgent':
                        return returnClass + ' label-warning';
                        break;
                    case 'High':
                        return returnClass + ' label-primary';
                        break;
                    case 'Normal':
                        return returnClass + ' label-info';
                        break;
                    case 'Low':
                    default:
                        return returnClass + ' label-default';
                        break;
                }
            };

            /**
             * Shows issue detail
             *
             * @returns {boolean}
             */
            self.openIssue = function(){
                if (!parseInt(self.options()['issueDetailEnabled'])) {
                    return false;
                }
                self.issueTableVisible(false);
                self.issueDetailActive(true);
                self.showTodos(false);
                self.handleMainColumnWidth(true);
                window.location.href = '#top';
                self.searchVisible(false);

                var issueId = ( this.id ) ? this.id : false;
                var issueDetails = ( localStorage.getItem('issueDetails') )
                    ? JSON.parse(localStorage.getItem('issueDetails'))
                    : false;

                if ( !issueId ) {
                    return false;
                }

                var date = new Date();

                if ( issueDetails
                        && typeof(issueDetails[issueId]) != 'undefined'
                        && (date.getTime() - issueDetails[issueId]['lastUpdated'] ) < localStorage.getItem('issuesUpdateInterval') * 60 * 1000 ) {
                    self.openedIssue(issueDetails[issueId]);
                    return true;
                }

                // We have to load issue detail
                self.issueDetailLoading(true);
                self.refreshIssueData(issueId);
                return true;
            };

            /**
             * Refresh issue data from remote
             *
             * @param issueId
             */
            this.refreshIssueData = function(issueId){
                this.issueDetailLoading(true);
                var self = this;
                var issueDetails = ( localStorage.getItem('issueDetails') )
                    ? JSON.parse(localStorage.getItem('issueDetails'))
                    : false;
                if ( typeof(issueId) == 'object' ) {
                    issueId = this.openedIssue()['id'];
                }
                $.ajax({
                    contentType : 'application/json',
                    headers : {
                        'X-Redmine-API-Key' : this.options()['redmineApi']
                    },
                    url : this.options()['redmineUrl'] + 'issues/' + issueId + '.json?include=journals,attachments',
                    success: function(data){
                        var projectShortcut = data.issue.project.name.split(' ')[0];
                        var convertedDescription = convert(data.issue.description);
                        var openedIssue = {
                            url: self.options()['redmineUrl']+'issues/'+data.issue.id,
                            name: data.issue.subject + '<small>@' + projectShortcut + ', #' + data.issue.id + '</small>',
                            id : data.issue.id,
                            description : convertedDescription,
                            attachments : (data.issue.attachments.length ) ? data.issue.attachments : false,
                            lastUpdated : Date.now(),
                            notes : []
                        };

                        // Process notes
                        if ( data.issue.journals.length ) {
                            data.issue.journals.forEach(function(note){
                                if ( note.notes && note.notes.length ) {
                                    var addNote = {
                                        author: note['user']['name'],
                                        note : convert(note['notes'])
                                    };

                                    // Add responsive images classes
                                    if ( addNote.note.indexOf('img') != -1 ) {
                                        addNote.note = addNote.note.replace('img', 'img class="img-responsive"');
                                    }

                                    openedIssue.notes.push(addNote)
                                }
                            });
                        }

                        // Process attachments
                        if ( data.issue.attachments.length ) {
                            data.issue.attachments.forEach(function(att){
                                openedIssue.notes.forEach(function(note){
                                    if ( note.note.indexOf(att.filename) != -1 ) {
                                        note.note = note.note.replace(att.filename, att.content_url);
                                    }
                                });
                                if ( openedIssue.description.indexOf(att.filename) !== -1) {
                                    openedIssue.description = openedIssue.description.replace(att.filename, att.content_url);
                                }
                            });
                        }

                        // Save issue details locally
                        var key = data.issue.id;
                        if ( !issueDetails ) {
                            issueDetails = {};
                        }
                        issueDetails[data.issue.id] = openedIssue;
                        localStorage.setItem('issueDetails',JSON.stringify(issueDetails));

                        self.openedIssue(openedIssue);
                        self.issueDetailLoading(false);

                        // If mass issue data local download
                        if ( self.savingIssuesDetails() ) {
                            self.progressCounter(self.progressCounter()+1);
                            if ( self.progressCounter() == self.issues().length ) {
                                self.percentage('100%');
                                setTimeout(function(){
                                    self.savingIssuesDetails(false);
                                },2000);
                            } else {
                                self.percentage(((100/self.issues().length)*self.progressCounter()) + '%');
                            }
                        }
                    }
                });
            };

            /**
             * Return true, if issue detail is enabled in options
             * @returns {boolean}
             */
            this.enabledIssueDetail = ko.observable(( localStorage.getItem('issueDetailEnabled') == 1 ));

            this.enabledDueDate = ko.observable(( localStorage.getItem('sortDueDate') == 1 ));

            /**
             * Columns configuration ( issues table )
             */
            this.columns = ko.observableArray([
                { property: 'id',       sortAttribute: 'id',            sortOrder : ko.observable(), label: chrome.i18n.getMessage('idLabel'),          visible: true },
                { property: 'priority', sortAttribute: 'priority.name', sortOrder : ko.observable(), label: chrome.i18n.getMessage('priorityLabel'),    visible: true },
                { property: 'subject',  sortAttribute: 'subject',       sortOrder : ko.observable(), label: chrome.i18n.getMessage('subjectLabel'),     visible: true },
                { property: 'project',  sortAttribute: 'project.name',  sortOrder : ko.observable(), label: chrome.i18n.getMessage('projectNameLabel'), visible: true },
                { property: 'tracker',  sortAttribute: 'tracker.name',  sortOrder : ko.observable(), label: chrome.i18n.getMessage('trackerLabel'),     visible: this.enabledIssueDetail() },
                { property: 'due_date', sortAttribute: 'due_date',      sortOrder : ko.observable(), label: chrome.i18n.getMessage('due date'),         visible: this.enabledDueDate()}
            ]);

            /**
             * Will close the issue detail.
             */
            this.closeIssueDetail = function(){
                this.issueDetailActive(false);
                this.issueTableVisible(true);
                this.searchVisible(true);
                // this.showTodos(true);
                this.handleTodos();
            };

            /**
             * Downloads all issue details data and save them to local storage.
             */
            this.downloadAllIssuesLocally = function(){
                var self = this;
                var issuesToDownload = this.issues();
                this.savingIssuesDetails(true);
                this.progressCounter(0);
                this.percentage('0%');

                issuesToDownload.forEach(function(issue){
                    self.refreshIssueData(issue.id);
                });
            };

            /**
             * Function opens link in new tab or in current window based on
             * saved configuration.
             *
             * @param url
             */
            this.openLink = function( url ){
                if ( parseInt(this.options()['openIssuesNewTab']) ) {
                    window.open(url, '_blank');
                } else {
                    $('#loader').show();
                    window.location.href = url;
                }
            };

            /**
             * Redirect Redmine page to assigned issues of current user
             */
            this.goToAssignedIssues = function(){
                var currentUser = JSON.parse(localStorage.getItem('currentUser'));
                var url = this.options()['redmineUrl'] + 'issues?assigned_to_id=' + currentUser['id'];
                this.openLink(url);
            };

            /**
             * Based on configuration return anchor target ( used in temlates )
             * @return {mixed}
             */
            this.getTarget = function(){
                var target = '_self';
                if ( parseInt(localStorage.getItem('openIssuesNewTab')) ) {
                    target="_blank"
                }
                
                return target ;
            };

            /**
             * Opens link of Redmine "My Account"
             */
            this.goToMyAccount = function(){
                var currentUser = JSON.parse(localStorage.getItem('currentUser'));
                var url = this.options()['redmineUrl'] + 'users/' + currentUser['id'];
                this.openLink(url);

            };

            /**
             * Will sort the column
             *
             * @param columnId
             * @param event
             * @returns {boolean}
             */
            this.sortColumn = function( columnId, event ){
                // Prevent ordering while object is initialized.
                if ( typeof(event) == 'undefined') {
                    return false;
                }

                var columnNumber = this.getColumnNumber(columnId);
                if ( columnNumber === false ) {
                    return false;
                }

                this.resetColumnIcons(columnNumber);

                var columnConf = this.columns()[columnNumber];

                if ( !columnConf.sortOrder() || columnConf.sortOrder() == '' ) {
                    columnConf.sortOrder('asc');
                } else if ( columnConf.sortOrder() == 'asc' ) {
                    columnConf.sortOrder('desc')
                } else {
                    columnConf.sortOrder('')
                }

                if ( columnConf.sortOrder() == '' ) {
                    this.issues(this.getLocalIssues());
                } else {
                    var sortedIssues = this.issues().sort(function(a,b){
                        if ( eval('a.' + [columnConf['sortAttribute']]) > eval('b.'+ [columnConf['sortAttribute']]) ) {
                            return ( columnConf.sortOrder() == 'asc' ) ? 1 : -1
                        } else if ( eval('a.'+[columnConf['sortAttribute']]) < eval('b.'+[columnConf['sortAttribute']]) ) {
                            return ( columnConf.sortOrder() == 'asc' ) ? -1 : 1;
                        } else {
                            return 0;
                        }
                    });

                    this.issues( sortedIssues );
                }
            };

            /**
             * Based on column ID ( property ) returns index of the column from configuration
             * array
             *
             * @param id
             * @returns {boolean}
             */
            this.getColumnNumber = function( id ){
                var finalIndex = false;
                this.columns().forEach(function( column, index ){
                    if ( column['property'] == id ) {
                        finalIndex = index;
                    }
                });

                return finalIndex;
            };

            /**
             * Will reset column sort icons. Leave sorting icon only for column id, which
             * will be passed in "except" parameter
             * @param except
             */
            this.resetColumnIcons = function( except ){
                this.columns().forEach(function(column, index){
                    if (index != except ){
                        column.sortOrder('')
                    }
                });
            };

            /**
             * Return column sort icon
             * @param id
             * @returns string
             */
            this.sortColumnIcon = function( id ){
                var columnNumber = this.getColumnNumber(id);

                if ( columnNumber === false ) {
                    return '';
                }

                var columnConf = this.columns()[columnNumber];
                var cssClass = 'glyphicon ';

                if ( columnConf.sortOrder() == 'asc' ) {
                    return cssClass + 'glyphicon-sort-by-order';
                } else if (columnConf.sortOrder() == 'desc') {
                    return cssClass + 'glyphicon glyphicon-sort-by-order-alt';
                } else {
                    return '';
                }
            };

            /**
             * Method will grab data required for creating pop-over. Then calls method for init
             * and render pop-over.
             *
             * @param data
             * @param event
             * @returns {boolean}
             */
            self.initPopover = function( data, event ){
                if ( typeof(event) == 'undefined' || event.type != 'click') {
                    return false;
                }

                if ( event.currentTarget.className.indexOf('project-info-button') == -1 ){
                    return false;
                }

                var localProjects   = JSON.parse(localStorage.getItem('projectsData'));
                var projectId       = data['project']['id'];
                var innerObj        = self;
                var element         = event.currentTarget;

                if ( localProjects && localProjects[projectId] ) {
                    return self.renderPopover(localProjects[projectId], element);
                }

                $.ajax({
                    contentType : 'application/json',
                    headers : {
                        'X-Redmine-API-Key' : this.options()['redmineApi']
                    },
                    url : this.options()['redmineUrl'] + 'projects/' + projectId + '.json',
                    success : function( data ){
                        var projectInfo = data.project;
                        var baseProjectUrl = innerObj.options()['redmineUrl'] + 'projects/' + projectInfo['identifier'];

                        projectInfo['urlOverview']  = baseProjectUrl;
                        projectInfo['urlIssues']    = baseProjectUrl+'/issues';
                        projectInfo['urlWiki']      = baseProjectUrl+'/wiki';
                        projectInfo['urlRepository']= baseProjectUrl+'/repository';

                        if ( !localProjects ) {
                            localStorage.setItem('projectsData',JSON.stringify({projectId: projectInfo}));
                        } else {
                            localProjects[projectId] = projectInfo;
                            localStorage.setItem('projectsData', JSON.stringify(localProjects));
                        }

                        innerObj.renderPopover(projectInfo, element);
                    }
                });
            };

            /**
             * Method will render pop-over of project links. Every time this function
             * is called, it will re-init whole bootstrap popover.
             *
             * @param data
             * @param elem
             */
            self.renderPopover = function( data, elem ){
                var html = '';
                if ( data ) {
                    html += '<div class="text-center">';
                    html += '<p><a href="' + data['urlOverview']   + '" target="' + self.getTarget() + '">Project Overview</a></p>';
                    html += '<p><a href="' + data['urlIssues']     + '" target="' + self.getTarget() + '">Project Issues</a></p>';
                    html += '<p><a href="' + data['urlWiki']       + '" target="' + self.getTarget() + '">Project Wiki</a></p>';
                    html += '<p><a href="' + data['urlRepository'] + '" target="' + self.getTarget() + '">Project Repository</a></p>';
                    html += '<div>';    
                }

                $(elem).popover({
                    content: html,
                    html: true,
                    placement: bottom,
                    title: data.name
                }).popover('show');
            };

            /**
             * Method redirect to issue with given ID 
             * @return bool
             */
            this.goToIssue = function() {
                var issue = parseInt($('#goToIssue').val());

                if ( issue ) {
                    var url = this.options()['redmineUrl'] + 'issues/' + issue;
                    window.open(url, '_blank');
                    return true;
                }
                console.log('Not given a number');
                return false;
            };

            this.handleTodos = function(){
                if ( parseInt(localStorage.getItem('useTodos')) ) {
                    this.showTodos(true);
                    this.loadNotes();
                    this.handleMainColumnWidth(false);
                    if ( parseInt(localStorage.getItem('minimizedNotes')) ) {
                        this.minimizeTodos(false);
                        this.handleMainColumnWidth();
                    }
                }
            };

            this.handleMainColumnWidth = function( full ){
                var full = ( typeof(full) == 'undefined' ) ? true : full;
                var className = ( full ) ? 'col-xs-12' : 'col-xs-8';
                this.mainColumnWidth(className);

            };

            this.saveNotes = function(){
                var notesElement = document.getElementById('notes');
                if ( !notesElement ) {
                    return false;
                }

                localStorage.setItem('savedNotes',notesElement.value);                
                console.log('Saving notes ...');
            };

            this.loadNotes = function(){
                var savedNotes = localStorage.getItem('savedNotes');
                document.getElementById('notes').value = savedNotes;
            };

            this.toggleNotes = function(){
                var currentState = this.minimizeTodos();
                if ( currentState ) {
                    localStorage.setItem('minimizedNotes',1);
                    this.minimizeTodos(false);
                    this.handleMainColumnWidth(true);
                } else {
                    localStorage.setItem('minimizedNotes',0);
                    this.minimizeTodos(true);
                    this.handleMainColumnWidth(false);
                }
            };
        };
        ko.applyBindings(new newTabViewModel().init());

});