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

Importer.loadQtBinding("qt.gui");
Importer.include("httpserver.js");
Importer.include("util.js");
Importer.include("fileio.js");

/**
 * Send the cover image of the track currently playing.
 */
currentTrackCover = function(path){
    response = new HandlerResponse();
    response.setMimeType("image/png");
    engineState = Amarok.Engine.engineState();
    if(engineState == ENGINE_STATE_PAUSE || engineState == ENGINE_STATE_PLAY){
        response.append(pixmapToPNG(Amarok.Engine.currentTrack().imagePixmap(), 165));
    }
    return response;
}

/**
 * Returns the cover image from a playlist track. The track index is
 * specified in the path btw. the last '/' and the '?'.
 * FIXME: Implement parsing of HTTP GET parameters
 */
playlistTrackCover = function(path){
    trackIdx = parseInt(path.substring(path.lastIndexOf("/")+1, path.indexOf("?")));
    response = new HandlerResponse();
	response.setMimeType("image/png");
    pixmap = Amarok.Playlist.trackAt(trackIdx).imagePixmap();
    response.append(pixmapToPNG(pixmap, 50));
    return response;
}

/**
 * Return cover image for the specified album.
 * FIXME: parametrize cover image size
 */
albumCover = function(path){
	albumId = parseInt(path.substring(path.lastIndexOf("/")+1));
	response = new HandlerResponse();
	response.setMimeType("image/png");
	imageId = Amarok.Collection.query("SELECT image FROM albums WHERE id = "+albumId+";");
	imagePath = Amarok.Collection.query("SELECT path FROM images WHERE id = "+imageId+";");
	Amarok.debug(imagePath);
	pixmap = new QPixmap(imagePath, "", Qt.AutoColor);
	response.append(pixmapToPNG(pixmap, 200));
    return response;
}

/**
 * Show dialog with controls: play, pause, stop, 
 * next/prev track, ind/dec volume, reload.
 */
controlsDlg = function(path){
	response = new HandlerResponse();
	engineState = Amarok.Engine.engineState();
	div = loadFile("/www/controls.html");
	/*if(Amarok.Engine.engineState() == ENGINE_STATE_PLAY)
        div = div.replace("###playpause###", "pause");
    else
        div = div.replace("###playpause###", "play");*/
    response.append(div);
	return response;
}

/**
 *  Send div with info about the track currently playing.
 */
currentTrackDiv = function(path){
    response = new HandlerResponse();    
    div = loadFile("/www/currentTrack.html");
	engineState = Amarok.Engine.engineState();
    if(engineState == ENGINE_STATE_PAUSE || engineState == ENGINE_STATE_PLAY){
        div = div.replace("###artist###", shorten(Amarok.Engine.currentTrack().artist, 18));
        div = div.replace("###title###", shorten(Amarok.Engine.currentTrack().title, 18));
        div = div.replace("###album###", shorten(Amarok.Engine.currentTrack().album, 18));
        length = Amarok.Engine.currentTrack().length;
        minutes = Math.floor(length/60);
        seconds = length-(minutes*60);
        if(seconds.toString().length == 1)
            seconds = "0"+seconds
        div = div.replace("###minutes###", minutes);
        div = div.replace("###seconds###", seconds);
        div = div.replace("###coverimg###", '<img src="/ajax/currentTrackCover?key='+(new Date()).getTime()+'"/>');
    }else{
        div = div.replace("###artist###", "None");
        div = div.replace("###title###", "None");
        div = div.replace("###album###", "None");
        div = div.replace("###minutes###", "");
        div = div.replace("###seconds###", "");
        div = div.replace("###coverimg###", "");
    }
    response.append(div);
    return response;
}

/**
 *  Send div for the current playlist.
 */
playlistDiv = function(path){
    response = new HandlerResponse();
    div = loadFile("/www/playlist.html");
    tracks = "";
    for(trackidx=0; trackidx<Amarok.Playlist.totalTrackCount(); trackidx=trackidx+1){
        t = Amarok.Playlist.trackAt(trackidx);
        tracks += '<li><div style="display:table-row;"><img src="/ajax/playlistTrackCover/'+trackidx+'?'+(new Date()).getTime()+'" width="50" style="display:table-cell; padding-right: 5px;"/><div style="display:table-cell; vertical-align: top;"> '+shorten(t.artist, 20)+' <br/> '+shorten(t.title, 20)+'</div></div></li>';
    }
    div = div.replace("###tracks###", tracks);
    response.append(div);
    return response;
}

