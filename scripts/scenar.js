// TODO :
// - Clean transitions between levels (especially going backwards, which will require a lot of work for it to be clean as there are a lot of callbacks and tls to manage) -> first run system? 
// - Design
// -Maintain a tutorial timelines array


class Scenario {
    constructor() {
        this.continueButton = document.querySelector(".continue-btn")
        this.tutorialInterface = document.querySelector(".tutorialInterface")
        this.pageBeforeButton = document.querySelector(".nav .before")
        this.pageNextButton = document.querySelector(".nav .next")
        this.title = document.querySelector(".title")
        this.goToTutorial = false
        this.introTl
        this.introTl2
        this.continueToTutorialTl
        this.tutorial1Tl
        this.tutorial2Tl
        this.tutorialTimelines = []
        this.leftItems = []
        this.leftItemActive = this.leftItems[this.activeLevel-1]
        this.cube
        this.titles = [
            "UNDERSTANDING AXES", 
            "TITLE 2",
            "TITLE 3"
        ]
        this.descriptions = [
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            "DESCRIPTION 2",
            "DESCRIPTION 3",
        ]
        this.readMore = [
            "",
            "",
            "",
        ]
        this.titleActive = 0
        this.descriptionsActive = 0
        this.activeLevel = 1
        this.slideValueMin = 0
        this.slideValueMax = 8000 // idk
        this.slideValue =
        // could work for going backwards, playing only the timeline and avoiding callbacks.
        this.tutorialFunctionsWIP = [
            {
                function: this.tutorial1,
                firstRun: true,
                timeline : this.tutorial1Tl
            },
            {
                function: this.tutorial2,
                firstRun: true,
                timeline : this.tutorial2Tl  
            },
            {
                function: this.tutorial3,
                firstRun: true,
                timeline : this.tutorial3Tl
            },
            {
                function: this.tutorial4,
                firstRun: true,
                timeline : this.tutorial4Tl
            },
            {
                function: this.tutorial5,
                firstRun: true,
                timeline : this.tutorial5Tl
            },
            {
                function: this.tutorial6,
                firstRun: true,
                timeline : this.tutorial6Tl
            }, 
        ]
        this.tutorialFunctions = [
            this.tutorial1, this.tutorial2, this.tutorial3, this.tutorial4, this.tutorial5, this.tutorial6,
        ]
        this.totalLevels = this.tutorialFunctions.length
        
        // binding issue for some reason
        this.tutorialFunctionsBound = []
        this.tutorialFunctions.forEach(fn => {
            this.tutorialFunctionsBound.push(fn.bind(this)) 
        });
        this.tutorialFunctions = this.tutorialFunctionsBound

        this.continueButton.addEventListener('click', () => {
            !this.goToTutorial ? this.introAnim2() : this.continueToTutorial()
        })


        document.querySelector(".last").addEventListener('click', () => {this.beforeLevelHandler()} )
        document.querySelector(".next").addEventListener('click', () => {this.nextLevelHandler()} )

        // this.range = new Powerange(document.querySelector(".slide")) doesn't work for some reasons.
    }

    updateSlideValue() { 
        let minDOM = document.querySelector(".start-value")
        let actualDOM = document.querySelector(".actual-value")
        let actualDOMText = document.querySelector(".actual-value span")
        let maxDOM = document.querySelector(".end-value")

    }

    beforeLevelHandler() {
        if (this.activeLevel > 1) {
            this.pageUpOrDown(false)
            this.tutorialFunctions[this.activeLevel-1]()
        } else {console.log("this is the first page")}
    }

    nextLevelHandler() {
        if (this.activeLevel < this.totalLevels) {            
            this.pageUpOrDown()
            this.tutorialFunctions[this.activeLevel-1]()
        } else {console.log("this is the last page")}
    }

    pageUpOrDown(next = true){
        if (next) {
            this.titleActive++
            this.descriptionsActive++
            this.activeLevel++
        } else {
            this.titleActive--
            this.descriptionsActive--
            this.activeLevel--
        }
        this.updateContent()
    }

    updateContent() {
        document.querySelector(".right .right-title-content").innerText = this.titles[this.titleActive]
        document.querySelector(".right .right-description p").innerText = this.descriptions[this.descriptionsActive]
        document.querySelector(".page-number-active").innerText = this.activeLevel + " : "
    }


    // anim when page is loaded. Piano is spinning but no interactions except x axis movements are available.
    introAnim(){
        TweenMax.set(piano.wrap, {z : - 350})
        TweenMax.from(".kb", 1, {opacity : 0})
        piano.selfRotate(0 , 360 , 0 , 5)
    }

    // piano spins, zooms out and goes in wireframe mode. You can now interact fully with the piano.
    introAnim2(){
        piano.selfRotationTl.pause()
        piano.movementEnabled = true
        this.goToTutorial = true
        this.introTl2 = new TimelineMax({paused:true, onComplete:ui.wireframeTl.play()})
        this.introTl2.to(piano.wrap, 0.9, {rotationX : -30, rotationY : 360})
        this.introTl2.set(piano.wrap, {rotationY : 0})
        this.introTl2.play()
    }

