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
    Amarok.alert("<b>Successfully started WebUI!</b>  It can be accessed at port "+this.serverPort()+".");
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
                    Amarok.debug("Path: "+header.path());
                    thisHTTP.handleRequest(socket, header.path());
                }catch( error ){
                    Amarok.debug(error)
                }
            }
        }
    );
}

HTTPServer.prototype.registerHandler = function(path, func){
    this.requestHandlerRegistry[path] = func;
}

HTTPServer.prototype.getRequestHandler = function(path){
    Amarok.debug("Req-Path: "+path);
    for(var registeredPath in this.requestHandlerRegistry){
        if(path.indexOf(registeredPath)==0)
            return this.requestHandlerRegistry[registeredPath];
    }
    return null;
}

HTTPServer.prototype.handleRequest = function(socket, path){
    handler = this.getRequestHandler(path);
    content = Amarok.Engine.currentTrack().artist+" "+Amarok.Engine.currentTrack().title+"</br>"
    response = new QByteArray();
    response.append("HTTP/1.1 200\n");
    response.append("Content-Type: text/html\n");
    response.append("Content-Length: "+content.length+"\n");
    response.append("Server: Amarok WebUI\n\r\n");
    //response.append("This is a test!</br>");
    //response.append(Amarok.Info.scriptPath()+"</br>");
    response.append(content);
    socket.write(response);
}