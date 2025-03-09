const URL_GET_WORD_ONE = '/api/request'
const URL_GET_WORDS_MANY = '/api/request/5'
const URL_GET_WORDS_ALL = '/api/request/all'

const MAX_GUESS_LETTER = 5
const MAX_GUESS_WORDS = 5
const MAX_ROUNDS = 5

const ANIMATION_DELAY = 0.5

const keyboard = Array.from(document.querySelectorAll(`button`)).filter(item => item.textContent.length == 1)

var allWords = []
var guess = 1
var index = 1
var correctWordIndex = 0
var correctWords = []
var currentGuess = ""


const update_ui = (selector, letter, newClass) => {
    // console.log(`UPDATE_UI: selector=${selector} letter=${letter} newClass=${newClass}`)
    const e = document.querySelector(selector)
    e.style.color = 'white'
    e.innerHTML = letter.toUpperCase()
    const keyElement = keyboard.filter(item => item.textContent === letter)[0]
    e.classList.remove('reset-green', 'reset-yellow', 'reset-grey', 'reset-clear')
    // keyElement.classList.remove('green', 'yellow', 'grey')
    if (newClass == 'green') {
        keyElement.classList.remove('yellow', 'grey')
        if (keyElement.classList.length == 0) {
            keyElement.classList.add('green')
        }
    } else if (newClass == 'yellow') {
        keyElement.classList.remove('grey')
        if (keyElement.classList.length == 0) {
            keyElement.classList.add('yellow')
        }
    } else if (newClass == 'grey') {
        if (keyElement.classList.length == 0) {
            keyElement.classList.add('grey')
        }
    }
    e.classList.add(newClass)
    e.style.color = ''
}


const set_keyboard_active = (active = true) => {
    const enterKey = document.querySelector("#enter-key")
    if (active) {
        enterKey.removeAttribute("disabled")
    } else {
        enterKey.setAttribute("disabled", 'true')
    }
    for (const keyElement of keyboard) {
        if (active) {
            keyElement.removeAttribute("disabled")
        } else {
            keyElement.setAttribute("disabled", "true")
        }
    }
}


const clear_keyboard = () => {
    for (const key of keyboard) {
        key.className = ''
    }
}


const press_enter = () => {

    // console.log(currentGuess, correctWords[correctWordIndex])
    if (index > MAX_GUESS_WORDS) {
        make_shake_animation()
        return
    }
    else if (currentGuess.length < MAX_GUESS_LETTER) {
        make_shake_animation()
        return
    }
    else if (!allWords.includes(currentGuess)) {
        make_shake_animation()
        return
    }

    set_keyboard_active(false)

    const correctWord = correctWords[correctWordIndex]
    // console.log(currentGuess, correctWord)
    let correct_letter_count = 0
    for (let i = 0; i < MAX_GUESS_LETTER; i++) {
        const selector = `#g-${index}-${i + 1}`
        const letter = currentGuess[i]

        if (letter == correctWord[i]) {
            correct_letter_count++
            update_ui(selector, letter, 'green')
        } else if (correctWord.includes(letter)) {
            update_ui(selector, letter, 'yellow')
        } else {
            update_ui(selector, letter, 'grey')
        }

        const e = document.querySelector(selector)
        e.style.animationDelay = `${i * ANIMATION_DELAY}s`;
    }

    const oldIndex = index
    setTimeout(() => {
        for (let i = 0; i < MAX_GUESS_LETTER; i++) {
            const selector = `#g-${oldIndex}-${i + 1}`
            document.querySelector(selector).style.animationDelay = ''
        }
    }, ANIMATION_DELAY * MAX_GUESS_LETTER * 1000 + 1)

    // console.log(currentGuess, correctWords[correctWordIndex], correct_letter_count, index)

    if (correct_letter_count >= 5 || index >= MAX_GUESS_WORDS) {
        setTimeout(() => {
            finish_round()
        }, ANIMATION_DELAY * MAX_GUESS_LETTER * 1000)
    }
    else {
        currentGuess = ""
        index += 1
        guess = 1
        setTimeout(() => {
            set_keyboard_active()
        }, ANIMATION_DELAY * MAX_GUESS_LETTER * 1000 + 1)
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
        make_shake_animation()
        return
    }
    else if (guess > MAX_GUESS_LETTER) {
        make_shake_animation()
        return
    }
    const element = document.querySelector(`#g-${index}-${guess}`)
    element.innerHTML = letter.toUpperCase()
    guess += 1
    currentGuess = currentGuess.concat(letter)
}

