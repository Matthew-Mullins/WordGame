const url = "https://api.dictionaryapi.dev/api/v2/entries/en/";
// const result = document.getElementById("inputWord");
const txtWordsFound = document.getElementById("txtUniqueWordsFound");
const inpWord = document.getElementById("inpWord");
const btn = document.getElementById("btnSubmit");
const wordsTable = document.getElementById("tblWordsBody");
const wordGameLocalStorageKey = "WordGameLocalStorageKey";

var localStorageList = load_localStorage();
populate_tblWordsBody(localStorageList);
populate_txtUniqueWordsFound(localStorageList);
// localStorage.clear(wordGameLocalStorageKey);

function load_localStorage() {
    var localStorageList = JSON.parse(localStorage.getItem(wordGameLocalStorageKey));
    return localStorageList;
}

function update_localStorage(localStorageList) {
    localStorage.setItem(wordGameLocalStorageKey, JSON.stringify(localStorageList));
}

function populate_tblWordsBody(localStorageList) {
    if (localStorageList === null) { return; }
    wordsTable.innerHTML = "";
    var tr = "";
    localStorageList = localStorageList.sort(function(a, b){
        let dateA = new Date(a);
        let dateB = new Date(b);

        return dateA - dateB;
    }).reverse();
    localStorageList.forEach(element => {
        tr += '<tr>';
        tr += `<td>${element[0]}</td><td>${element[1]}</td>`;
        tr += '</tr>';
    });
    wordsTable.innerHTML += tr;
}

function populate_txtUniqueWordsFound(localStorageList) {
    var uniqueWordsFound = 0
    if (localStorageList !== null) {
        uniqueWordsFound = localStorageList.length;
    }
    txtWordsFound.innerHTML = `Unique Words Found: ${uniqueWordsFound}!`
}

async function submit() {
    //Get input word
    let inWord = inpWord.value;
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

    //Populate Table
    populate_tblWordsBody(localStorageList);

    //Populate Word Count
    populate_txtUniqueWordsFound(localStorageList);

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