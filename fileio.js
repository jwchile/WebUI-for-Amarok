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

Importer.include("httpserver.js");

/*
 * Serve a file from the <scriptPath>/www folder.
 * If path is pointing to a parent directory a 403 is sent.
 * For some file types the corresponding mime-type is set.
 */
fileHandler = function(path){
    response = new HandlerResponse();
    if(path === "/" || path === ""){
        path = "/index.html";
    }
    canonicalRootDir = new QFileInfo(Amarok.Info.scriptPath()+"/www").canonicalFilePath();
    pathFileInfo = new QFileInfo(Amarok.Info.scriptPath()+"/www"+path);
    if(pathFileInfo.canonicalFilePath().indexOf(canonicalRootDir) != 0){
        Amarok.debug("Forbidden!");
        response.append("403 Error: Forbidden!");
        response.setMimeType("text/plain");
        response.setReturnCode(403, "Forbidden");
        return response;
    }
    Amarok.debug("File: "+pathFileInfo.canonicalFilePath());
    file = new QFile(pathFileInfo.canonicalFilePath());
    if(file.open(QIODevice.ReadOnly)){
        if( pathFileInfo.completeSuffix() == "css" ){
            response.setMimeType("text/css");
        }else if( pathFileInfo.completeSuffix() == "js" ){
            response.setMimeType("text/js");
        }else if( pathFileInfo.completeSuffix() == "png" ){
            response.setMimeType("image/png");
        }else if( pathFileInfo.completeSuffix() == "gif" ){
            response.setMimeType("image/gif");
        }
        response.append(file.readAll());
        file.close();
        return response;
    }else{
        Amarok.debug("File not found!");
        response.append("404 Error: File not found!");
        response.setReturnCode(404, "Not Found");
        response.setMimeType("text/plain");
    }
    return response;
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