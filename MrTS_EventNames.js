//=============================================================================
// MrTS_EventNames.js
//=============================================================================

/*:
* @plugindesc Allows events to show their names above them.
* @author Mr. Trivel
*
* @param Default Range
* @desc How close player has to be to see event's name in tiles.
* Default: 5
* @default 5
*
* @param Font Size
* @desc Font size for event's name.
* Default: 24
* @default 24
*
* @param Fade Names
* @desc Should event names have a fade effect? True/False
* Default: False
* @default False
*
* @param Fade Pictures
* @desc Should event pictures have a fade effect? True/False
* Default: False
* @default False
*
* @param Fade Timer
* @desc How quickly should pictures and names fade? In frames. 60 = 1s
* Default: 30
* @default 30
* 
* @help 
* --------------------------------------------------------------------------------
* Free for non commercial use.
* Version 1.4
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Event Comment Commands 
* --------------------------------------------------------------------------------
* Displays a name or picture according to page the event is in.
* Use "Comment..." command under Flow Control for these tags.
*
* <Name: NAME, RANGE>
* NAME - Event Name
* RANGE - How close player has to be to see the event name above it.
*
* <Picture: NAME, RANGE>
* NAME - Picture Name (Picture located in img\system)
* RANGE - How close player has to be to see the event's picture above it.
* --------------------------------------------------------------------------------
* Event Note Fields
* --------------------------------------------------------------------------------
* Displays a permanent name above event's head:
* <Name:NAME, RANGE>
* NAME - event name
* RANGE - how close player has to be to see the event name above it.
*
* Displays a permanent picture above event's head:
* <Picture:NAME, RANGE>
* NAME - picture name (Picture located in img\system)
* RANGE - how close player has to be to see the event's picture
* 
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.4 - Added Fade in and Fade out effects for event names and pictures.
*     - Fixed layering of pictures and names. They're properly above now.
* 1.3 - Crash fix
* 1.2 - Bug fix
* 1.1 - Added Pictures above event heads.
*       Added Picture and Names changing when event switches pages.
* 1.0 - Release
*/

