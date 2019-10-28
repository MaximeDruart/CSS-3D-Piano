const wrap = document.querySelector(".kb-anim-wrapper")
const whiteTiles = document.querySelectorAll(".tiles-white .kb-tile")
const blackTiles = document.querySelectorAll(".tiles-black .kb-tile")
const tiles = document.querySelectorAll(".kb-tiles .kb-tile")

let y = 0, x = -30, z = 0, minZ = -200, maxZ = 1400
let firstRunX = 0, firstRunY = 0
let isHolding = false, firstRun = true
let maxRotation = 180
let mousex, mousey
let speedX, speedY
let keymappingOn = false
let wireframeView = false
let qwertyMode =  false

// window.onload = () => {
// 	let spawnTl = new TimelineMax()
// 	spawnTl.from(wrap, 0.7, {ease:Power4.easeOut, z:-500, z:300,  y:300, rotationY : -50,  rotationX : 0 })
// 	spawnTl.play()
// }


// SET UP

// on va chercher la largeur d'une touche. Soit la largeur de la face avant de n'importe quelle touche
// toujours dans le process de n'avoir qu'une seule source de vérité (soit les variables scss)
const whiteTileWidth = parseInt(getComputedStyle(whiteTiles[0].children[5]).getPropertyValue("width"))
const blackTileWidth = parseInt(getComputedStyle(blackTiles[0].children[5]).getPropertyValue("width"))
const spacing = 2

// tweenmax pour pouvoir set une transform sans écraser les anciennes
let c = 0
whiteTiles.forEach((tile, index) => {
    // offsetting each tile
    tile.setAttribute("offset", index * (whiteTileWidth + spacing))
    TweenMax.set(tile, {x:index * (whiteTileWidth + spacing)})
    // setting up black tiles
    if (tile.hasAttribute("black-key")) {
         // https://images-na.ssl-images-amazon.com/images/I/51BT0jwqW0L._AC_SL1001_.jpg
         // si on regarde bien les noirs on peut voir qu'elles ont pas toujours la meme position en fonction de leur note.
         // pour ré, la noir est presque entierement sur la note, pour mi elle est au milieu et pour fa c'est l'inverse de ré
         // je distingue donc left / middle / right
        
        if (tile.hasAttribute("black-keyL")) TweenMax.set(blackTiles[c], {x:((tile.getAttribute("offset")-(blackTileWidth / 2)-spacing) + (-blackTileWidth / 5) )})   
        if (tile.hasAttribute("black-keyM")) TweenMax.set(blackTiles[c], {x:(tile.getAttribute("offset")-(blackTileWidth / 2)-spacing)})  
        if (tile.hasAttribute("black-keyR")) TweenMax.set(blackTiles[c], {x:(tile.getAttribute("offset")-(blackTileWidth / 2)-spacing) + (blackTileWidth / 5)})  

        c++
    }
})

