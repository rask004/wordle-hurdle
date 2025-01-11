const MAX_GUESS_LETTER = 5

var guess = 1
var index = 1
var correct_word = ""
var guesses = []
var current_guess = ""

const press_enter = (word) => {
    if (current_guess.length < 5) {
        return
    }
    /* TODO:
        if guess is complete, send request with word, compare response, render.
    */
   if (index < 5) {
    // index += 1
   } else {
    finalize_game()
   }
}

const get_answer = () => {
    // TODO: request an answer word.
}

const press_letter = (letter) => {
    if (guess >= MAX_GUESS_LETTER) {
        return
    }
    // TODO: get the element at p-{guess}-{index} which should be blank, and update the letter.
}

const press_backspace = () => {
    if (guess === 1) {
        return
    }
    // guess -= 1
    // TODO: clear the content of p-{guess}-{index} element.
}

const finalize_game = () => {
    // TODO: call when game has ended. Show congrats message or correct answer.
}