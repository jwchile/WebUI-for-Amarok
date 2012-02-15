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

Importer.loadQtBinding("qt.core");
Importer.loadQtBinding("qt.network");
Importer.loadQtBinding("qt.gui");
Importer.include("httpserver.js");
Importer.include("util.js");
Importer.include("fileio.js");
Importer.include("amarokctrl.js");
Importer.include("amarokcontent.js");
Importer.include("conf.js");

ENGINE_STATE_PLAY = 0
ENGINE_STATE_PAUSE = 1



/*
 * Setup of the HTTP server and its request dispatcher.
 */
http = new HTTPServer();
http.setDefaultHandler(fileHandler);
http.registerHandler("/ajax/controls", controlsDlg);
http.registerHandler("/ajax/currentTrackCover", currentTrackCover);
http.registerHandler("/ajax/currentTrackDiv", currentTrackDiv);
http.registerHandler("/ajax/ratingDiv", ratingDiv);
http.registerHandler("/ajax/playlistDiv", playlistDiv);
http.registerHandler("/ajax/playlistTrackCover", playlistTrackCover);
http.registerHandler("/ajax/collectionDiv", collectionArtistsDiv);
http.registerHandler("/ajax/collectionAlbumDiv", collectionAlbumDiv);
http.registerHandler("/ajax/collectionArtistAlbumsDiv", collectionArtistAlbumsDiv);
http.registerHandler("/ajax/collectionAllArtistTracksDiv", collectionAllArtistTracksDiv);
http.registerHandler("/ajax/albumCover", albumCover);
http.registerHandler("/ajax/nextTrack", nextTrack);
http.registerHandler("/ajax/prevTrack", prevTrack);
http.registerHandler("/ajax/playPause", playPause);
http.registerHandler("/ajax/play", play);
http.registerHandler("/ajax/pause", pause);
http.registerHandler("/ajax/stop", stop);
http.registerHandler("/ajax/incVolume", incVolume);
http.registerHandler("/ajax/decVolume", decVolume);
http.registerHandler("/ajax/addAlbumToPlaylist", addAlbumToPlaylist);
http.registerHandler("/ajax/replacePlaylistWithAlbum", replacePlaylistWithAlbum);
http.registerHandler("/ajax/addAllTracksFromArtistToPlaylist", addAllTracksFromArtistToPlaylist);
http.registerHandler("/ajax/replacePlaylistWithAllArtistTrack", replacePlaylistWithAllArtistTrack);
http.registerHandler("/ajax/clearPlaylist", clearPlaylist);

