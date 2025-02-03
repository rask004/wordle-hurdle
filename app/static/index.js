const URL_GET_WORD_ONE = '/api/request'
const URL_GET_WORDS_MANY = '/api/request/5'
const URL_GET_WORDS_ALL = '/api/request/all'

const MAX_GUESS_LETTER = 5
const MAX_GUESS_WORDS = 5
const MAX_ROUNDS = 5

const ANIMATION_DELAY = 0.5


var allWords = []
var guess = 1
var index = 1
var correctWordIndex = 0
var correctWords = []
var currentGuess = ""


const press_enter = () => {
    // console.log(currentGuess, correctWords[correctWordIndex], allWords)
    if (index > MAX_GUESS_WORDS) {
        console.log('Current game is finished')
        return
    }
    else if (currentGuess.length < MAX_GUESS_LETTER) {
        console.log('ENTER: word not complete')
        return
    }
    else if (!allWords.includes(currentGuess)) {
        console.log('Not a word!')
        return
    }
    const correctWord = correctWords[correctWordIndex]
    // console.log(currentGuess, correctWord)
    let correct_letter_count = 0
    const keyboard = Array.from(document.querySelectorAll(`a`)).filter(item => item.text.length == 1)
    for (let i = 0; i < MAX_GUESS_LETTER; i++) {
        const e = document.querySelector(`#g-${index}-${i + 1}`)
        const letter = currentGuess[i]
        e.innerHTML = letter.toUpperCase()
        const keyElement = keyboard.filter(item => item.text === letter)[0]
        e.classList.remove('reset-green', 'green', 'reset-yellow', 'yellow', 'reset-grey', 'grey')

        if (letter == correctWord[i]) {
            e.classList.add('green')
            // console.log("GREEN = ", e, keyElement)
            correct_letter_count++
            if (keyElement.classList.length > 0) {
                keyElement.classList.remove('yellow')
            }
            keyElement.classList.add('green')
        } else if (correctWord.includes(letter)) {
            e.classList.add('yellow')
            // console.log("YELLOW = ", e, keyElement)
            if (keyElement.classList.length == 0) {
                keyElement.classList.add('yellow')
            }
        } else {
            e.classList.add('grey')
            // console.log("GREY = ", e, keyElement)
            if (keyElement.classList.length == 0) {
                keyElement.classList.add('grey')
            }
        }
        e.style.animationDelay = `${i * ANIMATION_DELAY}s`;
    }

    if (correct_letter_count >= 5 || index >= MAX_GUESS_WORDS) {
        setTimeout(() => {
            finish_round()
        }, ANIMATION_DELAY * MAX_GUESS_LETTER * 1000)
    }
    else {
        currentGuess = ''
        index += 1
        guess = 1
    }
}

const request_words = async () => {
    const response = await fetch(URL_GET_WORDS_ALL);
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json()
    const words = json['words']
    return words
}

const press_letter = (letter) => {
    //console.log(guess, index, letter, `#g-${index}-${guess}`)       // DEBUG
    if (index > MAX_GUESS_WORDS) {
        console.log('Current game is finished')
        return
    }
    else if (guess > MAX_GUESS_LETTER) {
        console.log('Cannot insert more letters, for this guess')
        return
    }
    const element = document.querySelector(`#g-${index}-${guess}`)
    element.innerHTML = letter.toUpperCase()
    guess += 1
    currentGuess = currentGuess.concat(letter)
}

const press_backspace = () => {
    if (guess === 1) {
        console.log('all letters already removed, for this guess')
        return
    }
    else if (index >= 6) {
        console.log('Current game is finished')
        return
    }
    guess -= 1
    const element = document.querySelector(`#g-${index}-${guess}`)
    element.innerHTML = ""
    if (guess <= 1) {
        currentGuess = ""
    } else {
        currentGuess = currentGuess.slice(0, currentGuess.length - 1)
    }
    // console.log(`#g-${index}-${guess}`)       // DEBUG
}

const finish_round = () => {
    const correctWord = correctWords[correctWordIndex]

    if (correctWord != currentGuess) {
        win_game(false)
        return
    }
    else if (correctWord == currentGuess && correctWordIndex >= MAX_ROUNDS) {
        win_game(true)
        return
    }

    correctWordIndex++
    if (correctWordIndex < MAX_ROUNDS - 1) {
        reset_board()
        setTimeout(() => {
            currentGuess = correctWords[correctWordIndex - 1]
            press_enter()
        }, ANIMATION_DELAY * 1000 + 50)
    }
    else if (correctWordIndex == MAX_ROUNDS - 1) {
        reset_board()
        setTimeout(() => {
            currentGuess = correctWords[0]
            press_enter()
            currentGuess = correctWords[1]
            press_enter()
            currentGuess = correctWords[2]
            press_enter()
            currentGuess = correctWords[3]
            press_enter()
        }, ANIMATION_DELAY * 1000 + 50)
    }
}

const win_game = (winState) => {
    let message;
    if (winState) {
        message = "You Won!!"
    } else {
        const correctWord = correctWords[correctWordIndex]
        message = `The answer was ${correctWord}`
    }
    const element = document.querySelector(`#message`)
    element.innerHTML = message
    element.classList.add('show')
    guess = 1
    index = MAX_GUESS_WORDS + 1
}

const reset_board = () => {
    for (let j = index; j >= 2; j--) {
        for (let i = 1; i <= MAX_GUESS_LETTER; i++) {
            const e = document.querySelector(`#g-${j}-${i}`)
            if (e.classList.contains('green')) {
                e.classList.add('reset-green')
                e.classList.remove('green')
            }
            else if (e.classList.contains('yellow')) {
                e.classList.add('reset-yellow')
                e.classList.remove('yellow')
            } else {
                e.classList.add('reset-grey')
                e.classList.remove('grey')
            }
            e.style.animationDelay = `0s`
            e.style.color = 'white'
        }
    }
    setTimeout(() => {
        for (let j = 1; j <= MAX_GUESS_WORDS; j++) {
            for (let i = 1; i <= MAX_GUESS_LETTER; i++) {
                const e = document.querySelector(`#g-${j}-${i}`)
                e.innerHTML = ''
                e.style.color = ''
            }
        }
    }, ANIMATION_DELAY * 1000 + 10)
    const keyboard = Array.from(document.querySelectorAll(`a`)).filter(item => item.text.length == 1)
    for (const key of keyboard) {
        key.className = ''
    }
    index = 1
    guess = 1
}



const init_game = async () => {
    allWords = await request_words()

    if (allWords.length < 5) {
        throw Error("The source word list is not big enough. It should have at least 5 words.")
    }
    for (let i = 0; i < allWords.length; i++) {
        allWords[i] = allWords[i].toUpperCase()
    }
    let usedIndices = []
    while (correctWords.length < 5) {
        let ndx = Math.round(Math.random() * allWords.length)
        if (usedIndices.includes(ndx)) {
            // skip if this word is already used. Ndx comparison faster than with strings
            continue
        }
        correctWords.push(allWords[ndx])
    }
    const anchors = document.querySelectorAll('a')
    for (const anchor of anchors) {
        if (anchor.hasAttribute('id'))
            continue;
        const letter = anchor.innerHTML
        anchor.addEventListener('click', () => {
            press_letter(letter)
        })
    }
    const bs = document.querySelector('#bs-key')
    bs.addEventListener('click', () => {
        press_backspace()
    })
    const enter = document.querySelector('#enter-key')
    enter.addEventListener('click', () => {
        press_enter()
    })

    console.log('correctwords =', correctWords)
}

window.onload = init_game;
