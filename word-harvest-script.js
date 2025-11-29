let letters = [];
let remainingLetters = 0;
let usedWords = [];
let moveHistory = [];
let generatedWords = [];
let hintIndex = 0;
let currentMode = "training";
let completedLevels = JSON.parse(localStorage.getItem("completedLevels")) || [];
let timerInterval = null;
let secondsElapsed = 0;
let soundEnabled = true; // По умолчанию звук включён

// Список всех уровней
const allLevels = [
    { value: 5, text: "Уровень 1 (5 букв)" },
    { value: 6, text: "Уровень 2 (6 букв)" },
    { value: 7, text: "Уровень 3 (7 букв)" },
    { value: 8, text: "Уровень 4 (8 букв)" },
    { value: 9, text: "Уровень 5 (9 букв)" },
    { value: 10, text: "Уровень 6 (10 букв)" },
    { value: 11, text: "Уровень 7 (11 букв)" },
    { value: 12, text: "Уровень 8 (12 букв)" },
    { value: 13, text: "Уровень 9 (13 букв)" },
    { value: 14, text: "Уровень 10 (14 букв)" },
    { value: 15, text: "Уровень 11 (15 букв)" },
    { value: 16, text: "Уровень 12 (16 букв)" },
    { value: 17, text: "Уровень 13 (17 букв)" },
    { value: 18, text: "Уровень 14 (18 букв)" },
    { value: 19, text: "Уровень 15 (19 букв)" },
    { value: 20, text: "Уровень 16 (20 букв)" },
    { value: 21, text: "Уровень 17 (21 буква)" },
    { value: 22, text: "Уровень 18 (22 буквы)" },
    { value: 23, text: "Уровень 19 (23 буквы)" },
    { value: 24, text: "Уровень 20 (24 буквы)" }
];

// Отображаем буквы на экране
function displayLetters() {
    const lettersElement = document.getElementById("letters");
    lettersElement.textContent = letters.join(" ");
}

// Обновляем список уровней в зависимости от режима
function updateLevelSelect() {
    const levelSelect = document.getElementById("level");
    const resetButton = document.getElementById("resetProgressButton");
    levelSelect.innerHTML = "";

    if (currentMode === "training") {
        allLevels.forEach(level => {
            const option = document.createElement("option");
            option.value = level.value;
            option.textContent = level.text;
            levelSelect.appendChild(option);
        });
        resetButton.style.display = "none";
    } else {
        let maxAccessibleLevel = completedLevels.length > 0 ? Math.max(...completedLevels) + 1 : 5;
        allLevels.forEach(level => {
            if (level.value <= maxAccessibleLevel) {
                const option = document.createElement("option");
                option.value = level.value;
                option.textContent = level.text;
                levelSelect.appendChild(option);
            }
        });
        resetButton.style.display = "inline-block";
    }
    updateModeAvailability();
}

// Проверка слова
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
            confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
            if (soundEnabled) {
                document.getElementById("victorySound").play();
            }
            if (currentMode === "game") {
                clearInterval(timerInterval);
                const currentLevel = parseInt(document.getElementById("level").value);
                if (!completedLevels.includes(currentLevel)) {
                    completedLevels.push(currentLevel);
                    localStorage.setItem("completedLevels", JSON.stringify(completedLevels));
                    updateLevelSelect();
                }
            }
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

// Выбор случайного слова из словаря
function getRandomWord(letterCount) {
    const suitableWords = dictionary.filter(word => word.length === letterCount);
    if (suitableWords.length === 0) {
        document.getElementById("message").textContent = "В словаре нет слов с таким количеством букв!";
        return null;
    }
    return suitableWords[Math.floor(Math.random() * suitableWords.length)];
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

// Запуск и остановка таймера
function startTimer() {
    secondsElapsed = 0;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        secondsElapsed++;
        const minutes = Math.floor(secondsElapsed / 60);
        const seconds = secondsElapsed % 60;
        document.getElementById("timer").textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

// Сброс прогресса
function resetProgress() {
    completedLevels = [];
    localStorage.setItem("completedLevels", JSON.stringify(completedLevels));
    updateLevelSelect();
    document.getElementById("message").textContent = "Прогресс сброшен! Начинайте с уровня 1.";
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
    
    if (currentMode === "game") {
        startTimer();
    } else {
        document.getElementById("timer").textContent = "00:00";
    }
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

// Показать правильный ответ
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
            <p>Если букв не осталось — победа! В тренировочном режиме все уровни доступны сразу. В игровом режиме уровни открываются поэтапно: начинаете с уровня 5, следующий доступен только после прохождения предыдущего.</p>
            <p>Подсказка: показывает по одной букве первого слова. Правильный ответ: открывает все слова. Отмена хода: возвращает последнее слово.</p>
            <p>Важно: можно составлять любые слова, не обязательно те, что в ответе, главное — очистить поле.</p>
            <p>Уровни: от 5 до 24 букв. Режимы: буквы из 2 слов доступны с уровня 5, из 3 слов — с уровня 8, из 4 слов — с уровня 16, из 5 слов — с уровня 20.</p>
        `;
        rulesButton.textContent = "Скрыть правила";
    } else {
        rulesContainer.style.display = "none";
        rulesButton.textContent = "Показать правила";
    }
}

// Обновление доступности выбора количества слов
function updateModeAvailability() {
    const level = parseInt(document.getElementById("level").value);
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
}

// Инициализация
document.getElementById("startButton").addEventListener("click", startGame);
document.getElementById("checkButton").addEventListener("click", checkWord);
document.getElementById("undoButton").addEventListener("click", undoMove);
document.getElementById("hintButton").addEventListener("click", showHint);
document.getElementById("showAnswerButton").addEventListener("click", showAnswer);
document.getElementById("rulesButton").addEventListener("click", toggleRules);
document.getElementById("resetProgressButton").addEventListener("click", resetProgress);

// Управление звуком
document.getElementById("soundToggle").addEventListener("change", function() {
    soundEnabled = this.checked;
});

// Переключение режимов
document.querySelectorAll('input[name="gameMode"]').forEach(radio => {
    radio.addEventListener("change", function() {
        currentMode = this.value;
        updateLevelSelect();
    });
});

// Обновление уровней при смене уровня
document.getElementById("level").addEventListener("change", updateModeAvailability);

// Инициализируем список уровней при загрузке
updateLevelSelect();