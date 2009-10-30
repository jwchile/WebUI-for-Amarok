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