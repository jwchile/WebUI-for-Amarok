Importer.loadQtBinding("qt.core");
Importer.loadQtBinding("qt.network");
Importer.loadQtBinding("qt.gui");
Importer.include("httpserver.js");

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
        Amarok.debug(canonicalRootDir);
        Amarok.debug(Amarok.Info.scriptPath()+"/www"+path);
        Amarok.debug(pathFileInfo.canonicalFilePath());
        Amarok.debug(pathFileInfo.canonicalFilePath().indexOf(canonicalRootDir));
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
    Amarok.Engine.currentTrack().imagePixmap().save(buffer, "PNG");
    buffer.close();
    response.mimeType = "image/png";
    return response;
}

currentTrackDiv = function(path){
    response = new Object();
    response.data = new QByteArray();
    response.data.append('<div id="currentTrack" title="Current Track" class="panel"/>\
    <h2>Current Track</h2>\
    <fieldset>\
        <div class="row">\
            <label>Artist</label>\
            <span>');
    response.data.append(Amarok.Engine.currentTrack().artist);
    response.data.append('</span></div>\
        <div class="row">\
            <label>Title</label>\
            <span>');
    response.data.append(Amarok.Engine.currentTrack().title);
    response.data.append('</span></div>\
        <div class="row">\
            <label>Album</label>\
            <span>');
    response.data.append(Amarok.Engine.currentTrack().album);
    response.data.append('</span></div>\
    </fieldset>\
    <img src="/ajax/currentTrackCover"/>\
    </div>');
    response.mimeType = "text/html";
    return response;
}

http = new HTTPServer();
http.setDefaultHandler(fileHandler);
http.registerHandler("/ajax/currentTrackCover", currentTrackCover);
http.registerHandler("/ajax/currentTrackDiv", currentTrackDiv);