/**
 *  Send div with all artists in the collection.
 */
collectionArtistsDiv = function(path){
    response = new HandlerResponse();
    div = loadFile("/www/collection.html");
    artists = "";
	artistsQuery = Amarok.Collection.query("SELECT name, id FROM artists ORDER BY name;");
	startChar = "";
    for(artistidx=0; artistidx<artistsQuery.length; artistidx++){		 
		artist = artistsQuery[artistidx++];
		artistId = artistsQuery[artistidx];
		if (artist.length > 0 && startChar != artist[0].toUpperCase()){
			startChar = artist[0].toUpperCase();
			artists += '<li class="group">'+startChar+'</li>';
			
		}
		if (artist.length>0){
			artists += '<li><a href="/ajax/collectionArtistAlbumsDiv/'+artistId+'">'+shorten(artist, 25)+'</a></li>';			
		}        
    }
    response.append(div.replace("###artists###", artists));
    return response;
}

/**
 * Send div with all albums from one artist.
 */
collectionArtistAlbumsDiv = function(path){
    artistId = parseInt(path.substring(path.lastIndexOf("/")+1));
	response = new HandlerResponse();
    div = loadFile("/www/collectionArtistAlbums.html");
	albums = '<li><a href="/ajax/collectionAllArtistTracksDiv/'+artistId+'">All Tracks</a></li>';
	albumsQuery = Amarok.Collection.query('SELECT name, id FROM albums WHERE artist = '+artistId+';')
	for(albumidx = 0; albumidx<albumsQuery.length; albumidx++){
		album = albumsQuery[albumidx++];
		albumId = albumsQuery[albumidx];
		if (album.length>0){
			albums += '<li><a href="/ajax/collectionAlbumDiv/'+albumId+'">'+shorten(album, 25)+'</a></li>';			
		}
	}
    response.append(div.replace("###content###", albums));
    return response;
}

/**
 * Send div with options for a specific album. Currently:
 * -Append tracks from the album to the current playlist.
 * -Replace current playlist with tracks from the album. 
 */
collectionAlbumDiv = function(path){
    albumId = parseInt(path.substring(path.lastIndexOf("/")+1));
	albumQuery = Amarok.Collection.query('SELECT name, artist FROM albums WHERE id = '+albumId+';');
	albumName = albumQuery[0];
	albumArtist = Amarok.Collection.query('SELECT name FROM artists WHERE id = '+albumQuery[1]+';');
	trackQuery = Amarok.Collection.query('SELECT title FROM tracks WHERE album = '+albumId+';');
	tracksDiv = "";
	for(trackidx = 0; trackidx < trackQuery.length; trackidx++){
		tracksDiv += '<div class="row"><label>'+shorten(trackQuery[trackidx], 30)+'</label></div>'
	}	
	response = new HandlerResponse();
    div = loadFile("/www/collectionAlbum.html");
	div = div.replace("###album###", shorten(albumName, 18));
	div = div.replace("###artist###", shorten(albumArtist,18));
	div = div.replace(/###albumid###/g, albumId.toString());	
	div = div.replace("###tracks###", tracksDiv);	
    response.append(div);
    return response;
}

/**
 * Send div with options for all tracks of one artist. For
 * the options see "collectionAlbumDiv"
 */
collectionAllArtistTracksDiv = function(path){
    artistId = parseInt(path.substring(path.lastIndexOf("/")+1));
	trackQuery = Amarok.Collection.query('SELECT title FROM tracks WHERE artist = '+artistId+';');
	trackCount = trackQuery.length;
	tracksDiv = "";
	for(trackidx = 0; trackidx < trackCount; trackidx++){
		tracksDiv += '<div class="row"><label>'+shorten(trackQuery[trackidx], 30)+'</label></div>'
	}
	artistName = Amarok.Collection.query('SELECT name FROM artists WHERE id = '+artistId+';');
	response = new HandlerResponse();
    div = loadFile("/www/collectionAllArtistTracks.html");
	div = div.replace("###artist###", shorten(artistName, 18));
	div = div.replace("###trackcount###", trackCount);
	div = div.replace(/###artistid###/g, artistId.toString());
	div = div.replace("###tracks###", tracksDiv);	
    response.append(div);
    return response;
}