(function() {

	//-----------------------------------------------------------------------------
	// Parameters
	// 
	var parameters = PluginManager.parameters('MrTS_EventNames');

	var paramDefaultRange 	= Number(parameters['Default Range'] || 5);
	var paramFontSize		= Number(parameters['Font Size'] || 24);
	var paramFadeNames		= Boolean(parameters['Fade Names'] && parameters['Fade Names'].toLowerCase() === "true" || false);
	var paramFadePictures	= Boolean(parameters['Fade Pictures'] && parameters['Fade Pictures'].toLowerCase() === "true" || false);
	var paramFadeTimer		= Number(parameters['Fade Timer'] || 30);

	var regexEventName = /<name:[ ]*(.*),[ ]*(\d+)>/i;
	var regexPictureName = /<picture:[ ]*(.*),[ ]*(\d+)>/i;

	//-----------------------------------------------------------------------------
	// Game_Event
	// 

	var _GameEvent_initialize = Game_Event.prototype.initialize;
	Game_Event.prototype.initialize = function(mapId, eventId) {
		_GameEvent_initialize.call(this, mapId, eventId);
		if (this.event().meta.Name)
	    {
	        var nameMeta = this.event().meta.Name.split(",");
	        this._displayEventName = nameMeta[0];
	        this._displayEventRange = Number(nameMeta[1]) === 0 ? paramDefaultRange : Number(nameMeta[1]);
	    }
	    if (this.event().meta.Picture)
	    {
	    	var pictureMeta = this.event().meta.Picture.split(",");
	    	if (pictureMeta[0][0] == " ") pictureMeta[0] = pictureMeta[0].substring(1);
	    	this._displayPictureName = pictureMeta[0];
	    	this._displayPictureRange = Number(pictureMeta[1]) === 0 ? paramDefaultRange : Number(pictureMeta[1]);
	    }
	    this.updateOverheadData();
	};

	Game_Event.prototype.updateOverheadData = function() {
		this._overheadPageIndex = this._pageIndex;
		if (!this.page() || this.event().meta.Name || this.event().meta.Picture) return;

		var dataName = "";
		var dataPicture = "";
		var dataNameRange = 0;
		var dataPictureRange = 0;

		if (this.list())
	    {
	    	for (action of this.list())
	    	{
	    		if (action.code == "108") {
	    			var a = action.parameters[0];
	    			var matchName = regexEventName.exec(a);
	    			if (matchName)
	    			{
	    				dataName = matchName[1];
	    				dataNameRange = Number(matchName[2]);
	    			}

	    			var matchPicture = regexPictureName.exec(a);
	    			if (matchPicture)
	    			{
	    				dataPicture = matchPicture[1];
	    				dataPictureRange = matchPicture[2];
	    			}
	    		} 
	    	}
	    }

	    this._displayEventName = dataName;
		this._displayEventRange = dataNameRange;
		this._displayPictureName = dataPicture;
		this._displayPictureRange = dataPictureRange;
	};

	var _GameEvent_update = Game_Event.prototype.update;
	Game_Event.prototype.update = function()
	{
	    _GameEvent_update.call(this);
	    if (this._pageIndex != this._overheadPageIndex)
	    	this.updateOverheadData();
	};

	//-----------------------------------------------------------------------------
	// Sprite_Character
	// 

	var _SpriteCharacter_initialize = Sprite_Character.prototype.initialize;
	Sprite_Character.prototype.initialize = function(character) {
		_SpriteCharacter_initialize.call(this, character);

    	this._npAdded = false;
	};

	Sprite_Character.prototype.updateName = function() {
        this._currentEventName = this._character._displayEventName;
        if (this._currentEventName == "")
        	this.removeName();
        else
        {
			this._spriteEventName.bitmap = new Bitmap(200, 60);
	        this._spriteEventName.bitmap.fontSize = paramFontSize;
	        var nameWidth = this._spriteEventName.bitmap.measureTextWidth(this._character._displayEventName);
	        this._spriteEventName.bitmap = new Bitmap(nameWidth+40, paramFontSize+10);
	        this._spriteEventName.bitmap.fontSize = paramFontSize;
	        this._spriteEventName.bitmap.drawText(this._character._displayEventName, 0, 0, nameWidth+40, paramFontSize+10, 'center');
	    }
	};

	Sprite_Character.prototype.updatePicture = function() {
        this._currentPictureName = this._character._displayPictureName;
        if (this._currentPictureName == "")
        	this.removePicture();
        else
			this._spriteEventPicture.bitmap = ImageManager.loadSystem(this._character._displayPictureName);
	};

	Sprite_Character.prototype.removeName = function() {
		if (this._spriteEventName.bitmap) this._spriteEventName.bitmap.clear();
	};

	Sprite_Character.prototype.removePicture = function () {
		if (this._spriteEventPicture.bitmap) this._spriteEventPicture.bitmap.clear();
	};

	var _SpriteCharacter_update = Sprite_Character.prototype.update;
	Sprite_Character.prototype.update = function() {
		_SpriteCharacter_update.call(this);
		this.updateOverheadData();
		this.updateOverheadPosition();
	};

	Sprite_Character.prototype.updateOverheadPosition = function() {
	    if (this._spriteEventName) {
		    this._spriteEventName.x = this.x -this._spriteEventName.width/2;
		    this._spriteEventName.y = this.y -this._spriteEventName.height/2 - 12 - this._frame.height;
    		if (this._character._displayEventRange < Math.abs(($gamePlayer.x - this._character.x)) + Math.abs(($gamePlayer.y - this._character.y)))
    		{
    			if (paramFadeNames)
    			{
	    			if (this._spriteEventName.opacity !== 0)
	    			{
	    				this._spriteEventName.opacity -= 255/paramFadeTimer;
	    				if (this._spriteEventName.opacity < 0) this._spriteEventName.opacity = 0;
	    			}
	    		}
	    		else this._spriteEventName.visible = false;
    		}
    		else {
    			if (paramFadeNames)
    			{
	    			if (this._spriteEventName.opacity !== 255)
	    			{
	    				this._spriteEventName.opacity += 255/paramFadeTimer;
	    				if (this._spriteEventName.opacity > 255) this._spriteEventName.opacity = 255;
	    			}
	    		}
	    		else this._spriteEventName.visible = true;
    		}
	    }
	    if (this._spriteEventPicture) {
	    	this._spriteEventPicture.x = this.x-this._spriteEventPicture.width/2;
	        this._spriteEventPicture.y = this.y-this._spriteEventPicture.height/2 - 12 - this._frame.height;
    		if (this._character._displayPictureRange < Math.abs(($gamePlayer.x - this._character.x)) + Math.abs(($gamePlayer.y - this._character.y)))
    		{
    			if (paramFadePictures)
    			{
    				if (this._spriteEventPicture.opacity !== 0)
    				{
    					this._spriteEventPicture.opacity -= 255/paramFadeTimer;
    					if (this._spriteEventPicture.opacity < 0) this._spriteEventPicture.opacity = 0;
    				}
    			}
    			else this._spriteEventPicture.visible = false;
    		}
    		else {
    			if (paramFadePictures)
    			{
    				if (this._spriteEventPicture.opacity !== 255)
    				{
    					this._spriteEventPicture.opacity += 255/paramFadeTimer;
    					if (this._spriteEventPicture.opacity > 255) this._spriteEventPicture.opacity = 255;
    				}
    			}
    			else this._spriteEventPicture.visible = true;
    		} 
	    }
	};

	Sprite_Character.prototype.updateOverheadData = function() {
		if (!this._npAdded)
		{
			this._npAdded = true;
			this._spriteEventName = new Sprite();
	    	this._spriteEventPicture = new Sprite();

	    	this._spriteEventName.z = 7;
	    	this._spriteEventPicture.z = 7;

	        this.updatePicture();
	        this.updateName();
	        this.parent.addChild(this._spriteEventName);
	    	this.parent.addChild(this._spriteEventPicture);
		}

		if (this._character._displayEventName && this._character._displayEventName != this._currentEventName)
			this.updateName();

		if (this._character._displayPictureName && this._character._displayPictureName != this._currentPictureName)
			this.updatePicture();
	};
		

})();
