/*
 *    Copyright (C) 2009 by Johannes Wolter <jw@inutil.org>    
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
Importer.loadQtBinding("qt.gui");


ENGINE_STATE_PLAY = 0
ENGINE_STATE_PAUSE = 1


function printStackTrace( ex )
{
    var err = "There was an error in the Amarok WebUI plugin!\n\n";

    err += "Error: " + ex.toString() + "\n"
    for ( var member in ex ) {
      err += member + ":" + ex[ member ] + "\n";
    }

    Amarok.alert(err);
}

/*
 * Create new WebUI "main" class. It will take care for everything...
 */
try {
  Importer.include("httpserver.js");
  Importer.include("util.js");
  Importer.include("fileio.js");
  Importer.include("amarokctrl.js");
  Importer.include("amarokcontent.js");
  Importer.include("amarokapi.js");
  Importer.include("amarokwebui.js");
  Importer.include("configuration.js");

  webuimain = new AmarokWebUI();
} catch ( e ) {
  printStackTrace( e );
}