const make_shake_animation = () => {
    for (let i = 1; i <= MAX_GUESS_LETTER; i++) {
        document.querySelector(`#g-${index}-${i}`).classList.add('shake')
    }

    setTimeout(() => {
        for (let i = 1; i <= MAX_GUESS_LETTER; i++) {
            document.querySelector(`#g-${index}-${i}`).classList.remove('shake')
        }
    }, ANIMATION_DELAY * 1000)
}

const press_backspace = () => {
    if (guess === 1) {
        make_shake_animation()
        return
    }
    else if (index > MAX_GUESS_WORDS) {
        make_shake_animation()
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
    let correctWord = correctWords[correctWordIndex]

    if (correctWord != currentGuess) {
        end_game(false)
        return
    }
    else if (correctWord == currentGuess && correctWordIndex >= MAX_ROUNDS - 1) {
        end_game(true)
        return
    }

    correctWordIndex++
    correctWord = correctWords[correctWordIndex]
    reset_board()
    clear_keyboard()
    // console.log('NEXT ROUND!!!')
    index = 1

    if (correctWordIndex < MAX_ROUNDS - 1) {
        setTimeout(() => {
            const tmp = correctWords[correctWordIndex - 1]
            currentGuess = ""
            guess = 1
            index = 1
            for (let i = 1; i <= MAX_GUESS_LETTER; i++) {
                const letter = tmp[i - 1].toUpperCase()
                press_letter(letter)
            }
            press_enter()
        }, ANIMATION_DELAY * 1000 + 2)

    } else if (correctWordIndex == MAX_ROUNDS - 1) {
        // console.log(`FINAL ROUND: correctword=${correctWord}`)
        setTimeout(() => {
            let letter
            let selector

            for (let i = 1; i < MAX_GUESS_WORDS; i++) {
                currentGuess = correctWords[i - 1]
                // console.log(`FINAL ROUND: COMPARE: currentGuess=${currentGuess} correctWord=${correctWord}`)
                for (let j = 0; j < currentGuess.length; j++) {
                    selector = `#g-${i}-${j + 1}`
                    letter = currentGuess[j].toUpperCase()
                    if (letter == correctWord[j]) {
                        update_ui(selector, letter, 'green')
                    } else if (correctWord.includes(letter)) {
                        update_ui(selector, letter, 'yellow')
                    } else {
                        update_ui(selector, letter, 'grey')
                    }
                    document.querySelector(selector).style.animationDelay = `${i * ANIMATION_DELAY}s`;
                }
            }
            currentGuess = ""
        }, ANIMATION_DELAY * 1000 + 2)
        index = 5
    }
    setTimeout(set_keyboard_active, MAX_GUESS_LETTER * ANIMATION_DELAY * 1000 + 10)
    guess = 1
}

const end_game = (winState) => {
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
    for (let j = MAX_GUESS_WORDS; j >= 1; j--) {
        for (let i = 1; i <= MAX_GUESS_LETTER; i++) {
            const e = document.querySelector(`#g-${j}-${i}`)
            if (e.classList.contains('green')) {
                e.classList.add('reset-green')
                e.classList.remove('green')
            }
            else if (e.classList.contains('yellow')) {
                e.classList.add('reset-yellow')
                e.classList.remove('yellow')
            } else if (e.classList.contains('grey')) {
                e.classList.add('reset-grey')
                e.classList.remove('grey')
            } else {
                e.classList.add('reset-clear')
            }
            e.style.animationDelay = `0s`
            //e.style.color = 'white'
        }
    }
    setTimeout(() => {
        for (let j = 1; j <= MAX_GUESS_WORDS; j++) {
            for (let i = 1; i <= MAX_GUESS_LETTER; i++) {
                const e = document.querySelector(`#g-${j}-${i}`)
                e.innerHTML = ''
                e.style.animationDelay = ''
                e.classList.remove('reset-grey', 'reset-yellow', 'reset-green', 'reset-clear')
            }
        }
    }, ANIMATION_DELAY * 500 + 1)
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
    for (const key of keyboard) {
        const letter = key.innerHTML
        key.addEventListener('click', () => {
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


    // DEBUG
    // correctWordIndex = MAX_ROUNDS - 2
    // currentGuess = correctWords[correctWordIndex]
    // finish_round()
}

window.onload = init_game;
