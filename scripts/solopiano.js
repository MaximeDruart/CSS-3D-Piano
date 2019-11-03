const piano = new Piano(".kb-anim-wrapper", ".cont:not(.ui)")
TweenMax.set(piano.ui, {display:"block"})
piano.movementEnabled = true
piano.init()
const ui = new UserInterface(piano)