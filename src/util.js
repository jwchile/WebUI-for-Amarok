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

/**
 * Convenience function
 */
QByteArray.prototype.toString = function(){
    ts = new QTextStream( this, QIODevice.ReadOnly );
    return ts.readAll();
}

/**
 * Crop the string to size max and add "...".
 * @param {int} maximum length of the string
 */
shorten = function(str, max){
    if(str.length > max)
        return str.substring(0,max-3)+"...";
    else
        return str
}

/**
 * 
 * @param {QPixmap} pixmap
 * @param {int} width
 */
pixmapToPNG = function(pixmap, width){
    data = new QByteArray();
    buffer = new QBuffer(data);
    buffer.open(QIODevice.WriteOnly);
    pixmap.scaledToWidth(width, Qt.SmoothTransformation).save(buffer, "PNG");
    buffer.close();
    return data;
}

/*
 * Shorthand: Select variant readConfig of Script class
 * 
 * this convenience function selects the variant overload of the readConfig
 * method provided by the Amarok.Script interface. (Otherwise, when just
 * using readConfig, the script terminates with an ambiguous overload
 * exception).
 */
readConfigV = function(key, defValue) {
  return Amarok.Script["readConfig(QString,QVariant)"]( key, defValue );
}

/*
 * Same as above, but for writeConfig.
 */
writeConfigV = function( key, value ) {
  Amarok.Script["writeConfig(QString,QVariant)"]( key, value );
}

jsonEscape = function(str) {
	return str.replace("\\", "\\\\").replace(/["]/g, '\\"');
}
