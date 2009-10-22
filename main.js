Importer.loadQtBinding("qt.core");
Importer.loadQtBinding("qt.network");
Importer.loadQtBinding("qt.gui");
Importer.include("httpserver.js");
Importer.include("util.js");
Importer.include("conf.js");

/*
 * Serve a file from the <scriptPath>/www folder.
 * If path is pointing to a parent directory a 403 is sent.
 * For some file types the corresponding mime-type is set.
 */
fileHandler = function(path){
    response = new Object();
    response.data = new QByteArray();
    if(path === "/" || path === ""){
        path = "/index.html";
    }
    canonicalRootDir = new QFileInfo(Amarok.Info.scriptPath()+"/www").canonicalFilePath();
    pathFileInfo = new QFileInfo(Amarok.Info.scriptPath()+"/www"+path);
    if(pathFileInfo.canonicalFilePath().indexOf(canonicalRootDir) != 0){
        Amarok.debug("Forbidden!");
        response.data.append("403 Error: Forbidden!");
        response.mimeType = "text/plain";
        response.retCode = 403;
        response.reasonPhrase = "Forbidden";
        return response;
    }
    Amarok.debug("File: "+pathFileInfo.canonicalFilePath());
    file = new QFile(pathFileInfo.canonicalFilePath());
    if(file.open(QIODevice.ReadOnly)){
        if( pathFileInfo.completeSuffix() == "css" ){
            response.mimeType = "text/css";
        }else if( pathFileInfo.completeSuffix() == "js" ){
            response.mimeType = "text/js";
        }else if( pathFileInfo.completeSuffix() == "png" ){
            response.mimeType = "image/png";
        }else if( pathFileInfo.completeSuffix() == "gif" ){
            response.mimeType = "image/gif";
        }else{
            response.mimeType = "text/html";
        }
        response.data.append(file.readAll());
        file.close();
        return response;
    }else{
        Amarok.debug("File not found!");
        response.data.append("404 Error: File not found!");
        response.retCode = 404;
        response.reasonPhrase = "Not Found";
        response.mimeType = "text/plain";
    }
    return response;
}

pixmapToPNG = function(pixmap, width){
    data = new QByteArray();
    buffer = new QBuffer(data);
    buffer.open(QIODevice.WriteOnly);
    pixmap.scaledToWidth(width, Qt.SmoothTransformation).save(buffer, "PNG");
    buffer.close();
    return data;
}

/*
 * Send the cover image of the track currently playing.
 */
currentTrackCover = function(path){
    response = new Object();
    response.data = pixmapToPNG(Amarok.Engine.currentTrack().imagePixmap(), 300);
    response.mimeType = "image/png";
    return response;
}

/**
  * 
  */
playlistTrackCover = function(path){
    //FIXME:this is pretty ugly...
    trackIdx = parseInt(path.substring(path.lastIndexOf("/")+1, path.indexOf("?")));
    response = new Object();
    response.data = pixmapToPNG(Amarok.Playlist.trackAt(trackIdx).imagePixmap(), 50);
    return response;
}

/*
 * Crop the string to size max (plus "...").
 */
shorten = function(str, max){
    if(str.length > max)
        return str.substring(0,max)+"...";
    else
        return str
}

/*
 * Load a file and return the contents as string.
 */
loadFile = function(path){
    data = new QByteArray();
    file = new QFile(Amarok.Info.scriptPath()+path);
    file.open(QIODevice.ReadOnly);
    r = file.readAll().toString();
    file.close();
    return r;
}

/*
 *  Send div with info about the track currently playing.
 */
currentTrackDiv = function(path){
    response = new Object();
    response.data = new QByteArray();
    response.mimeType = "text/html";
    div = loadFile("/www/currentTrack.html");
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
    if(Amarok.Engine.engineState() == 0)/*currently playing*/
        div = div.replace("###playpause###", "Pause");
    else
        div = div.replace("###playpause###", "Play");
    div = div.replace("###key###", (new Date()).getTime());
    Amarok.debug(div);
    response.data.append(div);
    return response;
}

/*
 *  Send div for the current playlist.
 */
playlistDiv = function(path){
    response = new Object();
    response.data = new QByteArray();
    response.mimeType = "text/html";
    div = loadFile("/www/playlist.html");
    tracks = "";
    for(trackidx=0; trackidx<Amarok.Playlist.totalTrackCount(); trackidx=trackidx+1){
        t = Amarok.Playlist.trackAt(trackidx);
        tracks += '<li><div style="display:table-row;"><img src="/ajax/playlistTrackCover/'+trackidx+'?'+(new Date()).getTime()+'" width="50" style="display:table-cell; padding-right: 5px;"/><div style="display:table-cell; vertical-align: top;"> '+t.artist+' - '+t.title+'</div></div></li>';
    }
    div = div.replace("###tracks###", tracks);
    response.data.append(div);
    return response;
}

/*
 * Commands to control the player (the engine):
 */

nextTrack = function(path){
    Amarok.Engine.Next();
}

prevTrack = function(path){
    Amarok.Engine.Prev();
}

playPause = function(path){
    if(Amarok.Engine.engineState() == 0)
        Amarok.Engine.Pause();
    else
        Amarok.Engine.Play();
}

stop = function(path){
    Amarok.Engine.Stop(false);
}

incVolume = function(path){
    Amarok.Engine.IncreaseVolume(VOLUME_STEP);
}

decVolume = function(path){
    Amarok.Engine.DecreaseVolume(VOLUME_STEP);
}

/*
 * Setup of the HTTP server and its request dispatcher.
 */
http = new HTTPServer();
http.setDefaultHandler(fileHandler);
http.registerHandler("/ajax/currentTrackCover", currentTrackCover);
http.registerHandler("/ajax/currentTrackDiv", currentTrackDiv);
http.registerHandler("/ajax/playlistDiv", playlistDiv);
http.registerHandler("/ajax/playlistTrackCover", playlistTrackCover);
http.registerHandler("/ajax/nextTrack", nextTrack);
http.registerHandler("/ajax/prevTrack", prevTrack);
http.registerHandler("/ajax/playPause", playPause);
http.registerHandler("/ajax/stop", stop);
http.registerHandler("/ajax/incVolume", incVolume);
http.registerHandler("/ajax/decVolume", decVolume);

