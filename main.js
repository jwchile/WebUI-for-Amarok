Importer.loadQtBinding("qt.core");
Importer.loadQtBinding("qt.network");
Importer.include("httpserver.js");

fileHandler = function(path){
    Amarok.debug("File handler: "+path);
}

http = new HTTPServer();
http.registerHandler("/iui", fileHandler);