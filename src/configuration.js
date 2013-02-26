/*
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

/*
 * Creates a new Configuration object
 * 
 * This contructor is used to create a new configuration object. The sole
 * purpose of this class is to provide settings that can be changed by the
 * user. Settings can be saved and stored using the API provided by Amarok.
 * The class also provides GUI functionality, so the user can change the
 * settings of the plugin directly from within Amarok.
 */
function Configuration(webui) {
  this.webui = webui;
  this.dialog = null;
  this.restoreDefaultSettings();
}


/*
 * Returns the configuration volume step
 */
getVolumeStep = function(){
	var volumeStep = 5;
	return readConfigV( "volumeStep", volumeStep );
}


/*
 * Saves the configuration
 */
Configuration.prototype.saveSettings = function() {
  writeConfigV( "port", this.port );
  writeConfigV( "volumeStep", this.volumeStep );
  writeConfigV( "basicAuth", this.basicAuth );
  writeConfigV( "user", this.user );
  writeConfigV( "passwd", this.passwd );
  writeConfigV( "externalCollection", this.externalCollection );
  writeConfigV( "restrictAccessToSubnet", this.restrictAccessToSubnet );
}

/*
 * Restores the configuration
 * 
 * This reads the settings via Amarok's settings API. If settings have not been
 * saved previously, the currently set value for the property is used as default
 * value instead.
 */
Configuration.prototype.restoreSettings = function() {
  this.port = readConfigV( "port", this.port );
  this.volumeStep = readConfigV( "volumeStep", this.volumeStep );
  this.basicAuth = readConfigV( "basicAuth", this.basicAuth );
  this.user = readConfigV( "user", this.user );
  this.passwd = readConfigV( "passwd", this.passwd );
  this.externalCollection = readConfigV( "externalCollection", this.externalCollection );
  this.restrictAccessToSubnet = readConfigV( "restrictAccessToSubnet", this.restrictAccessToSubnet);
}

/*
 * Sets the default settings
 * 
 * This sets the default settings of the configuration.
 */
Configuration.prototype.restoreDefaultSettings = function() {
  this.port = 8080;
  this.volumeStep = 5;
  this.basicAuth = false;
  this.user = "";
  this.passwd = "";
  this.externalCollection = "/media/BACKUP/";
  this.restrictAccessToSubnet = null; //"192.168.178.1/24";
}

/*
 * Show the configuration dialog.
 * 
 * This shows the configuration dialog which allows the user to configure the
 * plugin.
 */
Configuration.prototype.configure = function() {
  try {
    this.setupGui();
    this.setValues();
    return this.dialog.exec();
  } catch ( ex ) {
    printStackTrace( ex );
  }
}




/*
 * Constructs the configuration dialog UI
 * 
 * If not already done, this constructs the dialog that is shown to the user
 * to let him configure the plugin.
 */
Configuration.prototype.setupGui = function() {
  if ( !this.dialog ) {
    this.dialog = new QDialog();
    this.dialog.windowTitle = "Amarok WebUI - Configuration";
    this.dialog.layout = new QVBoxLayout( this.dialog );
    this.componentsLayout = new QFormLayout( this.dialog );
    this.dialog.layout.addLayout( this.componentsLayout );
    this.dialogButtons = new QDialogButtonBox( this.dialog );
    this.dialog.layout.addWidget( this.dialogButtons, 0, 0 );
    this.dialogButtons.addButton( QDialogButtonBox.Ok );
    this.dialogButtons.addButton( QDialogButtonBox.Cancel );
    this.dialogButtons.addButton( QDialogButtonBox.RestoreDefaults ).clicked.connect(
      this, this.restoreAndSetDefaults );
    this.dialogButtons.accepted.connect( this, this.acceptAndClose );
    this.dialogButtons.rejected.connect( this, this.discardAndClose );
    
    this.portSpinBox = new QSpinBox( this.dialog );
    this.portSpinBox.minimum = 1;
    this.portSpinBox.maximum = 65535;
    this.volumeStepSpinBox = new QSpinBox( this.dialog );
    this.volumeStepSpinBox.minimum = 1;
    this.volumeStepSpinBox.maximum = 100;
    this.basicAuthCheckBox = new QCheckBox( this.dialog );
    this.userLineEdit = new QLineEdit( this.dialog );
    this.passwordLineEdit = new QLineEdit( this.dialog );
    this.passwordLineEdit.echoMode = QLineEdit.Password;
    this.restrictAccessToSubnetLineEdit = new QLineEdit( this.dialog );
    
    this.componentsLayout.addRow( "Port", this.portSpinBox );
    this.componentsLayout.addRow( "Volume Step", this.volumeStepSpinBox );
    this.componentsLayout.addRow( "Basic Auth", this.basicAuthCheckBox );
    this.componentsLayout.addRow( "Username", this.userLineEdit );
    this.componentsLayout.addRow( "Password", this.passwordLineEdit );
    this.componentsLayout.addRow( "Restrict Access to Subnet", this.restrictAccessToSubnetLineEdit );
  }
}

/*
 * Writes settings to the GUI
 * 
 * This method writes the settings from the Configuration instance "config"
 * to the GUI. If called without parameters, this method write the settings
 * of the this object instead.
 */
Configuration.prototype.setValues = function( config ) {
  if ( !config ) {
    config = this;
  }
  this.portSpinBox.value = config.port;
  this.volumeStepSpinBox.value = config.volumeStep;
  this.basicAuthCheckBox.checked = config.basicAuth;
  this.userLineEdit.text = config.user;
  this.passwordLineEdit.text = config.passwd;
  this.restrictAccessToSubnetLineEdit.text = config.restrictAccessToSubnet;
}

/*
 * Sets the default values in the GUI
 */
Configuration.prototype.restoreAndSetDefaults = function() {
  this.setValues( new Configuration() );
}

/*
 * Apply the settings from the GUI.
 * 
 * This method is called when the user uses accepts the current settings in
 * the GUI. It will read the settings from the GUI, save them and apply
 * them afterwards.
 * 
 * TODO: Check input for validity
 */
Configuration.prototype.acceptAndClose = function() {
  this.port = this.portSpinBox.value;
  this.volumeStep = this.volumeStepSpinBox.value;
  this.basicAuth = this.basicAuthCheckBox.checked;
  this.user = this.userLineEdit.text;
  this.passwd = this.passwordLineEdit.text;
  this.restrictAccessToSubnet = this.restrictAccessToSubnetLineEdit.text;
  this.saveSettings();
  this.dialog.accept();
}

/*
 * Discard the current settings from the GUI
 * 
 * This method is called when the user discards the settings from the GUI.
 * This will simply close the dialog.
 */
Configuration.prototype.discardAndClose = function() {
  this.dialog.reject();
}