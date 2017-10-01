define(['knockoutLib'],function(ko){
	var Notes = function(){
		this.showNotes 		= ko.observable(false);
		this.minimizeNotes 	= ko.observable(false);

		this.notesTextarea = '';

		this.localStorageFlag 	= 'useNotes';
		this.localStorageId 	= 'notes';

		this.init = function(id){
			if ( typeof(id) !== 'undefined' ) {
				this.notesTextarea = id;
			} 

			if ( localStorage.getItem(this.localStorageFlag) ) {
				this.showNotes = true;
			}

			return this;
		}

		this.canUseLocalstorage = function(){
			return ( typeof(localStorage) !== 'undefined' ) ;
		}

		this.getNotes = function(){
			if ( !this.canUseLocalstorage || !localStorage.getItem(this.localStorageFlag) ) {
				return '';
			}

			return localStorage.getItem(this.localStorageId);
		}

		this.setNotes = function(){
			var elem = document.getElementById(this.notesTextarea);
			if ( !elem ) {
				return false;
			}

			localStorage.setItem(this.localStorageId, elem.value);
		}

		this.setOptionEnabled = function( enabled ){
			var enabled = ( typeof(enabled) === 'undefined' ) ? true : enabled;
			this.showNotes = enabled;
		}

		this.setOptionMinimized = function( minimized ){
			var minimized = ( typeof(minimized) === 'undefined' ) ? false : minimized;
			this.minimizeNotes = minimized; 
		}


		// New version 
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

	}
	return new Notes();
});
