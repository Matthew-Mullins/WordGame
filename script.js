const url = "https://api.dictionaryapi.dev/api/v2/entries/en/";
// const result = document.getElementById("inputWord");
const txtWordsFound = document.getElementById("txtUniqueWordsFound");
const inpWord = document.getElementById("inpWord");
const btn = document.getElementById("btnSubmit");

const txtWordLength3 = document.getElementById("txtWordLength3");
const txtWordLength4 = document.getElementById("txtWordLength4");
const txtWordLength5 = document.getElementById("txtWordLength5");
const txtWordLength6 = document.getElementById("txtWordLength6");

const txtCurrentLevel = document.getElementById("txtCurrentLevel");
const txtNextLevel = document.getElementById("txtNextLevel");
const progLevelBar = document.getElementById("progLevelBar");

const wordsTable = document.getElementById("tblWordsBody");
const wordGameLocalStorageKey = "WordGameLocalStorageKey";

const levelDict = {
    'levelBreaks': [
        0,
        10,
        50,
        100,
        250,
        500,
        1000
    ],
    0: {
        'title': 'Kindergartener'
    },
    10: {
        'title': '5th Grader'
    },
    50: {
        'title': 'Novice'
    },
    100: {
        'title': 'Adept'
    },
    250: {
        'title': 'Expert'
    },
    500: {
        'title': 'Genius'
    },
    1000: {
        'title': 'Certified Genius'
    }
}

var localStorageList = load_localStorage();
load_statistics(localStorageList);
// localStorage.clear(wordGameLocalStorageKey);

function load_localStorage() {
    var localStorageList = JSON.parse(localStorage.getItem(wordGameLocalStorageKey));
    return localStorageList;
}
function update_localStorage(localStorageList) {
    localStorage.setItem(wordGameLocalStorageKey, JSON.stringify(localStorageList));
}

function load_statistics(localStorageList) {
    if (localStorageList === null) { return; }

    localStorageList = localStorageList.sort(function(a, b){
        let dateA = new Date(a);
        let dateB = new Date(b);

        return dateA - dateB;
    }).reverse();

    wordsTable.innerHTML = "";
    var wordsLength3 = 0
    var wordsLength4 = 0
    var wordsLength5 = 0
    var wordsLength6 = 0
    localStorageList.forEach(element => {
        var word = element[0]
        if (word.length <= 3) {
            wordsLength3 += 1;
        } else if (word.length === 4) {
            wordsLength4 += 1;
        } else if (word.length === 5) {
            wordsLength5 += 1;
        } else if (word.length >= 6) {
            wordsLength6 += 1;
        }
        add_to_tblWordsBody(word, element[1]);
    });

    txtWordLength3.innerHTML = wordsLength3.toString();
    txtWordLength4.innerHTML = wordsLength4.toString();
    txtWordLength5.innerHTML = wordsLength5.toString();
    txtWordLength6.innerHTML = wordsLength6.toString();

    populate_txtUniqueWordsFound(localStorageList);

    compute_levels(localStorageList);
}

function add_to_tblWordsBody(word, date) {
    var tr = "";
    tr += '<tr style="text-align: center;">';
    tr += `<td>${word.trim().toUpperCase()}</td><td>${date}</td>`;
    tr += '</tr>';
    wordsTable.innerHTML += tr;
}

function populate_txtUniqueWordsFound(localStorageList) {
    var uniqueWordsFound = 0
    if (localStorageList !== null) {
        uniqueWordsFound = localStorageList.length;
    }
    txtWordsFound.innerHTML = `${uniqueWordsFound}`
}

function compute_levels(localStorageList) {
    var wordCount = localStorageList.length;
    var currentLevel = 0;
    var nextLevel = 0;
    for (const level of levelDict.levelBreaks) {
        if (wordCount >= level) {
            currentLevel = level;
        }
        if (wordCount < level && nextLevel === 0) {
            nextLevel = level;
        }
    }

    txtCurrentLevel.innerHTML = levelDict[currentLevel].title;
    txtNextLevel.innerHTML = levelDict[nextLevel].title;

    var percentage = (((wordCount - currentLevel) / (nextLevel - currentLevel)) * 100).toFixed(2);
    progLevelBar.innerHTML = `${percentage}%`;
    progLevelBar.style.width = `${percentage}%`;
}

async function submit() {
    //Get input word
    let inWord = inpWord.value.trim().toUpperCase();
    if (inWord === "") { return; }

    //Load localStorageList
    var localStorageList = load_localStorage();

    //If word in list, return
    if (localStorageList !== null) {
        for (const item of localStorageList) {
            if (item[0] === inWord) { return; }
        }
    }

    //If word is not valid, return
    var isValid = false;
    const response = await fetch(`${url}${inWord}`)
        .then((response) => {
            if (response.status !== 200) {
                return null;
            }
            return response.json();
        }
        )
        .then((data) => {
            if (data === null) { return; }
            isValid = true;
        });
    if (!isValid) {
        //Show some sort of error about an invalid input.
        return;
    }

    //Add word to list
    if (localStorageList === null) {
        localStorageList = [[inWord, new Date().toLocaleString("en-US", {timeZone: "America/Edmonton"})]];
    } else {
        localStorageList.push([inWord, new Date().toLocaleString("en-US", {timeZone: "America/Edmonton"})]);
    }

    //Load Statistics
    load_statistics(localStorageList);

    //Update localStorage
    update_localStorage(localStorageList);

    //Reset input field
    inpWord.value = "";
}

inpWord.addEventListener("keyup", async (e) => {
    if (e.key === "Enter") {
        submit();
    }
});
btn.addEventListener("click", submit);