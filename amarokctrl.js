/*
 *    Copyright (C) 2009 by Johannes Wolter <jw@inutil.org>
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

/*
 * Commands to control the player (the engine):
 */


nextTrack = function(path){
    Amarok.Engine.Next();
    return new HandlerResponse();  
}

prevTrack = function(path){
    Amarok.Engine.Prev();
    return new HandlerResponse();
}

playPause = function(path){
    if(Amarok.Engine.engineState() == 0)
        Amarok.Engine.Pause();
    else
        Amarok.Engine.Play();
    return new HandlerResponse();
}

stop = function(path){
    Amarok.Engine.Stop(false);
    return new HandlerResponse();
}

incVolume = function(path){
    Amarok.Engine.IncreaseVolume(VOLUME_STEP);
    return new HandlerResponse();
}

decVolume = function(path){
    Amarok.Engine.DecreaseVolume(VOLUME_STEP);
    return new HandlerResponse();
}