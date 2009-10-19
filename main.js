Importer.loadQtBinding("qt.core");
Importer.loadQtBinding("qt.network");
Importer.include("httpserver.js");

mainHandler = function(path){
    response = new Object();
    response.data = new QByteArray();
    response.data.append('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">\
<html xmlns="http://www.w3.org/1999/xhtml">\
<head>\
  <title>Amarok WebUI</title>\
  <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;"/>\
  <style type="text/css" media="screen">@import "/iui/iui.css";</style>\
  <script type="application/x-javascript" src="/iui/iui.js"></script>\
</head>\
<body>\
    <div class="toolbar">\
        <h1 id="pageTitle"></h1>\
        <a id="backButton" class="button" href="#"></a>\
    </div>\
    <div id="home" title="Amarok WebUI" selected="true">\
    </div>\
</body>\
</html>');
    response.mimeType = "text/html";
    return response;
}

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

ajaxHandler = function(path){
    
}

http = new HTTPServer();
http.setDefaultHandler(fileHandler);
http.registerHandler("/ajax", ajaxHandler);