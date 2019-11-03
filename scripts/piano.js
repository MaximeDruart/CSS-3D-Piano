// javascript for our 3d items : mainly for moving around items / setting properties
class CSS3DItem {
	constructor(wrapper, container) {
		this.wrap = document.querySelector(wrapper)
		this.itemContainer = document.querySelector(container)
		this.movementEnabled = true
		this.movementEnabledX = true
		this.y = 0
		this.x = -30
		this.z = 0
		this.minZ = -200
		this.maxZ = 1400
		this.firstRunX = 0
		this.firstRunY = 0
		this.isHolding = false
		this.firstRun = true
		this.maxRotation = 180
		this.mousex
		this.mousey
		this.selfRotationTl

		// keyboard movement
		document.addEventListener('keydown', event => { if (this.movementEnabled) this.kbMovementHandler(event)}, false)
		
		// moving around the item , zooming in/out
		this.itemContainer.addEventListener('mousedown', event => {this.mouseDownHandler(event)}, false)
		this.itemContainer.addEventListener('touchstart', event => {this.mouseDownHandler(event)}, false)
		document.addEventListener('mousemove', event => {this.mouseMoveHandler(event)}, false)
		document.addEventListener('touchmove', event => {this.mouseMoveHandler(event)}, false)
		document.addEventListener('mouseup', event => {this.mouseUpHandler(event)}, false)
		document.addEventListener('touchend', event => {this.mouseUpHandler(event)}, false)
		document.addEventListener('wheel', event => {this.zoomHandler(event)}, false)

	}

	selfRotate(x, y, z, time){
		this.selfRotationTl = new TimelineMax({paused : true, repeat:-1})
		x = x === 0 ? this.x : x
		this.selfRotationTl.to(this.wrap, time, {ease:Power0.easeOut,  rotationX : x, rotationY : y, rotationZ : z})
		this.selfRotationTl.play()
	}

	mouseDownHandler(event) {
		// on détecte que la souris est enfoncé et stocke les positions initiales du curseur
		// clic gauche ou roue
		if (event.button == 0 || event.button == 1) {
			this.isHolding = true
			this.mousex = event.x
			this.mousey = event.y
			this.firstRunY = this.y
			this.firstRunX = this.x
		}
	}

	mouseMoveHandler(event) {
		if (this.isHolding) {
			// lorsque la souris est enfoncé, on va ajouter / soustraire aux X/Y actuelles la différence entre la position initiale de la souris et sa position actuelle
			// axe inversé entre ceux de css 3d et ceux de la souris
			// l'axe rotationX va correspondre à l'axe Y de la souris et vice versa
			this.firstRunY = this.y - ((this.mousex - event.x) / 7)
			this.firstRunX = this.x + ((this.mousey - event.y) / 5)
			// on applique ensuite ces valeurs.
			if (this.movementEnabled) {
				if (this.selfRotationTl) {					
					this.selfRotationTl.pause()
					this.selfRotationTl.currentTime = 0
				}
				TweenMax.to(this.wrap, 0.1, {
					rotationX: this.firstRunX,
					rotationY: this.firstRunY
				})
			} else if(this.movementEnabledX) {
				// TweenMax.to(this.wrap, 0.1, {
				// 	rotationX: this.firstRunX
				// })
			}
		}
	}

	mouseUpHandler() {
		// lorsque l'utilisateur relache le clic, on actualise nos valeurs x/y et reset nos valeurs temporaires.
		this.x = this.firstRunX
		this.y = this.firstRunY
		this.firstRunY = 0
		this.firstRunX = 0
		this.isHolding = false
		// if (this.movementEnabled && this.selfRotationTl) {
		// 	this.selfRotationTl.play()
		// }
	}