    // zooms in on piano til it disappears, new ui appears
    continueToTutorial() {
        this.updateContent()
        this.continueToTutorialTl = new TimelineMax({
            paused : true, 
            onComplete : () => { 
                this.cubeGen()
                this.tutorial1()
            }
        })
        this.continueToTutorialTl.to(piano.wrap, 1.2, {rotationX : -30, rotationY:0, z : 1200})
        this.continueToTutorialTl.to(".kb", 0.8, {opacity : 0.1}, "-=0.8")
        this.continueToTutorialTl.set(this.title, {display : "none"})
        this.continueToTutorialTl.set(this.tutorialInterface, {display : "flex"})
        this.continueToTutorialTl.set(piano.wrap, {display:"none"})
        // TODO : tutorial ui appearing anim, title disappearing anim
        this.continueToTutorialTl.play()
    }
    
    cubeGen(){
        piano.movementEnabled = false, piano.movementEnabledX = false
        this.cube = new CSS3DItem(".cube-wrap", ".left")
        this.cube.movementEnabled = false, this.cube.movementEnabledX = false
    }

    // cube appears
    tutorial1() {
        this.tutorial1Tl = new TimelineMax({paused : true})
        this.tutorial1Tl.addLabel("sync")
        this.tutorial1Tl.from(this.cube.wrap.children, 0.8, {opacity : 0}, "sync")
        this.tutorial1Tl.from(this.cube.wrap, 0.8, {z:-200}, "sync")
        this.tutorial1Tl.to(this.cube.wrap.children, 0.8, {border:"1px solid rgba(0, 0, 0, 0.23)", innerText : ""}, "sync")
        this.cube.selfRotate(360 , 360 , 0 , 8)
        this.leftItemActive = this.cube
        this.tutorial1Tl.play()
    }

    tutorial2() {
        this.tutorial2Tl = new TimelineMax({
            paused:true,
            onStart : () => {this.cube.selfRotationTl.pause()}
        })
        this.tutorial2Tl.addLabel("sync1")
        this.tutorial2Tl.addLabel("sync2")
        this.tutorial2Tl.addLabel("sync3")
        this.tutorial2Tl.to(this.cube.wrap, 0.6, {rotationX : 0, rotationY : 0}, "sync1")
        this.tutorial2Tl.to(this.cube.wrap.children, 0.6, {borderWidth:0, borderColor:"rgba(0, 0, 0, 1)"}, "sync1")
        this.tutorial2Tl.to(this.cube.wrap.children[1], 0.6, {borderLeftWidth:1}, "sync2")
        this.tutorial2Tl.to(this.cube.wrap.children[3], 0.6, {borderLeftWidth:1, borderBottomWidth:1}, "sync2")
        this.tutorial2Tl.to(this.cube.wrap.children[5], 0.6, {borderLeftWidth:1, borderTopWidth:1}, "sync2")
        this.tutorial2Tl.to(this.cube.wrap.children[1], 0.3, {innerText : "Z AXIS", textAlign:"center"}, "sync3")
        this.tutorial2Tl.to(this.cube.wrap.children[3], 0.3, {innerText : "Y AXIS", textAlign:"center"}, "sync3")
        this.tutorial2Tl.to(this.cube.wrap.children[5], 0.3, {innerText : "X AXIS", textAlign:"center"}, "sync3")

        this.tutorial2Tl.play()
    }

    // cube decomposition
    tutorial3() {
        this.cube.selfRotationTl.pause()
        this.tutorial3Tl = new TimelineMax({paused : true})
        this.tutorial3Tl.to(this.cube.wrap, 0.8, {rotationX : 5, rotationY : 20})
        this.tutorial3Tl.staggerTo(this.cube.wrap.children, 1, {rotationX : 0, rotationY : 0, backgroundColor: "rgba(200, 200, 200, 0.4)", stagger : 0.8 })
        this.tutorial3Tl.staggerTo(this.cube.wrap.children, 1, {transform : "none", stagger : 0.8 })
        this.tutorial3Tl.to(this.cube.wrap, 0.3, {rotationX :0, rotationY : 0, scale : 0.5})
        this.tutorial3Tl.play()
        console.log("this is level 3")


    }
    
    tutorial4() {
        console.log("this is level 4")
        
    }

    tutorial5() {
        console.log("this is level 5")
        
    }

    tutorial6() {
        console.log("this is level 6")

    }

    fun1(){
        this.cube.selfRotationTl.pause()
        this.funTl = new TimelineMax({paused : true, onComplete : () => {this.cube.selfRotationTl.resume()} })
        this.funTl.addLabel('sync')
        this.funTl.to(this.cube.wrap, 2, { ease: RoughEase.ease.config({ template:  Power0.easeNone, strength: 2, points: 200, taper: "none", randomize: true, clamp:  false}), y: -20, x:-20, y:-10 })
        this.funTl.to(this.cube.wrap, 1.2, { ease : Elastic.easeOut.config(1.4, 0.5), x:0, y:0, z:250})
        this.funTl.play()
        this.cube.z = 200
    }
}

const piano = new Piano(".kb-anim-wrapper", ".cont:not(.ui)")
piano.init()
const ui = new UserInterface(piano)
const scenar = new Scenario()
scenar.introAnim()
