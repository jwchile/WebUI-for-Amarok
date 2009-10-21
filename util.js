//Convenience function
QByteArray.prototype.toString = function(){
    ts = new QTextStream( this, QIODevice.ReadOnly );
    return ts.readAll();
}