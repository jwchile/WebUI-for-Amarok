/*
 *    Copyright (C) 2012 by Martin Hoeher <martin@rpdev.net>
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
 *    along with this program.  If not, see <this.httpserver//www.gnu.org/licenses/>.
 */

Importer.loadQtBinding("qt.core");
Importer.loadQtBinding("qt.network");
Importer.loadQtBinding("qt.gui");
Importer.include("configuration.js");
Importer.include("httpserver.js");
Importer.include("util.js");
Importer.include("fileio.js");
Importer.include("amarokctrl.js");
Importer.include("amarokcontent.js");

/*
 * Setup the Amarok Web UI
 * 
 * This is called when the webui main class is created. This class is the main
 * class of the Web UI. It contains the other relevant objects required to
 * provide the service as class members.
 */
function AmarokWebUI() {
  this.configuration = new Configuration( this );
  this.configuration.restoreSettings();
  Amarok.Window.addSettingsMenu( "configureAmarokWebUi", "WebUI" );
  this.configureAction = Amarok.Window.SettingsMenu.configureAmarokWebUi;
  this.configureAction["triggered(bool)"].connect( this, this.configure );
  this.startService();
}

/*
 * Starts the web service
 * 
 * This starts the built-in webserver.
 */
AmarokWebUI.prototype.startService = function() {
  this.http = new HTTPServer( this );
  this.http.setDefaultHandler(fileHandler);
  this.http.registerHandler("/ajax/controls", controlsDlg);
  this.http.registerHandler("/ajax/currentTrackCover", currentTrackCover);
  this.http.registerHandler("/ajax/currentTrackDiv", currentTrackDiv);
  this.http.registerHandler("/ajax/ratingDiv", ratingDiv);
  this.http.registerHandler("/ajax/playlistDiv", playlistDiv);
  this.http.registerHandler("/ajax/playlistTrackCover", playlistTrackCover);
  this.http.registerHandler("/ajax/collectionDiv", collectionArtistsDiv);
  this.http.registerHandler("/ajax/collectionAlbumDiv", collectionAlbumDiv);
  this.http.registerHandler("/ajax/collectionArtistAlbumsDiv", collectionArtistAlbumsDiv);
  this.http.registerHandler("/ajax/collectionAllArtistTracksDiv", collectionAllArtistTracksDiv);
  this.http.registerHandler("/ajax/albumCover", albumCover);
  this.http.registerHandler("/ajax/nextTrack", nextTrack);
  this.http.registerHandler("/ajax/prevTrack", prevTrack);
  this.http.registerHandler("/ajax/playPause", playPause);
  this.http.registerHandler("/ajax/play", play);
  this.http.registerHandler("/ajax/pause", pause);
  this.http.registerHandler("/ajax/stop", stop);
  this.http.registerHandler("/ajax/incVolume", incVolume);
  this.http.registerHandler("/ajax/decVolume", decVolume);
  this.http.registerHandler("/ajax/addAlbumToPlaylist", addAlbumToPlaylist);
  this.http.registerHandler("/ajax/replacePlaylistWithAlbum", replacePlaylistWithAlbum);
  this.http.registerHandler("/ajax/addAllTracksFromArtistToPlaylist", addAllTracksFromArtistToPlaylist);
  this.http.registerHandler("/ajax/replacePlaylistWithAllArtistTrack", replacePlaylistWithAllArtistTrack);
  this.http.registerHandler("/ajax/clearPlaylist", clearPlaylist);
}

/*
 * Stops the service
 * 
 * This stops the built-in webserver.
 */
AmarokWebUI.prototype.stopService = function() {
  this.http.close();
  this.http = null;
}

/*
 * Restarts the servive (includes stopService+startService)
 */
AmarokWebUI.prototype.restartService = function() {
  this.stopService();
  this.startService();
}

/*
 * Configures the plugin
 * 
 * This shows the configuration dialog which allows the user to setup the
 * plugin. If settings were changed, this will restart the built-in HTTP 
 * server.
 */
AmarokWebUI.prototype.configure = function() {
  if ( this.configuration.configure() == QDialog.Accepted ) {
    this.restartService();
  }
}