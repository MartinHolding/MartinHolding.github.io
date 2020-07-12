document.addEventListener('DOMContentLoaded', () => { //this event fires when the DOM html file has been completely loaded and parsed
    //All my code has to be within these parentheses or it will try and run before DOM elements have been loaded 
    const grid = document.querySelector('.grid'); //select the grid class
    let squares = Array.from(document.querySelectorAll('.grid div')); //selects ALL the divs within the grid class (using querySelectorAll) and turns them into an array (Array.from)
    const scoreDisplay = document.querySelector('#score'); //get the element with id score
    const startBtn = document.querySelector('#start-button'); //get the element with the id start-button
    const width = 10; //width of div
    let nextRandom = 0
    let timerId
    let score = 0

    let colours = [
        'red',
        'orange',
        'blue',
        'purple',
        'green'
    ]

    //making the tetrominos (tetris shapes) - each shape is drawn according to the index of the div
    // so drawing at index 1 is the second div in the array in grid, and then again at 10+1 so the 11th index etc.
    // refer to csv file on google docs for the index number of each grid
    const lTetromino = [
        [1, width+1, width*2+1, 2], //rotation 1
        [width, width+1, width+2, width*2+2], //rotation 2
        [width, width*2, width*2+1, width*2+2], //rotation 3
        [0, 1, width+1, width*2+1] //rotation 4
    ]
    const oTetromino = [
        [0, 1, width, width+1], //rotation 1
        [0, 1, width, width+1], //rotation 2
        [0, 1, width, width+1], //rotation 3
        [0, 1, width, width+1] //rotation 4
    ]
    const zTetromino = [
        [width, 1, width+1, 2], //rotation 1
        [width, width*2, 1, width+1], //rotation 2
        [1, width+1, width+2, width*2+2], //rotation 3
        [width, width+1, width*2+1, width*2+2] //rotation 4
    ]
    const tTetromino = [
        [width, 1, width+1, width+2], //rotation 1
        [1, width+1, width+2, width*2+1], //rotation 2
        [width, width+1, width*2+1, width+2], //rotation 3
        [width, 1, width+1, width*2+1] //rotation 4
    ]
    const lineTetromino = [
        [1, width+1, width*2+1, width*3+1], //rotation 1
        [width, width+1, width+2, width+3], //rotation 2
        [1, width+1, width*2+1, width*3+1], //rotation 3
        [width, width+1, width+2, width+3] //rotation 4
    ]

    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, lineTetromino]

    let currentPosition = 4 //start position in grid
    let currentRotation = 0
    //randomise the tetromino selection
    let random = Math.floor(Math.random()*theTetrominoes.length)
    let current =  theTetrominoes[random][currentRotation] //current tetromino and rotation

    //draw the first roation in the first tetromino
    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.add('tetromino') //classList.add adds the shape indicated by squares to the tetromino id in the css file
            squares[currentPosition + index].style.backgroundColor = colours[random]
        })
    }

    //undraw the tetromino
    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino')
            squares[currentPosition + index].style.backgroundColor = ''
        })
    }

    //make shape move down every second 
    //timerId = setInterval(moveDown, 1000) //every 1000ms, invoke moveDown

    //assign functions to keycodes 
    function control (e) {
        if(e.keyCode === 37) {
            moveLeft()
        }else if (e.keyCode === 38) {
            rotate()
        }else if (e.keyCode == 39) {
            moveRight()
        }else if (e.keyCode === 40) {
            moveDown()
        }
    }
    document.addEventListener('keyup', control) //on key up, invoke function control
    //move down function
    function moveDown () {
        undraw() //remove old tetromino
        currentPosition += width //add 10 to the position
        draw() //draw new shape location
        freeze()
    }
    //stop moving
    function freeze() {
        //if any of the squares in our tetromino contain the class taken (i.e. have hit the screen bottom) then give the class taken to it
        if(current.some(index => squares[currentPosition +index +width].classList.contains('taken'))){
            current.forEach(index => squares[currentPosition +index].classList.add('taken'))
            //start new tetromino falling
            random = nextRandom
            nextRandom =Math.floor(Math.random()*theTetrominoes.length)
            current = theTetrominoes[random][currentRotation]
            currentPosition = 4
            draw()
            displayShape()
            addScore()
            gameOver()
        }
    }
    //move tetromino left unless at edge
    function moveLeft() {
        undraw() // remove current tetromino
        //check if at left edge. If any of the current tetrominos squares indexes leave exactly 0 when divided by 10 (the width)
        const isAtLeftEdge = current.some(index => (currentPosition+index) % width === 0)

        //if is at left edge === false
        if(!isAtLeftEdge) {
            currentPosition -= 1
        }
        if(current.some(index => squares[currentPosition +index].classList.contains('taken'))) {
            currentPosition +=1
        }
        draw()
    }
    //move tetromino right unless at edge
    function moveRight() {
        undraw() // remove current tetromino
        //check if at left edge. If any of the current tetrominos squares indexes leave exactly 0 when divided by 10 (the width)
        const isAtRightEdge = current.some(index => (currentPosition+index) % width === width-1)

        //if is at left edge === false
        if(!isAtRightEdge) {
            currentPosition += 1
        }
        if(current.some(index => squares[currentPosition +index].classList.contains('taken'))) {
            currentPosition -=1
        }
        draw()
    }
    //rotate tetromino
    function rotate () {
        undraw()
        currentRotation ++ //increase rotation index by 1
        if(currentRotation === current.length) {
            currentRotation = 0
        }
        current = theTetrominoes[random][currentRotation]
        draw()
    }

    //present upcoming tetromino in minigrid
    const displaySquares = document.querySelectorAll('.mini-grid div')
    const displayWidth = 4
    let displayIndex = 0

    //tetrominos without rotations
    const upNextTetromino = [
        [1, displayWidth+1, displayWidth*2+1, 2], //l tetromino
        [displayWidth, 1, displayWidth+1, 2], //z tetromino
        [displayWidth, 1, displayWidth+1, displayWidth+2], //tTetromino
        [0, 1, displayWidth, displayWidth+1], //oTetromino
        [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1] //lineTetromino

    ]

    //display shape in minigrid
    function displayShape () {
        displaySquares.forEach(square => {
            square.classList.remove('tetromino')
            square.style.backgroundColor = ''

        })
        upNextTetromino[nextRandom].forEach(index => {
            displaySquares[displayIndex + index].classList.add('tetromino')
            displaySquares[displayIndex + index].style.backgroundColor = colours[nextRandom]
        })
    }

    //add functionality to start/pause button
    startBtn.addEventListener('click', () => {
        if(timerId) {
            clearInterval(timerId) //clears the interval object created if start button has been pressed
            timerId = null
        }else { //if the start button is being pressed then draw a shape and start the timer interval
            draw()
            timerId = setInterval(moveDown, 1000)
            nextRandom = Math.floor(Math.random()*theTetrominoes.length)
            displayShape()
        }
    })
    //add score
    function addScore () {
        for (let i = 0; i < 199; i+=width){
            const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]
            //check if every div in our row has a class of taken then increment score
            if (row.every(index => squares[index].classList.contains('taken'))) {
                score += 10
                scoreDisplay.innerHTML = score
                row.forEach(index => {
                    squares[index].classList.remove('taken')
                    squares[index].classList.remove('tetromino')
                    squares[index].style.backgroundColor = ''
                })
                const sqauresRemoved = squares.splice(i, width) //remove row
                squares = sqauresRemoved.concat(squares)
                squares.forEach(cell => grid.appendChild(cell))
            }
        }
    }
    //define game over
    function gameOver(){
        if(current.some(index => squares [currentPosition+index].classList.contains('taken'))){
            scoreDisplay.innerHTML = 'end'
            clearInterval(timerId)
        }
    }

})