Importer.loadQtBinding("qt.core");
Importer.loadQtBinding("qt.network");
Importer.loadQtBinding("qt.gui");
Importer.include("httpserver.js");
Importer.include("util.js");

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

currentTrackCover = function(path){
    response = new Object();
    response.data = new QByteArray();
    buffer = new QBuffer(response.data);
    buffer.open(QIODevice.WriteOnly);
    Amarok.Engine.currentTrack().imagePixmap().scaledToWidth(300, Qt.SmoothTransformation).save(buffer, "PNG");
    buffer.close();
    response.mimeType = "image/png";
    return response;
}

shorten = function(str, max){
    if(str.length > max)
        return str.substring(0,max)+"...";
    else
        return str
}

currentTrackDiv = function(path){
    response = new Object();
    response.data = new QByteArray();
    file = new QFile(Amarok.Info.scriptPath()+"/www/currentTrack.html");
    file.open(QIODevice.ReadOnly);
    div = file.readAll().toString();
    file.close();
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
    response.mimeType = "text/html";
    return response;
}

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

http = new HTTPServer();
http.setDefaultHandler(fileHandler);
http.registerHandler("/ajax/currentTrackCover", currentTrackCover);
http.registerHandler("/ajax/currentTrackDiv", currentTrackDiv);
http.registerHandler("/ajax/nextTrack", nextTrack);
http.registerHandler("/ajax/prevTrack", prevTrack);
http.registerHandler("/ajax/playPause", playPause);
http.registerHandler("/ajax/stop", stop);

