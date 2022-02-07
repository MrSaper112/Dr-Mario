"strict mode";
function init() {
    onLoad()
    blockManager.init(4)
    virusMovementManager.init()
    timerStart();
}
window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
     pointManager.init()
    blockManager.nextColor.next()
    blockManager.nextColor.appendPreview()
});
var mainPlane = document.getElementById("plane")
var count = 0
var backgroundPillManager = {
    allPill: {
        blue: {
            path: "img/blue/bl_",
            array: ["dot.jpg", "down.jpg", "left.jpg", "o.jpg", "right.jpg", "up.jpg", "x.jpg"]
        },
        yellow: {
            path: "img/yellow/yl_",
            array: ["dot.jpg", "down.jpg", "left.jpg", "o.jpg", "right.jpg", "up.jpg", "x.jpg"]
        },
        brown: {
            path: "img/brown/br_",
            array: ["dot.jpg", "down.jpg", "left.jpg", "o.jpg", "right.jpg", "up.jpg", "x.jpg"]
        },
        virus: {
            path: "img/covid_",
        }
    },
    getUrl: function (color, side) {
        if (color == 'virus') {
            return this.allPill[color].path + side + ".png"
        } else {
            return this.allPill[color].path + side + ".jpg"
        }
    }
}
var blockManager = {
    init: function (number) {
        this.createBox();
        this.updateToPlane()
        this.generateWirus(number)
    },
    actualBlock: {
        sideNumber: 0,
        id: null,
        onPlane: null,
        block1: { x: null, y: null, color: null, div: null, backgroundUrl: null },
        block2: { x: null, y: null, color: null, div: null, backgroundUrl: null }
    },
    gameEnd: { end: false, stageComplete: false },
    connected: null,
    virusLeftCount: null,
    nextColor: {
        id: null,
        block1: { color: null, div: null, backgroundUrl: null },
        block2: { color: null, div: null, backgroundUrl: null },
        next: function () {
            var random = blockManager.getRandom()
            this.block1.color = random.c1
            this.block2.color = random.c2
            this.block1.backgroundUrl = backgroundPillManager.getUrl(random.c1, "left")
            this.block2.backgroundUrl = backgroundPillManager.getUrl(random.c2, "right")
            this.id = random.id
        },
        appendPreview: function () {
            var preview = document.getElementById("preview")
            var div1 = blockManager.createDiv(this.block1.backgroundUrl)
            var div2 = blockManager.createDiv(this.block2.backgroundUrl)
            preview.querySelectorAll("div").forEach((item) => { item.remove() })
            preview.append(div1)
            preview.append(div2)
        }
    },
    allBlocks: {
        block_1: {
            name: "blue-blue", c1: "blue", c2: "blue", id: 0
        },
        block_2: {
            name: "yellow-yellow", c1: "yellow", c2: "yellow", id: 1
        },
        block_3: {
            name: "brown-brown", c1: "brown", c2: "brown", id: 2
        },
        block_4: {
            name: "blue-yellow", c1: "blue", c2: "yellow", id: 3
        },
        block_5: {
            name: "yellow-brown", c1: "yellow", c2: "brown", id: 4
        },
        block_6: {
            name: "brown-blue", c1: "brown", c2: "blue", id: 5
        },
    },
    createDiv: function (color) {
        var div = document.createElement("div")
        var colorDiv = color.split("/")
        div.setAttribute("style", "width:32px;height:32px;background-color:" + colorDiv[1] + ";background-image: url(" + color + ");")
        div.classList += "connected:" + count
        return div
    },
    createBox: function () {
        count++
        var div1 = this.createDiv(this.nextColor.block1.backgroundUrl)
        var div2 = this.createDiv(this.nextColor.block2.backgroundUrl)

        this.actualBlock.sideNumber = 0
        this.actualBlock.id = this.nextColor.id
        this.actualBlock.block1 = { x: 4, y: 1, color: this.nextColor.block1.color, div: div1, backgroundUrl: this.nextColor.block1.backgroundUrl }
        this.actualBlock.block2 = { x: 5, y: 1, color: this.nextColor.block2.color, div: div2, backgroundUrl: this.nextColor.block2.backgroundUrl }
        blockManager.nextColor.next()
        blockManager.nextColor.appendPreview()
    },
    updateToPlane: function () {
        if (this.colisonCheck(this.actualBlock.block1.x, this.actualBlock.block1.y) && this.colisonCheck(this.actualBlock.block2.x, this.actualBlock.block2.y)) {
            document.getElementsByClassName(this.actualBlock.block1.x + "/" + this.actualBlock.block1.y)[0].appendChild(this.actualBlock.block1.div)
            document.getElementsByClassName(this.actualBlock.block2.x + "/" + this.actualBlock.block2.y)[0].appendChild(this.actualBlock.block2.div)
        } else {
            this.gameEnd.end = true
        }
    },
    removeChildFromDiv: function () {
        try {
            document.getElementsByClassName(this.actualBlock.block1.x + "/" + this.actualBlock.block1.y)[0].children[0].remove()
            document.getElementsByClassName(this.actualBlock.block2.x + "/" + this.actualBlock.block2.y)[0].children[0].remove()
        } catch (error) {
            console.log(error)
        }
    },
    getHighestY: function () {
        if (this.actualBlock.block1.y < this.actualBlock.block2.y) return this.actualBlock.block2.y
        else if (this.actualBlock.block1.y == this.actualBlock.block2.y) return [this.actualBlock.block1.y, this.actualBlock.block2.y]
        else return this.actualBlock.block1.y
    },
    getSmallestX: function () {
        if (this.actualBlock.block1.x < this.actualBlock.block2.x) return this.actualBlock.block1.x
        else if (this.actualBlock.block1.x == this.actualBlock.block2.x) return [this.actualBlock.block1.x, this.actualBlock.block2.x]
        else return this.actualBlock.block2.x
    },
    getInformationToRotation: function () {
        var getHighestY = this.getHighestY()
        var smallestX = this.getSmallestX()
        if (Array.isArray(getHighestY)) { //Y sa te same
            return [smallestX, getHighestY[0]] //NajmniejszyX oraz najmniejszyY
        }
        if (Array.isArray(smallestX)) { //X sa te same
            return [smallestX[0], getHighestY] //NajmniejszyX oraz najmniejszyY
        }
    },
    colisonCheck: function (x, y) {
        if (document.getElementsByClassName(x + "/" + y)[0] !== undefined) {
            return (document.getElementsByClassName(x + "/" + y)[0].childElementCount == 0)
        }
        return false
    },
    updateXByKeyboard: function (variable) {
        if (((this.actualBlock.block1.x + variable) >= 1 && (this.actualBlock.block1.x + variable) <= 8) && ((this.actualBlock.block1.x + variable) >= 1 && (this.actualBlock.block2.x + variable) <= 8)) {
            var getHighestY = this.getHighestY()
            var smallestX = this.getSmallestX()
            if (Array.isArray(getHighestY) && (variable < 0 && this.colisonCheck(smallestX - 1, getHighestY[0]))) {
                update()
            }
            if (Array.isArray(getHighestY) && (variable > 0 && this.colisonCheck(smallestX + 2, getHighestY[0]))) {
                update()
            }

            if (Array.isArray(smallestX) &&
                (variable < 0 && this.colisonCheck(smallestX[0] - 1, this.actualBlock.block1.y)) &&
                (variable < 0 && this.colisonCheck(smallestX[0] - 1, this.actualBlock.block2.y))) {
                update()
            } else if (Array.isArray(smallestX) &&
                (variable > 0 && this.colisonCheck(smallestX[0] + 1, this.actualBlock.block1.y)) &&
                (variable > 0 && this.colisonCheck(smallestX[0] + 1, this.actualBlock.block2.y))) {
                update()
            }

        } else console.log("Poza zasiegiem")
        function update() {
            blockManager.removeChildFromDiv()
            blockManager.actualBlock.block1.x = blockManager.actualBlock.block1.x + variable

            blockManager.actualBlock.block2.x = blockManager.actualBlock.block2.x + variable
            blockManager.updateToPlane()
        }
    },
    updateY: function () {
        var getHighestY = this.getHighestY()
        var getSmallestX = this.getSmallestX()
        if (((this.actualBlock.block1.y >= 1) && (this.actualBlock.block1.y <= 15)) && ((this.actualBlock.block1.y >= 1) && (this.actualBlock.block2.y <= 15))) {
            if (Array.isArray(getHighestY) && this.colisonCheck(this.actualBlock.block1.x, (getHighestY[0] + 1)) && this.colisonCheck(this.actualBlock.block2.x, (getHighestY[0] + 1))) {
                update()
            } else if (!Array.isArray(getHighestY) && this.colisonCheck(getSmallestX[0], (getHighestY + 1))) {
                update()
            } else {
                this.actualBlock.block1.x = 0
                this.actualBlock.block1.y = 0
                this.actualBlock.block2.x = 0
                this.actualBlock.block2.y = 0
                this.checkPlaneForPoints()
                setTimeout(() => {
                    blockManager.createBox();
                    blockManager.updateToPlane()
                }, 700)
            }
            function update() {
                blockManager.removeChildFromDiv()
                blockManager.actualBlock.block1.y = blockManager.actualBlock.block1.y + 1
                blockManager.actualBlock.block2.y = blockManager.actualBlock.block2.y + 1
                blockManager.updateToPlane()
            }
        } else if ((this.actualBlock.block1.y == 16) || (this.actualBlock.block2.y == 16)) {
            this.actualBlock.block1.x = 0
            this.actualBlock.block1.y = 0
            this.actualBlock.block2.x = 0
            this.actualBlock.block2.y = 0
            this.checkPlaneForPoints()
            setTimeout(() => {
                blockManager.createBox();
                blockManager.updateToPlane()
            }, 700)
        } else console.log("Poza zasiegiem")
    },
    findIdFromList: function (id) {
        for (var key in blockManager.allBlocks) {
            if (!blockManager.allBlocks.hasOwnProperty(key)) continue;
            var obj = blockManager.allBlocks[key];
            if (obj.id == id) {
                return obj
            }
        }
    },
    rotateBlockInAnyDirection: function (number) {
        var bestElement = this.getInformationToRotation()
        var blockFromList = this.findIdFromList(this.actualBlock.id)

        var tested = this.actualBlock.sideNumber + number
        if (tested < 0) {
            tested = 3
        }
        switch (tested % 4) {
            case 0:
                if (this.colisonCheck(bestElement[0] + 1, bestElement[1])) {
                    blockUpdate(bestElement[0], bestElement[0] + 1, bestElement[1], bestElement[1], blockFromList.c1, blockFromList.c2, "left", "right")
                } else if (this.colisonCheck(bestElement[0] - 1, bestElement[1])) {
                    blockUpdate(bestElement[0], bestElement[0] - 1, bestElement[1], bestElement[1], blockFromList.c1, blockFromList.c2, "right", "left")
                }
                break;
            case 1:

                if (this.colisonCheck(bestElement[0], bestElement[1] - 1)) {
                    blockUpdate(bestElement[0], bestElement[0], bestElement[1], bestElement[1] - 1, blockFromList.c1, blockFromList.c2, "down", "up")
                } else if (this.colisonCheck(bestElement[0], bestElement[1] + 1)) {
                    blockUpdate(bestElement[0], bestElement[0], bestElement[1], bestElement[1] + 1, blockFromList.c1, blockFromList.c2, "up", "down")
                }
                break;
            case 2:
                if (this.colisonCheck(bestElement[0] + 1, bestElement[1])) {
                    blockUpdate(bestElement[0], bestElement[0] + 1, bestElement[1], bestElement[1], blockFromList.c2, blockFromList.c1, "left", "right")
                } else if (this.colisonCheck(bestElement[0] - 1, bestElement[1])) {
                    blockUpdate(bestElement[0], bestElement[0] - 1, bestElement[1], bestElement[1], blockFromList.c2, blockFromList.c1, "right", "left")
                }
                break;
            case 3:
                if (this.colisonCheck(bestElement[0], bestElement[1] - 1)) {
                    blockUpdate(bestElement[0], bestElement[0], bestElement[1], bestElement[1] - 1, blockFromList.c2, blockFromList.c1, "down", "up")
                } else if (this.colisonCheck(bestElement[0], bestElement[1] + 1)) {
                    blockUpdate(bestElement[0], bestElement[0], bestElement[1], bestElement[1] + 1, blockFromList.c2, blockFromList.c1, "up", "down")
                }
                break;
            default:
                console.log("error while rotate")
        }

        function blockUpdate(x, x2, y, y2, c, c2, img1, img2) {
            var img1K = backgroundPillManager.getUrl(c, img1)
            var img2K = backgroundPillManager.getUrl(c2, img2)
            var div1 = blockManager.createDiv(img1K)
            var div2 = blockManager.createDiv(img2K)
            blockManager.actualBlock.sideNumber += number
            if (blockManager.actualBlock.sideNumber < 0) {
                blockManager.actualBlock.sideNumber = 3
            }
            blockManager.removeChildFromDiv()
            blockManager.actualBlock.block1 = { x: x, y: y, color: c, div: div1, backgroundUrl: img1 }
            blockManager.actualBlock.block2 = { x: x2, y: y2, color: c2, div: div2, backgroundUrl: img2 }
            blockManager.updateToPlane()
        }
    },
    getRandom: function () {
        var block = blockManager.allBlocks["block_" + [Math.floor(Math.random() * Object.keys(blockManager.allBlocks).length) + 1]]
        return block
    },
    shoot: 0,
    tabOf: [],
    help: null,
    checkPlaneForPoints: function () {
        this.tabOf = []
        this.shoot = 0
        for (var y = 16; y != 1; y--) {
            for (var x = 8; x >= 1; x--) {
                var div = document.getElementsByClassName(x + "/" + y)[0]
                if (div.childElementCount != 0) {
                    var color = div.children[0].style.backgroundColor
                    try {
                        var workedArrayX = []
                        for (var i = x; i >= 1; i--) {
                            if (color == getColor(i, y)) {
                                if (!workedArrayX.includes(document.getElementsByClassName(i + "/" + y)[0].children[0])) {
                                    workedArrayX.push({ div: document.getElementsByClassName(i + "/" + y)[0].children[0], x: i, y: y })
                                }
                            } else {
                                break;
                            }
                        }
                        if (workedArrayX.length >= 4) {
                            this.shoot++
                            blockManager.help = workedArrayX[2]
                            workedArrayX.forEach(function (i) {
                                if (!(!lookSDAS(i) && blockManager.tabOf.length != 0)) {
                                    blockManager.tabOf.push(i)
                                }
                            })
                        }
                        var workedArrayY = []
                        for (var i = y; i >= 1; i--) {
                            if (color == getColor(x, i)) {
                                if (!workedArrayY.includes(document.getElementsByClassName(x + "/" + i)[0].children[0])) {
                                    workedArrayY.push({ div: document.getElementsByClassName(x + "/" + i)[0].children[0], x: x, y: i })
                                }
                            } else {
                                break;
                            }
                        }
                        if (workedArrayY.length >= 4) {
                            this.shoot++
                            blockManager.help = workedArrayY[2]
                            workedArrayY.forEach(function (i) {
                                if (!(!lookSDAS(i) && blockManager.tabOf.length != 0)) {
                                    blockManager.tabOf.push(i)
                                }
                            })
                        }

                        function lookSDAS(item) {
                            for (var x = 0; x < blockManager.tabOf.length; x++) {
                                if (item.div != blockManager.tabOf[x].div) {
                                    continue
                                }
                                return false
                            }
                            return true
                        }
                    } catch (error) { console.log(error) }
                }
            }
        }
        fallState = false
        this.tabOf.forEach((item) => {
            blockManager.lookForConnection(item.x, item.y, blockManager.changeToDisconnect)
        })
        this.tabOf.forEach((item) => {
            var split = item.div.style.backgroundImage.split("/")
            if (split.length > 2) {
                if (this.tabOf.length > 4) {
                    animate("x", item, split[1])
                } else {
                    animate("o", item, split[1])
                }
            } else {
                var e = split[1].split("_")
                var s = e[1].split(".")
                if (this.tabOf.length > 4) {
                    animate("x", item, s[0])
                } else {
                    animate("o", item, s[0])
                }
            }
        })
        setTimeout(() => {
            this.tabOf.forEach((item) => {
                removeElement(item.x, item.y)
            })
            this.fallEffect()
            if (this.shoot != 0) {
                setTimeout(() => { this.checkPlaneForPoints() }, 200)
            } else {
                setTimeout(() => {
                    fallState = true
                }, 300)
            }
            this.tabOf = []
        }, 300)

        function animate(stateOfImage, item, color) {
            var url = backgroundPillManager.getUrl(color, stateOfImage)
            item.div.setAttribute("style", "background-image:url(" + String(url) + ");width: 32px;height: 32px")
        }
        function removeElement(x, y) {
            var div = document.getElementsByClassName(x + "/" + y)[0]
            if (div.children[0].classList[0] == "wirus") {
                console.log("Zbitow Wirusa")
                blockManager.virusLeftCount--
                pointManager.addPoint(100)
            }
            document.getElementsByClassName(x + "/" + y)[0].children[0].remove()
        }
        function getColor(x, y) {
            var cout = document.getElementsByClassName(x + "/" + y)[0]
            if (cout.children[0] != null) {
                return document.getElementsByClassName(x + "/" + y)[0].children[0].style.backgroundColor
            }
        }
    },
    checkIfVirusDoesntExist: function () {
        if (blockManager.virusLeftCount == 0) {
            blockManager.gameEnd.end = true
            blockManager.gameEnd.stageComplete = true
        }
    },
    generateWirus: function (count) {
        this.virusLeftCount = count
        var dupa = 0
        for (var x = 0; x < count; x++) {
            var randomY
            var randomX
            do {
                randomY = Math.floor(Math.random() * (17 - 6) + 6)
                randomX = Math.floor(Math.random() * 8) + 1
            } while (document.getElementsByClassName(randomX + "/" + randomY)[0].childElementCount != 0)

            var div = document.getElementsByClassName(randomX + "/" + randomY)[0]
            if (dupa > 2) dupa = 0
            var rope = ["blue", "yellow", "brown"]

            var randomBlockColor = rope[dupa]
            dupa++
            var imageOfVirus = backgroundPillManager.getUrl("virus", randomBlockColor)
            var divToAppend = document.createElement("div")
            divToAppend.setAttribute("style", "width:32px;height:32px;background-color:" + randomBlockColor + ";" + "background-image: url(" + imageOfVirus + ");background-size: 32px;")
            divToAppend.classList += "wirus"

            div.appendChild(divToAppend)
        }
    },
    changeToDisconnect: function (x, y, workedDiv) {
        var secondDiv = document.getElementsByClassName(x + "/" + y)[0].children[0]
        var secondDivClassList = secondDiv.classList[0]
        var mainDivClassList = workedDiv.classList[0]
        if (mainDivClassList == secondDivClassList && secondDivClassList != "wirus" && mainDivClassList != "wirus") {
            var nImg1 = workedDiv.style.backgroundImage.split("_")
            var nImg2 = secondDiv.style.backgroundImage.split("_")
            secondDiv.style.backgroundImage = nImg2[0] + "_dot.jpg"
            secondDiv.className = "disconnect"
            workedDiv.className = "disconnect"
        }
    },
    getMaxYFall: function (y, x) {
        for (y2 = y + 1; y2 <= 16; y2++) {
            if (this.colisonCheck(x, y2)) {
                continue
            }
            return (y2 - 1)
        }
        return 16
    },
    getConnected: function (x, y, workedDiv) {
        var secondDiv = document.getElementsByClassName(x + "/" + y)[0].children[0]
        var secondDivClassList = secondDiv.classList[0]
        var mainDivClassList = workedDiv.classList[0]
        if (mainDivClassList == secondDivClassList) {
            blockManager.connected = document.getElementsByClassName(x + "/" + y)[0]
        }
    },
    lookForConnection: function (x, y, newFuncion) {
        var workedDiv = document.getElementsByClassName(x + "/" + y)[0].children[0]
        if (workedDiv != undefined) {
            if (x > 1 && !this.colisonCheck(x - 1, y)) {
                newFuncion(x - 1, y, workedDiv)
            }
            if (x < 8 && !this.colisonCheck(x + 1, y)) {
                newFuncion(x + 1, y, workedDiv)
            }
            if (y > 1 && !this.colisonCheck(x, y - 1)) {
                newFuncion(x, y - 1, workedDiv)
            }
            if (y < 16 && !this.colisonCheck(x, y + 1)) {
                newFuncion(x, y + 1, workedDiv)
            }
        }
    },
    fall: 0,
    allDivFall: { singleBlock: [], doubleBlock: [] },
    fallEffect: function () {
        for (let y = 15; y != 1; y--) {
            for (let x = 8; x >= 1; x--) {
                if (this.actualBlock.block1.x != x && this.actualBlock.block1.y != y || this.actualBlock.block2.x != x && this.actualBlock.block2.y != y) {
                    let div = document.getElementsByClassName(x + "/" + y)[0]
                    if (div.childElementCount != 0) {
                        var splitDiv = div.children[0].classList[0].split(":")
                        if (splitDiv[0] != "connected" && splitDiv[0] != "wirus" && splitDiv[0] != "animate") {
                            if (this.colisonCheck(x, y + 1) && !this.colisonCheck(x, y)) {
                                var boxToReplace = div.children[0];
                                div.removeChild(boxToReplace)
                                document.getElementsByClassName(x + "/" + this.getMaxYFall(y, x))[0].appendChild(boxToReplace)
                            }
                        } else if (splitDiv[0] == "connected" && splitDiv[0] != "wirus" && splitDiv[0] != "animate") {
                            if (this.colisonCheck(x, y + 1) && !this.colisonCheck(x, y)) {
                                this.lookForConnection(x, y, this.getConnected)
                                var firstPill = div.children[0]
                                var secondPill = this.connected.children[0]
                                var xyOfSecond = this.connected.classList[0].split("/")
                                if (xyOfSecond[0] == x) {
                                    var maxFallY = this.getMaxYFall(y, x)
                                    div.removeChild(firstPill)
                                    document.getElementsByClassName(this.connected.className)[0].removeChild(secondPill)

                                    document.getElementsByClassName(x + "/" + maxFallY)[0].appendChild(firstPill)
                                    document.getElementsByClassName(x + "/" + (maxFallY - 1))[0].appendChild(secondPill)
                                } else if (xyOfSecond[1] == y) {
                                    var maxFallYX = this.getMaxYFall(y, x)
                                    var maxFallYX2 = this.getMaxYFall(y, xyOfSecond[0])
                                    var maxFallY = 0
                                    if (maxFallYX > maxFallYX2) maxFallY = maxFallYX2
                                    if (maxFallYX < maxFallYX2) maxFallY = maxFallYX
                                    if (maxFallYX == maxFallYX2) maxFallY = maxFallYX
                                    div.removeChild(firstPill)
                                    document.getElementsByClassName(this.connected.className)[0].removeChild(secondPill)

                                    document.getElementsByClassName(x + "/" + maxFallY)[0].appendChild(firstPill)
                                    document.getElementsByClassName(xyOfSecond[0] + "/" + maxFallY)[0].appendChild(secondPill)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
const main = document.getElementById("virus")
var virusMovementManager = {
    r: 70,
    d: 0.5,
    virus: [],
    timer: null,
    create: function (imgT, aT, xT, yT) {
        this.virus.push({
            img: imgT, a: aT, x: xT, y: yT, center: { x: (100 - 48), y: (100 - 36) }, move: function () {
                this.a += virusMovementManager.d
                this.x = this.center.x + (virusMovementManager.r * Math.sin(this.a));
                this.y = this.center.y + (virusMovementManager.r * Math.cos(this.a));
                this.img.style.top = this.y + "px";
                this.img.style.left = this.x + "px";
            },
            changeIm: function (url) {
                this.img.style.backgroundImage = url
            }
        })
    },
    init: function () {
        this.createVirus("bl", 66, -34, 3)
        this.createVirus("yl", -43, 92, 5)
        this.createVirus("br", 136, 118, 1)
        for (item of this.virus) {
            item.move()
        }
        this.turnAround()
        this.changeImage()
    },
    createVirus: function (color, x, y, a) {
        var div = document.createElement("div")
        div.setAttribute("style", "background-image: url(img/lupa/" + color + "/2.png);")
        main.appendChild(div)
        this.create(div, a, x, y)
    },
    changeImage: function () {
        cout = 2
        var im = setInterval(function () {
            for (item of virusMovementManager.virus) {
                if (cout == 5) cout = 1
                var url = item.img.style.backgroundImage.split("/")
                var newUrl = url[0] + "/" + url[1] + "/" + url[2] + "/" + cout + ".png\")"
                item.changeIm(newUrl)
            }
            cout++
        }, 200)
    },
    turnAround: function () {
        this.timer = timerOfVirus = setInterval(function () {
            for (item of virusMovementManager.virus) {
                item.move()
            }
        }, 1500)
    }
}

var pointManager = {
    init: function () {
        if (localStorage.getItem("points") == null) {
            localStorage.setItem("points", 0)
        }
        if (localStorage.getItem("HightSore") == null) {
            localStorage.setItem("HightSore", 0)
        }
        this.updateToLocalStorageSesion(0)
        this.updateScoreContent()
    },
    actualpoint: function () {
        if (localStorage.getItem("points") != null) {
            return parseInt(localStorage.getItem("points"))
        } else {
            return 0
        }
    },
    resetScore: function () {
        localStorage.getItem("points", 0)
    },
    highScore: function () {
        return localStorage.getItem("HightSore")
    },
    addPoint: function (amount) {
        this.updateToLocalStorageSesion(this.actualpoint() + amount)
        this.updateScoreContent()
    },
    updateToLocalStorageSesion: function (amount) {
        localStorage.setItem("points", amount)
        if (amount > parseInt(localStorage.getItem("HightSore"))) {
            localStorage.setItem("HightSore", amount)
        }
    },
    folderContent: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    createImage: function (item) {
        var img = new Image(24, 24)
        this.folderContent.forEach(function (ele, id) {
            if (ele == item) {
                img.src = "img/cyfry/" + ele + ".png"
            }
        });
        return img
    },
    updateScoreContent: function () {
        var score = document.getElementById("points")

        score.querySelectorAll("div").forEach((i) => { i.remove() })
        var div = document.createElement("div")
        var lengthOfPoint = String(this.actualpoint()).length
        var stringOfPoint = String(this.actualpoint())
        for (var x = 0; x < 7 - lengthOfPoint; x++) {
            div.append(this.createImage("0"))
        }
        for (var x = 0; x < lengthOfPoint; x++) {
            div.append(this.createImage(stringOfPoint[x]))
        }
        var div2 = document.createElement("div")
        var lengthOfPoint = String(this.highScore()).length
        var stringOfPoint = String(this.highScore())
        for (var x = 0; x < 7 - lengthOfPoint; x++) {
            div2.append(this.createImage("0"))
        }
        for (var x = 0; x < lengthOfPoint; x++) {
            div2.append(this.createImage(stringOfPoint[x]))
        }
        score.append(div2)
        score.append(div)
    }
}
var timer, timerY;
var delay = 1000 / 60
var endGameBox = document.getElementById("endGame")
var fallState = true
function timerStart() {
    clearInterval(timer)
    timer = setInterval(() => {
        updateVirus()
        blockManager.checkIfVirusDoesntExist()
        if (blockManager.gameEnd.end) {
            if (blockManager.gameEnd.stageComplete) {
                console.log("STAGE COMPLETE")
                displayEnd(true)
            } else {
                displayEnd(false)
                console.log("Upadłeś nisko")
            }
            clearInterval(timerY)
            clearInterval(timer)
            clearInterval(virusMovementManager.timer)
            document.onkeydown = function (e) {
                return false;
            }
        }
    }, delay)
    clearInterval(timerY)
    timerY = setInterval(function () {
        if (fallState) blockManager.updateY()
    }, 700)
}
function updateVirus() {
    var virusLeft = document.getElementById("leftVirus")
    virusLeft.querySelectorAll("img").forEach((i) => { i.remove() })
    virusLeft.appendChild(pointManager.createImage("0"))
    virusLeft.appendChild(pointManager.createImage(String(blockManager.virusLeftCount)))

}
function displayEnd(state) {
    if (state) {
        endGameBox.style.display = "block"
        console.log(endGameBox, state)
        endGameBox.style.width = "423px"
        endGameBox.style.height = "119px"
        endGameBox.style.left = "40vw"
        endGameBox.style.backgroundImage = "url(img/sc.png)"
    } else {
        endGameBox.style.left = "420px"
        endGameBox.style.display = "block"
        endGameBox.style.width = "334px"
        endGameBox.style.height = "119px"
        endGameBox.style.backgroundImage = "url(img/go.png)"
    }
}
function onLoad() {
    for (var x = 1; x <= 16; x++) {
        for (var i = 1; i <= 8; i++) {
            var box = document.createElement("div")
            box.setAttribute("style", "grid-column:" + i + "/" + i + ";grid-row:" + x + "/" + x + ";")
            box.classList += i + "/" + x
            box.classList += " block"
            mainPlane.appendChild(box)
        }
    }
}

document.onkeydown = (e) => {
    const key = e.key
    switch (key) {
        case "ArrowDown":
        case "s":
        case "S":
            if (fallState) blockManager.updateY()
            break;
        case "ArrowLeft":
        case "a":
        case "A":
            blockManager.updateXByKeyboard(-1)
            break;
        case "ArrowRight":
        case "d":
        case "D":
            blockManager.updateXByKeyboard(1)
            break;
        case "ArrowUp":
        case "w": //w lewo
        case "W":
            blockManager.rotateBlockInAnyDirection(-1)
            break;
        case "Shift": //w prawo
            blockManager.rotateBlockInAnyDirection(1)
            break;
    }
}
