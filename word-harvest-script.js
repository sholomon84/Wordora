let letters = [];
let remainingLetters = 0;
let usedWords = [];
let moveHistory = [];
let generatedWords = [];
let hintIndex = 0;

// Отображаем буквы на экране
function displayLetters() {
    const lettersElement = document.getElementById("letters");
    lettersElement.textContent = letters.join(" ");
}

// Проверка слова с эффектом конфетти при победе
function checkWord() {
    const word = document.getElementById("wordInput").value.toLowerCase();
    const messageElement = document.getElementById("message");
    const remainingLettersElement = document.getElementById("remainingLetters");
    const usedWordsElement = document.getElementById("usedWords");

    if (usedWords.includes(word)) {
        messageElement.textContent = `Слово "${word}" уже использовано!`;
        return;
    }

    if (!dictionary.includes(word)) {
        messageElement.textContent = `Слово "${word}" не существует в словаре!`;
        return;
    }

    let tempLetters = [...letters];
    let isValid = true;

    for (let char of word) {
        const index = tempLetters.indexOf(char);
        if (index === -1) {
            isValid = false;
            break;
        }
        tempLetters.splice(index, 1);
    }

    if (isValid) {
        letters = tempLetters;
        remainingLetters -= word.length;
        remainingLettersElement.textContent = remainingLetters;
        messageElement.textContent = `Слово "${word}" принято!`;
        document.getElementById("wordInput").value = "";

        usedWords.push(word);
        const linkedWords = usedWords.map(w => 
            `<a href="https://www.google.com/search?q=${w}" target="_blank" style="color: #007aff; text-decoration: underline;">${w}</a>`
        ).join(", ");
        usedWordsElement.innerHTML = `Использованные слова: ${linkedWords}`;

        moveHistory.push(word);

        if (remainingLetters === 0) {
            messageElement.textContent = "Поздравляем! Вы использовали все буквы!";
            // Запуск эффекта конфетти
            confetti({
                particleCount: 200,
                spread: 90,
                origin: { y: 0.6 }
            });
        }
    } else {
        messageElement.textContent = `Слово "${word}" нельзя составить из этих букв.`;
    }

    displayLetters();
}

