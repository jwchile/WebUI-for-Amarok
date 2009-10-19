Importer.loadQtBinding("qt.core");
Importer.loadQtBinding("qt.network");

//Convenience function
QByteArray.prototype.toString = function(){
    ts = new QTextStream( this, QIODevice.ReadOnly );
    return ts.readAll();
}

function HTTPServer(){
    QTcpServer.call(this, null);
    var portNumber = 8080;
    do{
        var connected = this.listen(new QHostAddress(QHostAddress.Any), portNumber);
        portNumber++;
    }while(!connected && ((this.serverError() & QAbstractSocket.AddressInUseError)==0) && portNumber < 9000)
    if(!this.isListening()){
        Amarok.alert("Unable to open a port for the web server.");
    }
     Amarok.Window.Statusbar.longMessage("<b>Successfully started WebUI!</b>  It can be accessed at port "+this.serverPort()+".");
    this.newConnection.connect(this, this.newConnectionCallback);
    this.requestHandlerRegistry = new Object();
}

HTTPServer.prototype = new QTcpServer();

HTTPServer.prototype.newConnectionCallback = function(){
    Amarok.debug("New request...");
    var socket = this.nextPendingConnection();
    var request = new QByteArray();
    var thisHTTP = this;
    socket.readyRead.connect( 
        function() {
            request.append(socket.readAll());
            var endOfRequest =  request.indexOf("\r\n\r\n");
            if( endOfRequest > 0 ){
                try{
                    var header = new QHttpRequestHeader(request.left(endOfRequest + 4).toString());
                    request.clear();
                    Amarok.debug("Path: "+header.path());
                    thisHTTP.handleRequest(socket, header.path());
                }catch( error ){
                    Amarok.debug(error)
                }
            }
        }
    );
}

HTTPServer.prototype.setDefaultHandler = function(func){
    this.defaultHandler = func;
}

HTTPServer.prototype.registerHandler = function(path, func){
    this.requestHandlerRegistry[path] = func;
}

HTTPServer.prototype.getRequestHandler = function(path){
    for(var registeredPath in this.requestHandlerRegistry){
        Amarok.debug("registeredPath "+registeredPath+" "+path);
        if(path.indexOf(registeredPath)==0){
            Amarok.debug("hit!");
            return this.requestHandlerRegistry[registeredPath];
        }
    }
    return this.defaultHandler;
}

HTTPServer.prototype.handleRequest = function(socket, path){
    handler = this.getRequestHandler(path);
    if (handler != null){
        responseContent = handler(path);
        retCode = 200;
        reasonPhrase = "OK";
        if (responseContent["retCode"]){
            retCode = responseContent.retCode;
            reasonPhrase = responseContent.reasonPhrase;
        }
        responseHeader = new QHttpResponseHeader(retCode, reasonPhrase, 1, 1);
        responseHeader.setContentLength(responseContent.data.length());
        responseHeader.setValue("Content-Type", responseContent.mimeType);
        response = new QByteArray();
        response.append(responseHeader.toString());
        //response.append("\r\n");
        response.append(responseContent.data);
        socket.write(response);
     }else{
        responseContent = new QByteArray();
        responseContent.append("<h3>404 Error</h3>Invalid request!");
        responseHeader = new QHttpResponseHeader(404, "Not Found", 1, 1);
        responseHeader.setContentLength(responseContent.length());
        responseHeader.setValue("Content-Type", "text/html");
        response = new QByteArray();
        response.append(responseHeader.toString());
        //response.append("\r\n");
        response.append(responseContent);
        socket.write(response);
     }
}