	zoomHandler(event) {
		if (this.z >= this.minZ && this.z < this.maxZ) {
			this.z += event.deltaY
		} else if (this.z >= this.maxZ) {
			if (event.deltaY < 0) this.z += event.deltaY
		} else {
			if (event.deltaY > 0) this.z += event.deltaY
		}
		TweenMax.to(this.wrap, 0.3, {
			z: -this.z
		})
	}

	kbMovementHandler(event) {
		if (event.code == "ArrowDown") this.x -= 5
		if (event.code == "ArrowUp") this.x += 5
		if (event.code == "ArrowLeft") this.y -= 5
		if (event.code == "ArrowRight") this.y += 5
		TweenMax.to(this.wrap, 0.1, {
			rotationX: this.x,
			rotationY: this.y
		})
	}

}


// class extension for piano specific features (playing keys, sound, etc)
class Piano extends CSS3DItem {
	constructor(wrapper, container) {
		super(wrapper, container)
		this.movementEnabled = false
		this.tiles = document.querySelectorAll(".kb-tiles .kb-tile")
		this.whiteTiles = document.querySelectorAll(".tiles-white .kb-tile")
		this.blackTiles = document.querySelectorAll(".tiles-black .kb-tile")
		this.ui = document.querySelector(".ui")
		this.audios = []
		// on va chercher la largeur d'une touche. Soit la largeur de la face avant de n'importe quelle touche
		// toujours dans le process de n'avoir qu'une seule source de vérité (soit les variables scss)
		this.whiteTileWidth = parseInt(getComputedStyle(this.whiteTiles[0].children[5]).getPropertyValue("width"))
		this.blackTileWidth = parseInt(getComputedStyle(this.blackTiles[0].children[5]).getPropertyValue("width"))
		this.spacing = 2

		this.chars = 'azertyuiopqsdfghjklmw'
		this.charsBlack = 'azetyiopsdghjlm'.toUpperCase()
		
		this.tileTl = ""
		this.activeKeyTimelines = []

		// clicking on tile
		this.tiles.forEach(tile => {
			// click animation
			tile.addEventListener('mousedown', () => {
				this.keyPress(tile)
			})
			tile.addEventListener('touchstart', () => {
				this.keyPress(tile)
			})
			tile.addEventListener('mouseup', event => {
				this.keyPressUpHandler(event, tile)
			})
			tile.addEventListener('touchend', event => {
				this.keyPressUpHandler(event, tile)
			})
			tile.addEventListener('mouseout', event => {
				this.keyPressUpHandler(event, tile)
			})
			tile.addEventListener('touchcancel', event => {
				this.keyPressUpHandler(event, tile)
			})
		})

		// pressing keyboard key
		document.addEventListener('keydown', e => {
			if (this.movementEnabled) {
				if (this.chars.indexOf(e.key) !== -1) this.keyPress(this.whiteTiles[this.chars.indexOf(e.key)])
				if (this.charsBlack.indexOf(e.key) !== -1) this.keyPress(this.blackTiles[this.charsBlack.indexOf(e.key)])
			}
		}, false)
		document.addEventListener('keyup', event => {
			if (this.movementEnabled) this.keyReleaseHandler(event)
		}, false)

	}

	init() {
		this.keysSetup()
		this.getAudios()
	}

	getAudios() {
		// readying audio files
		this.tiles.forEach(tile => {
			let audio = {
				audio: new Audio(`sounds/mp3/Piano.mf.${tile.getAttribute("note")}.mp3`),
				tile: tile
			}
			this.audios.push(audio)
		})
	}

