togglePlayPauseIcon = function(button, data) {
	if ( data == 'undefined' ) return;
	
	if ( data['status'] == 'OK' ) {
		newIcon = 'amarok-pause';
		oldIcon = 'amarok-play';
		if ( data['engineState'] == 1 ) {
			newIcon = 'amarok-play';
			oldIcon = 'amarok-pause';
		}
		button.attr('data-icon', newIcon).find('.ui-icon').addClass('ui-icon-' + newIcon).removeClass('ui-icon-' + oldIcon);
	}
}

setEmptyPlaylist = function(data) {
	if ( data == 'undefined' ) return;
	
	if ( data['status'] == 'OK') {
		$('#playlist ul').html('<li>Playlist is empty&hellip;</li>').listview('refresh');
		$('#clear-playlist').toggleClass('ui-disabled' , true);
	}
}

