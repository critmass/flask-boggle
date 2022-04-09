class BoggleGame {
    constructor(gameId, timeInSeconds=60) {
        this.timeLeft = timeInSeconds
        this.showTimer()

        this.words = new Set()
        this.score = 0
        this.board = $("#" + gameId)

        this.timer = setInterval(
            this.oneSecondPass.bind(this),
            1000
        )

        $(".submit-word", this.board).on(
            "submit",
            this.handleSubmit.bind(this)
        )
    }

    showWord(word) {
        $(".words", this.board).append(
            $("<li>", {text: word})
        )
    }

    showScore() {
        const score = this.score
        $(".score", this.board).text(score)
    }

    showMessage(message, class2add) {
        $(".messages", this.board).text(
            message
        ).removeClass(
        ).addClass(`msg ${class2add}`)
    }

    async handleSubmit(e) {
        e.preventDefault()

        const output = {
            message: "",
            class: ""
        }
        const $word = $(".word", this.board)
        let word = $word.val()
        if(!word) return
        else if(this.words.has(word)) {
            output.message = 'You already found this word',
            output.class = "message-error"
        }
        else {
            const response = await axios.get(
                "/check-word",
                {params: { word }}
            )
            if(response.data.result === "not-word") {
                output.message = `${word} is not on our list of valid words`
                output.class = "message-error"
            }
            else if(response.data.result === "not-on-board") {
                output.message = `${word} is not a word on this board`
                output.class = "message-error"
            }
            else {
                this.showWord()
                this.score += word.length
                this.showScore()
                this.words.add(word)
                output.message = `The word "${word}" was added`
                output.class = "message-added"
            }
        }
        this.showMessage(output.message, output.class)
        $word.val("").focus()
    }

    showTimer() {
        $(".timer", this.board).text(this.timeLeft)
    }

    async oneSecondPass() {
        this.secs -= 1
        this.showTimer()

        if(this.timeLeft === 0) {
            clearInterval(this.timer)
            await this.scoreGame()
        }
    }

    async scoreGame() {
        $("submit-word", this.board).hide()
        const response = await axios.post(
            "/post-score",
            { score:this.score }
        )
        if(response.data.newRecord) {
            this.showMessage(
                `New record! Your score was ${this.score}`,
                "message-final"
            )
        }
        else {
            this.showMessage(`Your score was ${this.score}`, "message-final")
        }
    }
}