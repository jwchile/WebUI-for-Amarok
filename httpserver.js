Importer.loadQtBinding("qt.core");
Importer.loadQtBinding("qt.network");
Importer.include("util.js");

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
    this.pendingRequestHandlerTimer = new QTimer();
    this.pendingRequestHandlerTimer.timeout.connect(this, this.handlePendingRequests);
}

HTTPServer.prototype = new QTcpServer();

HTTPServer.prototype.requestQueue = new Array();

HTTPServer.prototype.newConnectionCallback = function(){
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
                    thisHTTP.requestQueue.push(new Array(socket, header.path()));
                    request.clear();
                    /*Sometimes the script/handling of a request get's interrupted by Amarok.*/
                    /*Check if the request was handled successfully in 1000ms*/
                    thisHTTP.pendingRequestHandlerTimer.start(100);
                    /*Handle request*/
                    thisHTTP.handlePendingRequests();
                    /*thisHTTP.handleRequest(socket, header.path());*/
                }catch( error ){
                    Amarok.debug(error)
                }
            }
        }
    );
}

HTTPServer.prototype.handlePendingRequests = function(){
    while(this.requestQueue.length > 0){
        r = this.requestQueue[0];
        Amarok.debug("Pending: Handling request (left: "+this.requestQueue.length+"): "+r[0]+" "+r[1]);
        this.handleRequest(r[0], r[1]);
        this.requestQueue.shift();
        Amarok.debug("Handled request (left: "+this.requestQueue.length+")");
    }
    this.pendingRequestHandlerTimer.stop();
}

HTTPServer.prototype.setDefaultHandler = function(func){
    this.defaultHandler = func;
}

HTTPServer.prototype.registerHandler = function(path, func){
    this.requestHandlerRegistry[path] = func;
}

HTTPServer.prototype.getRequestHandler = function(path){
    for(var registeredPath in this.requestHandlerRegistry){
        if(path.indexOf(registeredPath)==0){
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
        response.append(responseContent);
        socket.write(response);
     }
}