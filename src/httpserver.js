/*
 *    Copyright (C) 2009 by Johannes Wolter <jw@inutil.org>
 *                          Ian Monroe <ian@monroe.nu>
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
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

Importer.loadQtBinding("qt.core");
Importer.loadQtBinding("qt.network");
Importer.include("util.js");
Importer.include("configuration.js");

function HTTPServer( webui ){
  this.webui = webui;
	if(this.webui.configuration.restrictAccessToSubnet && this.webui.configuration.restrictAccessToSubnet.length > 0){
		this.checkIPAddress = true;
		try{
			this.validSubnet = QHostAddress.parseSubnet(this.webui.configuration.restrictAccessToSubnet);
		}catch( error ){
			Amarok.alert("Invalid subnet!");
		}
	}
  QTcpServer.call(this, null);
  this.listen(new QHostAddress(QHostAddress.Any), this.webui.configuration.port);
  if(!this.isListening()){
      Amarok.alert("Unable to open on port "+this.webui.configuration.port+" for the web server.");
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
	if (this.checkIPAddress && !socket.peerAddress().isInSubnet(this.validSubnet)) {
		Amarok.debug("Request from unauthorized IP address: " + socket.peerAddress().toString());
		socket.close();
	}else {
		var request = new QByteArray();
		var thisHTTP = this;
		socket.readyRead.connect(function(){
			request.append(socket.readAll());
			var endOfRequest = request.indexOf("\r\n\r\n");
			if (endOfRequest > 0) {
				try {
					var header = new QHttpRequestHeader(request.left(endOfRequest + 4).toString());
					thisHTTP.requestQueue.push(new Array(socket, header));
					request.clear();
					/*Sometimes the script/handling of a request get's interrupted by Amarok.*/
					/*Check if the request was handled successfully in 1000ms*/
					thisHTTP.pendingRequestHandlerTimer.start(100);
					/*Handle request*/
					thisHTTP.handlePendingRequests();
				/*thisHTTP.handleRequest(socket, header.path());*/
				} 
				catch (error) {
					Amarok.debug(error)
				}
			}
		});
	}
}

HTTPServer.prototype.handlePendingRequests = function(){
    while(this.requestQueue.length > 0){
        r = this.requestQueue[0];
        Amarok.debug("Pending: Handling request (left: "+this.requestQueue.length+"): "+r[1].path());
		try {
			this.handleRequest(r[0], r[1]);
		} 
		catch (e) {
			Amarok.debug("Error while handling request [" + r[1] + "]: " + e.toString());
		}
        //Remove request from queue, even when an exception occurred. This mechanism
		//should only retry to process a request whose handling got interrupted by
		//Amarok, not the requests whose handling failed with an exception.
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

/**
 * Convenience method for a HTTP response without much content.
 * FIXME: maybe merge with HTTP-200 response code?
 */
HTTPServer.prototype.sendErrorMsg = function(socket, retCode, reasonPhrase, msg, values){
	responseHeader = new QHttpResponseHeader(retCode, reasonPhrase, 1, 1);
	responseContent = new QByteArray();
	responseContent.append(msg);
	responseHeader.setContentLength(responseContent.length());
	responseHeader.setValue("Content-Type", "text/html");
	if(values)
		for(var v = 0; v<values.length; v++)
			responseHeader.setValue(values[v][0], values[v][1]);	
    response = new QByteArray();
    response.append(responseHeader.toString());
    response.append(responseContent);
    socket.write(response);
}

/**
 * Enforces basic authentication (when enabled in conf.js).
 * FIXME: Implement digest authentication ("nonce" has to be 
 * stored since scripts sometimes get interrupted; see requestQueue).
 */
HTTPServer.prototype.checkAuth = function(socket, header){
	if (this.webui.configuration.basicAuth) {
		if (header.value("Authorization").match("^Basic") != "Basic") {
			this.sendErrorMsg(socket, 401, "Authorization Required", "<h3>401 Error</h3>Authorization Required!", [["WWW-Authenticate", 'Basic realm="WebUI for Amarok"']]);
			return false;
			
		}
		else {
			authStr = new QByteArray(this.webui.configuration.user + ":" + this.webui.configuration.passwd).toBase64();
			authResponse = header.value("Authorization").substring(6);
			if (authResponse != authStr) {
				this.sendErrorMsg(socket, 401, "Authorization Required", "<h3>401 Error</h3>Authorization Required!", [["WWW-Authenticate", 'Basic realm="WebUI for Amarok"']]);
				return false;
			}
		}
	}
	return true;
}

HTTPServer.prototype.handleRequest = function(socket, header){
	if (this.checkAuth(socket, header)) {
		path = header.path();
		handler = this.getRequestHandler(path);
		if (handler != null) {
			var handlerResponse;
			handlerResponse = handler(path);
			responseHeader = new QHttpResponseHeader(handlerResponse.retCode, handlerResponse.reasonPhrase, 1, 1);
			/*if(!handlerResponse.content instanceof QByteArray)
		 		Amarok.alert("Content"+handlerResponse.content.toString());*/
			//FIXME: In some cases handlerResponse.content does not seem to be a valid QByteArray.
			responseHeader.setValue("Content-Length", handlerResponse.content.length());
			responseHeader.setValue("Content-Type", handlerResponse.mimeType);
			response = new QByteArray();
			response.append(responseHeader.toString());
			response.append(handlerResponse.content);
			socket.write(response);
		}
		else {
			this.sendErrorMsg(404, "Not Found", "<h3>404 Error</h3>Invalid request!");
		}
	}
}

function HandlerResponse(){
	this.content = new QByteArray();
	this.retCode = 200;
	this.reasonPhrase = "OK";
	this.mimeType = "text/html";
}

HandlerResponse.prototype.setReturnCode = function(retCode, reasonPhrase){
	this.retCode = retCode;
	this.reasonPhrase = reasonPhrase;
}

HandlerResponse.prototype.append = function(content){
	this.content.append(content);
}

HandlerResponse.prototype.setMimeType = function(mimeType){
	this.mimeType = mimeType;
}
