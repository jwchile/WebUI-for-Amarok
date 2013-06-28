/*
 *    Copyright (C) 2009 by Johannes Wolter <jw@inutil.org>
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * Commands to control the player (the engine):
 */


nextTrack = function(path){
    Amarok.Engine.Next();
    return new HandlerResponse();  
}

prevTrack = function(path){
    Amarok.Engine.Prev();
    return new HandlerResponse();
}

play = function(path){
    Amarok.Engine.Play();
    return new HandlerResponse();
}

pause = function(path){
    Amarok.Engine.Pause();
    return new HandlerResponse();
}

playPause = function(path){
    if(Amarok.Engine.engineState() == 0)
        Amarok.Engine.Pause();
    else
        Amarok.Engine.Play();
    return new HandlerResponse();
}

stop = function(path){
    Amarok.Engine.Stop(false);
    return new HandlerResponse();
}

incVolume = function(path){
    Amarok.Engine.IncreaseVolume(getVolumeStep());
    return new HandlerResponse();
}

decVolume = function(path){
    Amarok.Engine.DecreaseVolume(getVolumeStep());
    return new HandlerResponse();
}

addTracksToPlaylist = function(tracksQueryResult){
	for (trackIdx = 0; trackIdx < tracksQueryResult.length; trackIdx++) {
		url = Amarok.Collection.query('SELECT rpath , lastmountpoint FROM urls JOIN devices ON urls.deviceid = devices.id WHERE urls.id = ' + tracksQueryResult[trackIdx] + ';');
		Amarok.Playlist.addMedia(new QUrl('file://'+ url[1] + url[0].substring(1)));
	}
}

addAlbumToPlaylist = function(path){
	albumId = parseInt(path.substring(path.lastIndexOf("/") + 1));
	tracksQuery = Amarok.Collection.query('SELECT url FROM tracks WHERE tracks.album = ' + albumId + ' ORDER BY tracknumber;')
	addTracksToPlaylist(tracksQuery);
	return new HandlerResponse();
}

replacePlaylistWithAlbum = function(path){
	clearPlaylist(path);
	addAlbumToPlaylist(path);
}

addAllTracksFromArtistToPlaylist = function(path){
	artistId = parseInt(path.substring(path.lastIndexOf("/") + 1));
	tracksQuery = Amarok.Collection.query('SELECT url FROM tracks WHERE tracks.artist = ' + artistId + ' ORDER BY tracknumber;')
	addTracksToPlaylist(tracksQuery);
	return new HandlerResponse();
}

replacePlaylistWithAllArtistTrack = function(path){
	clearPlaylist(path);
	addAllTracksFromArtistToPlaylist(path);
}

clearPlaylist = function(path){
	Amarok.Playlist.clearPlaylist();
	return new HandlerResponse();
}

getEngineState = function(){
	return Amarok.Engine.engineState();
}

getVolume = function(){
	return  Amarok.Engine.volume;
}

mute = function(){
	Amarok.Engine.Mute();
    return new HandlerResponse();
}

playByIndex = function(index) {
	Amarok.Playlist.playByIndex(index);
	return new HandlerResponse();
}

seek = function(position) {
	Amarok.Engine.Seek(position);
	return new HandlerResponse();
}
    
