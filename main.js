class GenerateQuiz {
    constructor(pathToQuizData, form) {
        this.pathToData = pathToQuizData;
        this.form = form;
    }

    async fetchData(pathToData) {
        let response = await fetch(pathToData);

        if (response.ok) {
            let data = await response.json();
            return Object.entries(data.quiz);
        }
    }

    async generateQuestion(questionData) {
        if ("content" in document.createElement("template")) {
            let questionTemplate = document.getElementById("questionTemplate").content.cloneNode(true);
            let questionElement = questionTemplate.querySelector(".question");
            let titleElement = questionTemplate.querySelector(".title");
            let optionTemplate = questionTemplate.querySelector(".option");

            // Set title
            titleElement.textContent = questionData[1].question;

            // Set options
            for (let option of questionData[1].options) {
                let optionElement = optionTemplate.cloneNode(true);

                const input = optionElement.querySelector("input");
                const label = optionElement.querySelector("label");

                input.name = questionData[0];
                input.id = option;
                input.value = option;

                label.setAttribute("for", option);
                label.textContent = option;

                if (localStorage.getItem("answers")) {
                    let storage = JSON.parse(localStorage.getItem("answers"));

                    if (input.value === storage[questionData[0]]) {
                        input.checked = true;
                    }

                    if (input.checked && storage[questionData[0]] === questionData[1].answer) {
                        label.style.color = "green";
                    } else if (input.checked && storage[questionData[0]] !== questionData[1].answer) {
                        label.style.color = "red";
                    }
    
                }

                questionElement.append(optionElement);
            }

            optionTemplate.remove();

            return questionElement;
        }
    }

    async appendQuestions() {
        const data = await this.fetchData(this.pathToData);
        const questionsElement = this.form.querySelector(".questions");

        for (let question of data) {
            let questionElement = await this.generateQuestion(question);
            questionsElement.append(questionElement);

            // await this.validateAnswer(question, questionElement);
        }
        await this.submitForm();
    }

    async submitForm() {
        let submitBtn = this.form.querySelector("button[type=submit]");
        submitBtn.addEventListener("click", (e) => {
            let answers = Object.fromEntries(new FormData(this.form).entries());
            localStorage.setItem("answers", JSON.stringify(answers));
        });
    }

    // No Refresh
    // async validateAnswer(data, questionElement) {
    //     let submitBtn = this.form.querySelector("button[type=submit]");
    //     submitBtn.addEventListener("click", (e) => {
    //         e.preventDefault();

    //         const inputs = Array.from(questionElement.querySelectorAll("input"));
    //         const checkedInputs = inputs.filter((input) => input.checked);

    //         for (let checkedInput of checkedInputs) {
    //             if (checkedInput.value === data[1].answer) {
    //                 console.log(true);
    //             } else {
    //                 console.log(false);
    //             }
    //         }
    //     });
    // }
}

const pathToQuizData = "./quiz.json";
const form = document.forms.quiz;
let generateQuiz = new GenerateQuiz(pathToQuizData, form);

(async () => {
    await generateQuiz.appendQuestions();
})();
