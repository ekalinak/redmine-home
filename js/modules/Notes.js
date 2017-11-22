define(['knockoutLib','jquery'],function(ko,$){
	var Notes = function(){
		var self;

		// Constants
		this.notesTextareaId 	= 'notes';
		this.localStorageKey 	= 'savedNotes';
		this.localStorageFlag 	= 'useNotes';

		// Observables
		this.showNotes 		= ko.observable(false);
		this.minimizeNotes 	= ko.observable(false);

		this.notesTextarea = '';

		this.init = function(id){
			if ( typeof(id) !== 'undefined' ) {
				this.notesTextareaId = id;
			} 

			if ( localStorage.getItem(this.localStorageFlag) ) {
				this.showNotes = true;
			}
			
			$('#' + this.notesTextareaId).on('focusout', this.saveNotes);

			self = this;

			return this;
		}

		this.toggleNotes = function(){
			var currentState = this.minimizeTodos();
			if ( currentState ) {
				localStorage.setItem('minimizedNotes',1);
				this.minimizeTodos(false);
			} else {
				localStorage.setItem('minimizedNotes',0);
				this.minimizeTodos(true);
			}
		};

		/**
		 * Loads notes from local storage and add them to element 
		 * with ID "notes"
		 * 
		 * @return {[type]} [description]
		 */
		this.loadNotes = function(){
			var savedNotes = localStorage.getItem(this.localStorageKey);
			var notesElement = document.getElementById(this.notesTextareaId);
			if ( notesElement && savedNotes) {
				notesElement.value = savedNotes;
			}
		};

		/**
		 * Saves notes to localStorage object. Source of the notes are 
		 * from defined by "notesTextareaId"
		 * 
		 * @return {[type]} [description]
		 */
		this.saveNotes = function(){
			var notesElement = document.getElementById(self.notesTextareaId);
			if ( !notesElement ) {
				return false;
			}

			localStorage.setItem(self.localStorageKey,notesElement.value);                
		};
	}
	return new Notes();
});
