let wrap = document.querySelector(".kb-anim-wrapper")
let y = 0, x = -30, z = 0, minZ = -200, maxZ = 1400
let firstRunX = 0, firstRunY = 0
let isHolding = false, firstRun = true
let maxRotation = 180
let mousex, mousey
let speedX, speedY


document.addEventListener('mousedown', event => {
    // on détecte que la souris est enfoncé et stocke les positions initiales du curseur
    if (event.button == 0) {        
        isHolding = true
        mousex = event.x
        mousey = event.y
    }
})

document.addEventListener('mousemove', event => {
    if (isHolding) {
        // lorsque la souris est enfoncé, on va ajouter / soustraire aux X/Y actuelles la différence entre la position initiale de la souris et sa position actuelle
        // axe inversé entre ceux de css 3d et ceux de la souris
        // l'axe rotationX va correspondre à l'axe Y de la souris et vice versa
        firstRunY = y - (mousex - event.x) / 7
        firstRunX = x + (mousey - event.y) / 5
        // on applique ensuite ces valeurs.
        TweenMax.to(wrap, 0.1,  {rotationX : firstRunX, rotationY : firstRunY })
    }
    speedX = event.movementX
    speedY = event.movementY
})

document.addEventListener('mouseup', event => {
    // lorsque l'utilisateur relache le clic, on actualise nos valeurs x/y et reset nos valeurs temporaires.
    x = firstRunX
    y = firstRunY
    firstRunY = 0
    firstRunX = 0
    isHolding = false
})

function inertia(x, y){
    
}


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


document.querySelector(".top-view-btn").addEventListener('click', () => {
    x=-80, y=0
    TweenMax.to(wrap, 0.6, {rotationX : x, rotationY : y})
})
document.querySelector(".reset-view-btn").addEventListener('click', () => {
    x=-30, y=0
    TweenMax.to(wrap, 0.6, {rotationX : x, rotationY : y})
})

document.addEventListener('keydown', (e) => {
    if (e.code == "ArrowDown") x+=5
    if (e.code == "ArrowUp") x -= 5
    if (e.code == "ArrowLeft") y += 5
    if (e.code == "ArrowRight") y -= 5
    TweenMax.to(wrap, 0.1,  {rotationX : x, rotationY : y })
    // wrap.style.transform = `rotateY(${y}deg) rotateX(${x}deg)`
})


// let els = document.querySelectorAll(".kb")
// let tl = new TimelineMax()
// tl.staggerFrom(".kb", 0.6, {transform : "none"}, 0.1)


let whiteTiles = document.querySelectorAll(".tiles-white .kb-tile")
let blackTiles = document.querySelectorAll(".tiles-black .kb-tile")
let tiles = document.querySelectorAll(".kb-tiles .kb-tile")


// on va chercher la largeur d'une touche. Soit la largeur de la face avant de n'importe quelle touche
// toujours dans le process de n'avoir qu'une seule source de vérité (soit les variables scss)
let whiteTileWidth = parseInt(getComputedStyle(whiteTiles[0].children[5]).getPropertyValue("width"))
let blackTileWidth = parseInt(getComputedStyle(blackTiles[0].children[5]).getPropertyValue("width"))
let spacing = 2

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

let tileTl
tiles.forEach((tile, index) => {
    // click animation
    tile.addEventListener('click', () => {
        tileTl = new TimelineMax({yoyo : true, repeat : 1})
        tileTl.onComplete = tileTl.destroy
        tileTl.to(tile, 0.5, {transformOrigin : "top left", rotationX : -20})
        tileTl.restart()
    })
})






// let elements = document.querySelectorAll("elements")
// elements.forEach( element => {
//     element.addEventListener('event', () => {
//         element.classList.remove("hidden")
//     })
// })