// https://cdn.discordapp.com/attachments/545905273471107081/637958663767588894/piano-notes.png
// est-ce que j'ai gagné du temps à ecrire un algo qui place les notes en js plutot que de le faire a la main ? bah non
const notes = "fgabcde".toUpperCase() // do ré mi fa sol la si
const startOctave = 2
whiteTiles.forEach((tile, index) => {
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



// DEPLACEMENT DU PIANO

function mouseDownHandler(event) {
	// on détecte que la souris est enfoncé et stocke les positions initiales du curseur
	// clic gauche ou roue
	if (event.button == 0 || event.button == 1) {
		isHolding = true
		mousex = event.x
		mousey = event.y
		firstRunY = y
		firstRunX = x
	}
}

function mouseMoveHandler(event) {
	if (isHolding) {
		// lorsque la souris est enfoncé, on va ajouter / soustraire aux X/Y actuelles la différence entre la position initiale de la souris et sa position actuelle
		// axe inversé entre ceux de css 3d et ceux de la souris
		// l'axe rotationX va correspondre à l'axe Y de la souris et vice versa
		firstRunY = y - ((mousex - event.x) / 7)
		firstRunX = x + ((mousey - event.y) / 5)
		// on applique ensuite ces valeurs.
		TweenMax.to(wrap, 0.1, {
			rotationX: firstRunX,
			rotationY: firstRunY
		})
	}
	speedX = event.movementX
	speedY = event.movementY
}

function mouseUpHandler() {
	// lorsque l'utilisateur relache le clic, on actualise nos valeurs x/y et reset nos valeurs temporaires.
	x = firstRunX
	y = firstRunY
	firstRunY = 0
	firstRunX = 0
	isHolding = false
}

document.querySelector(".cont:not(.ui)").addEventListener('mousedown', mouseDownHandler)
document.querySelector(".cont:not(.ui)").addEventListener('touchstart', mouseDownHandler)


document.addEventListener('mousemove', mouseMoveHandler)
document.addEventListener('touchmove', mouseMoveHandler)

document.addEventListener('mouseup', mouseUpHandler)
document.addEventListener('touchend', mouseUpHandler)


document.addEventListener('wheel', event => {
    if (z>=minZ && z<maxZ) {
        z+=event.deltaY
    } else if (z>=maxZ) {
        if (event.deltaY < 0) z += event.deltaY
    } else {
        if (event.deltaY > 0) z += event.deltaY
    }
    TweenMax.to(wrap, 0.3, {z : -z})
})

document.addEventListener('keydown', (e) => {
    if (e.code == "ArrowDown") x+=5
    if (e.code == "ArrowUp") x -= 5
    if (e.code == "ArrowLeft") y += 5
    if (e.code == "ArrowRight") y -= 5
    TweenMax.to(wrap, 0.1,  {rotationX : x, rotationY : y })
})



// UI INTERACTION


document.querySelector(".top-view-btn").addEventListener('click', () => {
    x=-80, y=0
    TweenMax.to(wrap, 0.6, {rotationX : x, rotationY : y})
})
document.querySelector(".reset-view-btn").addEventListener('click', () => {
    x=-30, y=0
    TweenMax.to(wrap, 0.6, {rotationX : x, rotationY : y})
})

let wireframeTl = new TimelineMax({paused:true})
wireframeTl.staggerTo(".kb", 0.3, {backgroundColor : "none", border:"1px solid black", stagger:0.01})

document.querySelector(".wireframe-mode-btn").addEventListener('click', () => {
	wireframeView = !wireframeView
	wireframeView ? wireframeTl.play() : wireframeTl.reverse()
	document.querySelector(".wireframe-mode-btn").innerText = wireframeView ? "STANDARD VIEW" : "WIREFRAME VIEW"
})

document.querySelector(".build-mode-btn").addEventListener('click', () => {
	let buildTl = new TimelineMax({paused:true})
	buildTl.staggerFrom(".kb", 0.3, {transform : "none", stagger:0.02})
	buildTl.restart()
})
document.querySelector(".keymap-mode-btn").addEventListener('click', () => {
	keymappingOn = !keymappingOn
	keymapping(keymappingOn)
	document.querySelector(".keymap-mode-btn").innerText = keymappingOn ? "HIDE KEY MAPPING" : "SHOW KEY MAPPING"
})

document.querySelector(".qwerty-mode-btn").addEventListener('click', () => {
	qwertyMode = !qwertyMode
	if (qwertyMode) {
		chars = "qwertyuiopasdfghjkl;z"
		charsBlack = "qwetyiopsdghjl;"
	} else {
		chars = 'azertyuiopqsdfghjklmw'
		charsBlack = 'azetyiopsdghjlm'.toUpperCase()
	}
	document.querySelector(".qwerty-mode-btn").innerText = qwertyMode ? "AZERTY MODE" : "QWERTY MODE"
})

let chars = 'azertyuiopqsdfghjklmw'
let charsBlack = 'azetyiopsdghjlm'.toUpperCase()

function keymapping(set = true) {
	if (set) {
		whiteTiles.forEach((tile, index) => {
			// children[2] = face du dessus
			tile.children[2].innerText = chars[index]
		})
		blackTiles.forEach((tile, index) => {
			// children[2] = face du dessus
			tile.children[2].innerText = charsBlack[index]
		})
	} else {
		tiles.forEach(tile => {
			tile.children[2].innerText = ""
		})
	}
}






// TOUCHES DU PIANO ET SON



let tileTl
let activeKeyTimelines = []
function keyPress(tile){
	let createNewTl = true
	activeKeyTimelines.forEach( tl => {
		if (tl.tile === tile) createNewTl = false
	})
	if (createNewTl) {		
		audios.forEach( sound => {
			if (sound.tile === tile) {
				sound.audio.currentTime = 0
				sound.audio.play()
			}
		})
		tileTl = new TimelineMax()
		tileTl.onComplete = tileTl.destroy
		tileTl.fromTo(tile, 0.10, {rotationX : "0deg", y:0},  {rotationX : "-6deg", y: "6px"})
		tileTl.play()
		let tempObj = {
			tile : tile, 
			timeline : tileTl
		}
		activeKeyTimelines.push(tempObj)
	}
}

// clicking on tile
tiles.forEach( tile => {
    // click animation
    tile.addEventListener('mousedown', () => {
		keyPress(tile)
	})
	tile.addEventListener('touchstart', () => {
		keyPress(tile)
	})
	// releasing the tile
	let keyPressUpHandler = () => {
		//stop sound
		audios.forEach(sound => {
			if (sound.tile === tile) {
				sound.audio.pause()
				sound.audio.currentTime = 0
			}
		})
		// for each timeline
		activeKeyTimelines.forEach((tl, index) => {
			// if there's a timeline for the tile
			if (tl.tile === tile) {
				// reverse it
				tl.timeline.reverse()
				// and remove the timeline
				activeKeyTimelines.splice(index, 1)
			}
		})
	}
	tile.addEventListener('mouseup', keyPressUpHandler)
	tile.addEventListener('touchend', keyPressUpHandler)
	// or not hovering it anymore with the mouse
	let keyPressOutHandler = () => {
		//stop sound
		audios.forEach(sound => {
			if (sound.tile === tile) {
				sound.audio.pause()
				sound.audio.currentTime = 0
			}
		})
		// for each timeline
		activeKeyTimelines.forEach((tl, index) => {
			// if there's a timeline for the tile
			if (tl.tile === tile) {
				// reverse it
				tl.timeline.reverse()
				// and remove the timeline
				activeKeyTimelines.splice(index, 1)
			}
		})
	}
	tile.addEventListener('mouseout', keyPressOutHandler)
	tile.addEventListener('touchcancel', keyPressOutHandler)
})



// pressing keyboard key
document.addEventListener('keydown', e => {
	if (chars.indexOf(e.key) !== -1 ) {
		keyPress(whiteTiles[chars.indexOf(e.key)])
		// TODO : play sound
	}
	if (charsBlack.indexOf(e.key) !== -1) {	
		keyPress(blackTiles[charsBlack.indexOf(e.key)])
		// TODO : play sound
	}
})

document.addEventListener('keyup', e => {

	if (chars.indexOf(e.key) !== -1) {
		audios.forEach(sound => {
			if (sound.tile === whiteTiles[chars.indexOf(e.key)]) {
				sound.audio.pause()
				sound.audio.currentTime = 0
			}
		})
		activeKeyTimelines.forEach((tl, index) => {
			// if there's a timeline for the tile
			if (tl.tile === whiteTiles[chars.indexOf(e.key)]) {
				// reverse it
				tl.timeline.reverse()
				// and remove the timeline
				activeKeyTimelines.splice(index, 1)
			}
		})
	}
		
	if (charsBlack.indexOf(e.key) !== -1) {
		audios.forEach(sound => {
			if (sound.tile === blackTiles[charsBlack.indexOf(e.key)]) {
				sound.audio.pause()
				sound.audio.currentTime = 0
			}
		})
		activeKeyTimelines.forEach((tl, index) => {
			// if there's a timeline for the tile
			if (tl.tile === blackTiles[charsBlack.indexOf(e.key)]) {
				// reverse it
				tl.timeline.reverse()
				// and remove the timeline
				activeKeyTimelines.splice(index, 1)
			}
		})
	}
})




// SOUND


let audios = []
tiles.forEach( tile => {
	let audio = {
		audio : new Audio(`sounds/mp3/Piano.mf.${tile.getAttribute("note")}.mp3`),
		tile : tile
	} 
	audio.ready = audio.readyState
	audios.push(audio)
})