	// setting up all the keys on the keyboard
	keysSetup() {
		let c = 0
		this.whiteTiles.forEach((tile, index) => {
			// offsetting each tile
			tile.setAttribute("offset", index * (this.whiteTileWidth + this.spacing))
			TweenMax.set(tile, {
				x: index * (this.whiteTileWidth + this.spacing)
			})
			// setting up black tiles
			if (tile.hasAttribute("black-key")) {
				// https://images-na.ssl-images-amazon.com/images/I/51BT0jwqW0L._AC_SL1001_.jpg
				// si on regarde bien les noirs on peut voir qu'elles ont pas toujours la meme position en fonction de leur note.
				// pour ré, la noir est presque entierement sur la note, pour mi elle est au milieu et pour fa c'est l'inverse de ré
				// je distingue donc left / middle / right
				if (tile.hasAttribute("black-keyL")) TweenMax.set(this.blackTiles[c], {
					x: ((tile.getAttribute("offset") - (this.blackTileWidth / 2) - this.spacing) + (-this.blackTileWidth / 5))
				})
				if (tile.hasAttribute("black-keyM")) TweenMax.set(this.blackTiles[c], {
					x: (tile.getAttribute("offset") - (this.blackTileWidth / 2) - this.spacing)
				})
				if (tile.hasAttribute("black-keyR")) TweenMax.set(this.blackTiles[c], {
					x: (tile.getAttribute("offset") - (this.blackTileWidth / 2) - this.spacing) + (this.blackTileWidth / 5)
				})
				c++
			}
		})

		// https://cdn.discordapp.com/attachments/545905273471107081/637958663767588894/piano-notes.png
		// est-ce que j'ai gagné du temps à ecrire un algo qui place les notes en js plutot que de le faire a la main ? bah non
		const notes = "fgabcde".toUpperCase() // do ré mi fa sol la si
		const startOctave = 2
		this.whiteTiles.forEach((tile, index) => {
			// soit nb = 1 puis 2 puis 3
			let nb = 1 * startOctave + Math.floor(index / notes.length)
			if (index >= notes.length) {
				let coef = Math.floor(index / notes.length)
				let i2 = index - (notes.length) * coef
				tile.setAttribute("note", notes[i2].concat(nb))
			} else {
				tile.setAttribute("note", notes[index].concat(nb))
			}
		})
	}

	keymapping(set = true) {
		if (set) {
			this.whiteTiles.forEach((tile, index) => {
				// children[2] = face du dessus
				tile.children[2].innerText = this.chars[index]
			})
			this.blackTiles.forEach((tile, index) => {
				// children[2] = face du dessus
				tile.children[2].innerText = this.charsBlack[index]
			})
		} else {
			this.tiles.forEach(tile => {
				tile.children[2].innerText = ""
			})
		}
	}

	// creating a timeline each time a key is pressed and adding it to activeKeyTimelines.
	// this system allows for multiple timelines being run simultaneously
	keyPress(tile) {
		let createNewTl = true
		this.activeKeyTimelines.forEach(tl => {
			if (tl.tile === tile) createNewTl = false
		})
		if (createNewTl) {
			this.audios.forEach(sound => {
				if (sound.tile === tile) {
					sound.audio.currentTime = 0
					sound.audio.play()
				}
			})
			this.tileTl = new TimelineMax()
			this.tileTl.onComplete = this.tileTl.destroy
			this.tileTl.fromTo(tile, 0.10, {
				rotationX: "0deg",
				y: 0
			}, {
				rotationX: "-6deg",
				y: "6px"
			})
			this.tileTl.play()
			let tempObj = {
				tile: tile,
				timeline: this.tileTl
			}
			this.activeKeyTimelines.push(tempObj)
		}
	}

	// when the key is released, timeline is reversed then destroyed
	keyPressUpHandler(event, tile) {
		//stop sound
		this.audios.forEach(sound => {
			if (sound.tile === tile) {
				sound.audio.pause()
				sound.audio.currentTime = 0
			}
		})
		// for each timeline
		this.activeKeyTimelines.forEach((tl, index) => {
			// if there's a timeline for the tile
			if (tl.tile === tile) {
				// reverse it
				tl.timeline.reverse()
				// and remove the timeline
				this.activeKeyTimelines.splice(index, 1)
			}
		})
	}

