class BoggleGame {
    /* makes a new game in DOM */
    constructor(boardId, secs = 60) {
        this.secs = secs;
        this.showTimer();

        this.score = 0;
        this.words = new Set();
        this.board = $("#" + boardId);

        this.timer = setInterval(this.tick.bind(this), 1000);

        $('.add-word', this.board).on('submit', this.handleSubmit.bind(this));
    }

    showWord(word) {
        /* this uses the list of words and shows the word */
        $('.words', this.board).append($('<li>', { text: word }))
    }

    showScore() {
        /* this shows the score to the player through HTML */
        $('.score', this.board).text(this.score);
    }

    showMessage(msg, cls) {
        /* this shows the status message to the player */
        $('.msg', this.board).text(msg).removeClass().addClass(`msg ${cls}`);
    }

    async handleSubmit(evt) {
        /* this handles the submission and checks if the word is uninque and valid. if it is then it will add
        to the score */
        evt.preventDefault();
        const $word = $('.word', this.board);

        let word = $word.val();
        if (!word) return;

        if (this.words.has(word)) {
            this.showMessage(`Already found ${word}`, 'err');
            return;
        }
        /* this code uses axios to check if the submitted word is valid */
        const response = await axios.get('/check-word', { params: { word: word }});
        if (response.data.result === "not-word") {
            this.showMessage(`${word} is not a valid English word!`, 'err');
        } else if (response.data.result === 'not-on-board') {
            this.showMessage(`${word} is not a valid word on this board!`, 'err');
        } else {
            this.showWord(word);
            this.score += word.length;
            this.showScore();
            this.words.add(word);
            this.showMessage(`Added: ${word}`, 'ok')
        }

        $word.val('').focus();
    }

    showTimer() {
        /* Updates the timer */
        $('.timer', this.board).text(this.secs);
    }

    async tick() {
        this.secs -= 1;
        this.showTimer();

        if (this.secs === 0) {
            clearInterval(this.timer);
            await this.scoreGame()
        }
    }

    async scoreGame() {
        /* this ends the game, shows messages and posts scores for the player. */
        $('.add-word', this.board).hide();
        const response = await axios.post('/post-score', {score: this.score })
        if (response.data.brokeRecord) {
            this.showMessage(`New Record: ${this.score}`, 'ok')
        } else {
            this.showMessage(`Final Score: ${this.score}`, 'ok')
        }
    }

}