/*
 *    Copyright (C) 2009 by Johannes Wolter <jw@inutil.org>
 *                          Ian Monroe <ian@monroe.nu>
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
Importer.include("util.js");
Importer.include("conf.js");

function HTTPServer(){
    QTcpServer.call(this, null);
    this.listen(new QHostAddress(QHostAddress.Any), PORT);
    if(!this.isListening()){
        Amarok.alert("Unable to open on port "+PORT+" for the web server.");
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
        Amarok.debug("Pending: Handling request (left: "+this.requestQueue.length+"): "+r[1]);
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