	// same but keyboard version
	keyReleaseHandler(e) {
		if (this.chars.indexOf(e.key) !== -1) {
			this.audios.forEach(sound => {
				if (sound.tile === this.whiteTiles[this.chars.indexOf(e.key)]) {
					sound.audio.pause()
					sound.audio.currentTime = 0
				}
			})
			this.activeKeyTimelines.forEach((tl, index) => {
				// if there's a timeline for the tile
				if (tl.tile === this.whiteTiles[this.chars.indexOf(e.key)]) {
					// reverse it
					tl.timeline.reverse()
					// and remove the timeline
					this.activeKeyTimelines.splice(index, 1)
				}
			})
		}

		if (this.charsBlack.indexOf(e.key) !== -1) {
			this.audios.forEach(sound => {
				if (sound.tile === this.blackTiles[this.charsBlack.indexOf(e.key)]) {
					sound.audio.pause()
					sound.audio.currentTime = 0
				}
			})
			this.activeKeyTimelines.forEach((tl, index) => {
				// if there's a timeline for the tile
				if (tl.tile === this.blackTiles[this.charsBlack.indexOf(e.key)]) {
					// reverse it
					tl.timeline.reverse()
					// and remove the timeline
					this.activeKeyTimelines.splice(index, 1)
				}
			})
		}
	}
}


// interface buttons, mostly event listeners and funny timelines
class UserInterface {
	constructor(pianoParam) {
		this.keymappingOn = false
		this.wireframeView = false
		this.qwertyMode = false
		this.ui = pianoParam.ui
		this.wireframeTl = new TimelineMax({paused: true})
		this.wireframeTl.staggerTo(".kb", 0.3, {
			backgroundColor: "none",
			border: "1px solid black",
			stagger: 0.01
		})

		this.ui.querySelector(".top-view-btn").addEventListener('click', () => {
			pianoParam.x = -80, pianoParam.y = 0
			TweenMax.to(pianoParam.wrap, 0.6, {
				rotationX: pianoParam.x,
				rotationY: pianoParam.y
			})
		})
		this.ui.querySelector(".reset-view-btn").addEventListener('click', () => {
			pianoParam.x = -30, pianoParam.y = 0
			TweenMax.to(pianoParam.wrap, 0.6, {
				rotationX: pianoParam.x,
				rotationY: pianoParam.y
			})
		})

		this.ui.querySelector(".wireframe-mode-btn").addEventListener('click', () => {
			this.wireframeView = !this.wireframeView
			this.wireframeView ? this.wireframeTl.play() : this.wireframeTl.reverse()
			this.ui.querySelector(".wireframe-mode-btn").innerText = this.wireframeView ? "STANDARD VIEW" : "WIREFRAME VIEW"
		})

		this.ui.querySelector(".build-mode-btn").addEventListener('click', () => {
			let buildTl = new TimelineMax({paused: true})
			buildTl.staggerFrom(".kb", 0.3, {
				transform: "none",
				stagger: 0.02
			})
			buildTl.restart()
		})

		this.ui.querySelector(".keymap-mode-btn").addEventListener('click', () => {
			this.keymappingOn = !this.keymappingOn
			pianoParam.keymapping(this.keymappingOn)
			this.ui.querySelector(".keymap-mode-btn").innerText = this.keymappingOn ? "HIDE KEY MAPPING" : "SHOW KEY MAPPING"
		})

		this.ui.querySelector(".qwerty-mode-btn").addEventListener('click', () => {
			this.qwertyMode = !this.qwertyMode
			if (this.qwertyMode) {
				pianoParam.chars = "qwertyuiopasdfghjkl;z"
				pianoParam.charsBlack = "qwetyiopsdghjl;"
			} else {
				pianoParam.chars = 'azertyuiopqsdfghjklmw'
				pianoParam.charsBlack = 'azetyiopsdghjlm'.toUpperCase()
			}
			this.ui.querySelector(".qwerty-mode-btn").innerText = this.qwertyMode ? "AZERTY MODE" : "QWERTY MODE"
		})
	}
}