// Перемешивание букв
function shuffleLetters(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Выбор случайного слова из словаря по количеству букв
function getRandomWord(letterCount) {
    const suitableWords = dictionary.filter(word => word.length === letterCount);
    if (suitableWords.length === 0) {
        document.getElementById("message").textContent = "В словаре нет слов с таким количеством букв!";
        return null;
    }
    const randomIndex = Math.floor(Math.random() * suitableWords.length);
    return suitableWords[randomIndex];
}

// Генерация букв для уровня (режим 1: из двух слов)
function generateLettersFromTwoWords(count) {
    let word1Length, word2Length;

    if (count === 5) {
        word1Length = 2;
        word2Length = 3;
    } else if (count === 6) {
        word1Length = 3;
        word2Length = 3;
    } else if (count === 7) {
        word1Length = 3;
        word2Length = 4;
    } else if (count === 8) {
        word1Length = 4;
        word2Length = 4;
    } else {
        word1Length = Math.floor(count / 2);
        word2Length = Math.ceil(count / 2);
    }

    const word1 = getRandomWord(word1Length);
    const word2 = getRandomWord(word2Length);

    if (!word1 || !word2) {
        console.error('Не удалось найти подходящие слова для уровня.');
        alert('Не удалось найти подходящие слова для уровня. Попробуйте другой уровень.');
        return [];
    }

    console.log(`Найдены слова: "${word1}" (${word1Length} букв) и "${word2}" (${word2Length} букв)`);
    generatedWords = [word1, word2];
    const combinedLetters = word1.split('').concat(word2.split(''));
    return shuffleLetters(combinedLetters);
}

// Генерация букв для уровня (режим 2: из трёх слов)
function generateLettersFromThreeWords(count) {
    let word1Length, word2Length, word3Length;

    if (count === 8) {
        word1Length = 2;
        word2Length = 3;
        word3Length = 3;
    } else if (count === 9) {
        word1Length = 3;
        word2Length = 3;
        word3Length = 3;
    } else if (count === 10) {
        word1Length = 3;
        word2Length = 3;
        word3Length = 4;
    } else {
        word1Length = Math.floor(count / 3);
        word2Length = Math.floor(count / 3);
        word3Length = count - word1Length - word2Length;
    }

    const word1 = getRandomWord(word1Length);
    const word2 = getRandomWord(word2Length);
    const word3 = getRandomWord(word3Length);

    if (!word1 || !word2 || !word3) {
        console.error('Не удалось найти подходящие слова для уровня.');
        alert('Не удалось найти подходящие слова для уровня. Попробуйте другой уровень.');
        return [];
    }

    console.log(`Найдены слова: "${word1}" (${word1Length} букв), "${word2}" (${word2Length} букв) и "${word3}" (${word3Length} букв)`);
    generatedWords = [word1, word2, word3];
    const combinedLetters = word1.split('').concat(word2.split(''), word3.split(''));
    return shuffleLetters(combinedLetters);
}

// Генерация букв для уровня (режим 3: из четырёх слов)
function generateLettersFromFourWords(count) {
    let word1Length, word2Length, word3Length, word4Length;

    if (count === 12) {
        word1Length = 3;
        word2Length = 3;
        word3Length = 3;
        word4Length = 3;
    } else if (count === 15) {
        word1Length = 4;
        word2Length = 4;
        word3Length = 4;
        word4Length = 3;
    } else if (count === 20) {
        word1Length = 5;
        word2Length = 5;
        word3Length = 5;
        word4Length = 5;
    } else {
        word1Length = Math.floor(count / 4);
        word2Length = Math.floor(count / 4);
        word3Length = Math.floor(count / 4);
        word4Length = count - word1Length - word2Length - word3Length;
    }

    const word1 = getRandomWord(word1Length);
    const word2 = getRandomWord(word2Length);
    const word3 = getRandomWord(word3Length);
    const word4 = getRandomWord(word4Length);

    if (!word1 || !word2 || !word3 || !word4) {
        console.error('Не удалось найти подходящие слова для уровня.');
        alert('Не удалось найти подходящие слова для уровня. Попробуйте другой уровень.');
        return [];
    }

    console.log(`Найдены слова: "${word1}" (${word1Length} букв), "${word2}" (${word2Length} букв), "${word3}" (${word3Length} букв) и "${word4}" (${word4Length} букв)`);
    generatedWords = [word1, word2, word3, word4];
    const combinedLetters = word1.split('').concat(word2.split(''), word3.split(''), word4.split(''));
    return shuffleLetters(combinedLetters);
}

// Генерация букв для уровня (режим 4: из пяти слов)
function generateLettersFromFiveWords(count) {
    let word1Length, word2Length, word3Length, word4Length, word5Length;

    if (count === 20) {
        word1Length = 4;
        word2Length = 4;
        word3Length = 4;
        word4Length = 4;
        word5Length = 4;
    } else if (count === 24) {
        word1Length = 5;
        word2Length = 5;
        word3Length = 5;
        word4Length = 5;
        word5Length = 4;
    } else {
        word1Length = Math.floor(count / 5);
        word2Length = Math.floor(count / 5);
        word3Length = Math.floor(count / 5);
        word4Length = Math.floor(count / 5);
        word5Length = count - word1Length - word2Length - word3Length - word4Length;
    }

    const word1 = getRandomWord(word1Length);
    const word2 = getRandomWord(word2Length);
    const word3 = getRandomWord(word3Length);
    const word4 = getRandomWord(word4Length);
    const word5 = getRandomWord(word5Length);

    if (!word1 || !word2 || !word3 || !word4 || !word5) {
        console.error('Не удалось найти подходящие слова для уровня.');
        alert('Не удалось найти подходящие слова для уровня. Попробуйте другой уровень.');
        return [];
    }

    console.log(`Найдены слова: "${word1}" (${word1Length} букв), "${word2}" (${word2Length} букв), "${word3}" (${word3Length} букв), "${word4}" (${word4Length} букв) и "${word5}" (${word5Length} букв)`);
    generatedWords = [word1, word2, word3, word4, word5];
    const combinedLetters = word1.split('').concat(word2.split(''), word3.split(''), word4.split(''), word5.split(''));
    return shuffleLetters(combinedLetters);
}

// Начало игры
function startGame() {
    const level = parseInt(document.getElementById("level").value);
    const mode = document.querySelector('input[name="mode"]:checked').value;

    if (mode === "twoWords") {
        letters = generateLettersFromTwoWords(level);
    } else if (mode === "threeWords") {
        letters = generateLettersFromThreeWords(level);
    } else if (mode === "fourWords") {
        letters = generateLettersFromFourWords(level);
    } else if (mode === "fiveWords") {
        letters = generateLettersFromFiveWords(level);
    }

    if (letters.length === 0) return;

    remainingLetters = letters.length;
    usedWords = [];
    moveHistory = [];
    displayLetters();
    document.getElementById("remainingLetters").textContent = remainingLetters;
    document.getElementById("usedWords").textContent = "";
    document.getElementById("message").textContent = "";
}

// Отмена хода
function undoMove() {
    if (usedWords.length === 0) {
        alert("Нет ходов для отмены!");
        return;
    }

    const lastWord = usedWords.pop();
    letters = letters.concat(lastWord.split(''));
    remainingLetters += lastWord.length;

    displayLetters();
    document.getElementById("remainingLetters").textContent = remainingLetters;
    const linkedWords = usedWords.map(w => 
        `<a href="https://www.google.com/search?q=${w}" target="_blank" style="color: #007aff; text-decoration: underline;">${w}</a>`
    ).join(", ");
    document.getElementById("usedWords").innerHTML = `Использованные слова: ${linkedWords}`;
    document.getElementById("message").textContent = `Ход "${lastWord}" отменён.`;
}

// Подсказка
function showHint() {
    if (generatedWords.length === 0) {
        alert("Нет слов для подсказки!");
        return;
    }

    const firstWord = generatedWords[0];
    const lettersElement = document.getElementById("letters");
    const letterElements = lettersElement.textContent.split(" ");

    const letterToHighlight = firstWord[hintIndex];
    lettersElement.innerHTML = letterElements.map((letter, index) => {
        return index === letters.indexOf(letterToHighlight) ? `<span style="color: red;">${letter}</span>` : letter;
    }).join(" ");

    hintIndex = (hintIndex + 1) % firstWord.length;
    document.getElementById("message").textContent = `Подсказка: буква "${letterToHighlight}".`;
}

// Показать правильный ответ с гиперссылками
function showAnswer() {
    if (generatedWords.length === 0) {
        alert("Нет данных для подсказки!");
        return;
    }

    const messageElement = document.getElementById("message");
    const linkedWords = generatedWords.map(word => 
        `<a href="https://www.google.com/search?q=${word}" target="_blank" style="color: #007aff; text-decoration: underline;">${word}</a>`
    ).join(", ");
    messageElement.innerHTML = `Правильный ответ: ${linkedWords}.`;
}

// Показать/скрыть правила
function toggleRules() {
    const rulesContainer = document.getElementById("rules");
    const rulesButton = document.getElementById("rulesButton");
    if (rulesContainer.style.display === "none") {
        rulesContainer.style.display = "block";
        rulesContainer.innerHTML = `
            <h2>Правила игры Wordora</h2>
            <p>Случайно выбираются несколько слов из словаря, их буквы перемешиваются и появляются на поле.</p>
            <p>Задача: составить из этих букв слова — имена существительные, нарицательные, единственного числа, используя только те буквы, что есть.</p>
            <p>Когда слово составлено, его буквы исчезают. Нужно освободить поле от всех букв.</p>
            <p>Если букв не осталось — победа! Можно выбрать новый уровень.</p>
            <p>Подсказка: показывает по одной букве первого слова. Правильный ответ: открывает все слова. Отмена хода: возвращает последнее слово.</p>
            <p>Важно: можно составлять любые слова, не обязательно те, что в ответе, главное — очистить поле.</p>
            <p>Уровни: от 5 до 24 букв. Режимы: буквы из 2, 3, 4 или 5 слов.</p>
        `;
        rulesButton.textContent = "Скрыть правила";
    } else {
        rulesContainer.style.display = "none";
        rulesButton.textContent = "Показать правила";
    }
}

// Инициализация
document.getElementById("startButton").addEventListener("click", startGame);
document.getElementById("checkButton").addEventListener("click", checkWord);
document.getElementById("undoButton").addEventListener("click", undoMove);
document.getElementById("hintButton").addEventListener("click", showHint);
document.getElementById("showAnswerButton").addEventListener("click", showAnswer);
document.getElementById("rulesButton").addEventListener("click", toggleRules);

document.getElementById("level").addEventListener("change", function () {
    const level = parseInt(this.value);
    const threeWordsMode = document.getElementById("threeWordsMode");
    const fourWordsMode = document.getElementById("fourWordsMode");
    const fiveWordsMode = document.getElementById("fiveWordsMode");

    if (level < 8) {
        threeWordsMode.disabled = true;
        fourWordsMode.disabled = true;
        fiveWordsMode.disabled = true;
        document.querySelector('input[name="mode"][value="twoWords"]').checked = true;
    } else if (level < 16) {
        threeWordsMode.disabled = false;
        fourWordsMode.disabled = true;
        fiveWordsMode.disabled = true;
    } else if (level < 20) {
        threeWordsMode.disabled = false;
        fourWordsMode.disabled = false;
        fiveWordsMode.disabled = true;
    } else {
        threeWordsMode.disabled = false;
        fourWordsMode.disabled = false;
        fiveWordsMode.disabled = false;
    }
});