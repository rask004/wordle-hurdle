const URL_GET_WORD_ONE = '/api/request'
const URL_GET_WORDS_MANY = '/api/request/5'
const URL_GET_WORDS_ALL = '/api/request/all'

const MAX_GUESS_LETTER = 5
const MAX_GUESS_WORDS = 5

var guess = 1
var index = 1
var correctWordIndex = 0
var correctWords = []
var guesses = []
var currentGuess = ""


const press_enter = () => {
    if (index > MAX_GUESS_WORDS) {
        console.log('Current game is finished')
        return
    }
    else if (currentGuess.length < MAX_GUESS_LETTER) {
        console.log('ENTER: word not complete')
        return
    }
    const correctWord = correctWords[correctWordIndex]
    console.log(currentGuess, correctWord)
    let correct_letter_count = 0
    for (let i = 0; i < MAX_GUESS_LETTER; i++) {
        const e = document.querySelector(`#g-${index}-${i + 1}`)
        console.log(e, currentGuess[i], correctWord[i], currentGuess[i] == correctWord[i], correctWord.includes(currentGuess[i]))
        if (currentGuess[i] == correctWord[i]) {
            e.classList.add('green')
            correct_letter_count++
        } else if (!correctWord.includes(currentGuess[i])) {
            e.classList.add('grey')
        } else {
            e.classList.add('yellow')
        }
    }

    if (correct_letter_count >= 5) {
        index = MAX_GUESS_WORDS
    }

    if (index < MAX_GUESS_WORDS) {
        index += 1
        guess = 1
        currentGuess = ""
    } else {
        guess = MAX_GUESS_LETTER + 1
        index = MAX_GUESS_WORDS + 1
        finalize_game()
    }
}

const request_words = async () => {
    const response = await fetch(URL_GET_WORDS_MANY);
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json()
    const words = json['words']
    console.log('words = ', words)
    return words
}

const press_letter = (letter) => {
    letter = letter.toUpperCase()
    console.log(guess, index, letter, `#g-${index}-${guess}`)       // DEBUG
    if (index > MAX_GUESS_WORDS) {
        console.log('Current game is finished')
        return
    }
    else if (guess > MAX_GUESS_LETTER) {
        return
    }

    const element = document.querySelector(`#g-${index}-${guess}`)
    element.innerHTML = letter
    guess += 1
    currentGuess = currentGuess.concat(letter)
}

const press_backspace = () => {
    if (guess === 1) {
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
    console.log(`#g-${index}-${guess}`)       // DEBUG
}

const finalize_game = () => {
    const correctWord = correctWords[correctWordIndex]
    let message;
    if (correctWord == currentGuess) {
        message = "Congratulations!!"
    } else {
        message = `The answer was ${correctWord}`
    }
    const element = document.querySelector(`#message`)
    element.innerHTML = message
    element.removeAttribute('hidden')

}


const init_game = async () => {
    correctWords = await request_words()
    // console.log('correctwords =', correctWords)
    for (let i = 0; i < correctWords.length; i++) {
        correctWords[i] = correctWords[i].toUpperCase()
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
}

window.onload = init_game;
