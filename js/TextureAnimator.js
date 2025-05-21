THREE.TextureAnimator = function(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) {
	// note: texture passed by reference, will be updated by the update function.
	
	//texture.minFilter = THREE.LinearFilter;
	//texture.magFilter = THREE.LinearFilter;

	this.tilesHorizontal = tilesHoriz;
	this.tilesVertical = tilesVert;
	// how many images does this spritesheet contain?
	//  usually equals tilesHoriz * tilesVert, but not necessarily,
	//  if there at blank tiles at the bottom of the spritesheet.
	this.numberOfTiles = numTiles;
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(1 / this.tilesHorizontal, 1 / this.tilesVertical);

	// how long should each image be displayed?
	this.tileDisplayDuration = tileDispDuration;

	// how long has the current image been displayed?
	this.currentDisplayTime = 0;

	// which image is currently being displayed?
	this.currentTile = 0;

	this.playing = false;



	this.update = function(milliSec) {
		if (this.playing) {
			this.currentDisplayTime += milliSec;
			while (this.currentDisplayTime > this.tileDisplayDuration) {
				this.currentDisplayTime -= this.tileDisplayDuration;
				this.currentTile++;
				//console.log(this.currentTile);
				if (this.currentTile == this.numberOfTiles) {
					this.currentTile = 0;
					this.playing = false;
				}

				var currentColumn = this.currentTile % this.tilesHorizontal;
				texture.offset.x = currentColumn / this.tilesHorizontal;
				var currentRow = tilesVert === 1 ? 0 : Math.floor(this.numberOfTiles / this.tilesHorizontal) - Math.floor(this.currentTile / this.tilesHorizontal);
				texture.offset.y = currentRow / this.tilesVertical;

			}
		}
	};
};