/* GLOBAALSED MUUTUJAD */

var tableWidth, tableHeight; // Kasutaja poolt valitud ruudustiku laius ja kõrgus
var arr, arrDup; // 2D massiiv rakuolekute hoiustamiseks ning selle duplikaatmassiiv
var cell; // Kasutusel tabelilahtrite
var simulationState = 0; // Simulatsiooni olek, 0 - pausil, 1 - töötab
var gridState = 1; // Ruudustiku sisse-välja lülitatus, 0 - väljas, 1 - sees
var simulationSpeed; // Simulatsioonikiirus
var mouseIsDown = false; // Näitab, kas hiire vasak- või paremnuppu hoitakse peal või mitte, false - ei, true - jah
var currentGeneration; // Parasjagu kuvatav generatsioon


/* SÜNDMUSED (EVENTS) */

window.onload = function () { // Brauseris veebilehe esmalaadimisel esile kutsutavad funktsioonid
    newGrid();
    updateSlider(3);
}
// Järgnevad spetsiifilisi elemente mõjutades vastavate funktsioonide esilekutsujad
window.addEventListener("resize", windowResized);
document.getElementById("tableHeight").addEventListener("input", newGrid);
document.getElementById("tableWidth").addEventListener("input", newGrid);
document.getElementById("stepButton").addEventListener("click", nextGeneration);
document.getElementById("playButton").addEventListener("click", runSimulation);
document.getElementById("pauseButton").addEventListener("click", pauseSimulation);
document.getElementById("clearButton").addEventListener("click", clearTable);
document.getElementById("randomizeButton").addEventListener("click", randomizeArray);
document.getElementById("gridButton").addEventListener("click", gridSwitch);
document.getElementById("gameOfLifeGrid").addEventListener("mouseup", function () {
    mouseIsDown = false;
});
document.getElementById("gameOfLifeGrid").addEventListener("contextmenu", function (e) {
    e.preventDefault();
});
document.getElementById("colorPicker").addEventListener("input", function () {
    colorTable();
});
 

/* FUNKTSIOONID */

function colorTable() { // Elusrakkude värvuse muutmine
    var cellColor = document.getElementsByTagName("td"); // Lahtrielementide valimine nimistuna
    for (var i = 0; i < cellColor.length; i++) { // Terve nimistu läbimine tsükliga
        if (cellColor[i].getAttribute("class") == "live") { // Kui elusrakk
            cellColor[i].style.backgroundColor = document.getElementById("colorPicker").value; // Muuda värvi
        } else { // Kui surnud rakk
            cellColor[i].style.backgroundColor = 'transparent'; // Muuda läbipaistvaks
        }
    }
}

function getSizeInput(id) { // Vajadusel kasutaja valitud tabeli kõrguse ja laiuse parandamine (Kui liiga väike või liiga suur)
    var input = document.getElementById(id);
    var n = Number(input.value); // Muudame stringi arv-tüübiks
    if (n < 3) {
        input.value = 3;
        /* "window[id]" ehk "id"-na funktsiooni sisenenud väärtuse nimeline muutuja, seega kas 
        tableHeight või tableWidth väärtustamine miinimumile, juhul kui sisestati madalam väärtus */
        window[id] = 3;
    } else if (n > 50) {
        input.value = 50;
        window[id] = 50; // vt eelmist selgitust - sama, aga kõrgema väärtuse korral
    } else {
        window[id] = n;
    }
}

function windowResized() { // Kui tuvastatakse brauseri akna suuruse muutmine
    var vw = window.innerWidth; // Vaateava laius (Viewport width)
    var vh = window.innerHeight; // vaateava kõrgus (Viewport height)
    if (vw > vh) {
        document.getElementById("gameOfLifeGrid").style.height = 0.6 * vh + "px";
        if (parseInt(document.getElementById("gameOfLifeGrid").style.height) / tableHeight * tableWidth > 0.8 * vw) {
            document.getElementById("gameOfLifeGrid").style.width = 0.8 * vw + "px";
            document.getElementById("gameOfLifeGrid").style.height = parseInt(document.getElementById("gameOfLifeGrid").style.width) / tableWidth * tableHeight + "px";
        } else {
            document.getElementById("gameOfLifeGrid").style.width = parseInt(document.getElementById("gameOfLifeGrid").style.height) / tableHeight * tableWidth + "px";
        }
    } else if (vw <= vh) { // Kui vaateava laius on väiksemvõrdne vaateava kõrgusega võrreldes
        document.getElementById("gameOfLifeGrid").style.width = 0.8 * vw + "px";
        if (parseInt(document.getElementById("gameOfLifeGrid").style.width) / tableWidth * tableHeight > 0.6 * vh) {
            document.getElementById("gameOfLifeGrid").style.height = 0.6 * vh + "px";
            document.getElementById("gameOfLifeGrid").style.width = parseInt(document.getElementById("gameOfLifeGrid").style.height) / tableHeight * tableWidth + "px";
        } else {
            document.getElementById("gameOfLifeGrid").style.height = parseInt(document.getElementById("gameOfLifeGrid").style.width) / tableWidth * tableHeight + "px";
        }
    }
}

function clearTable() { // Tabeli täitmine surnud rakkudega
    for (var i = 1; i < tableHeight + 1; i++) {
        for (var j = 1; j < tableWidth + 1; j++) {
            arr[i][j] = 0; // Väärtustame ka massivis kõik nulliks
            document.getElementById(i + "-" + j).setAttribute("class", "dead");
        }
    }
    pauseSimulation(); // Simulatsioon pausile
    updateCounter(0); // Generatsiooni loendur nulli
    colorTable(); // Lahtrid läbipaistvaks
}

function newGrid() {
    pauseSimulation(); // Simulatsioon pausile
    getSizeInput("tableHeight");
    getSizeInput("tableWidth");
    createEmptyArray(); // Tühja 2D massiivi loomine
    $("tr").remove();
    /* Tabeliridade (sh <td> ehk lahtrite) eemaldus jQuery
       abil, kuid <table> element jääb alles, et sellesse uued elemendid panna*/
    createTable();
    windowResized();
    if (gridState == 1) {
        /* Inverteerime ruudustiku sisse-/väljalülitatuse olekut, et 
        järgnev gridSwitch() toimiks vahetaja asemel uuendajana. Paraku vajalik, 
        et sisselülitatud oleku puhul tabelisse ruudustik joonistataks.*/
        gridState = 0;
    } else {
        gridState = 1;
    }
    gridSwitch();
    updateCounter(0); // "Genereeri" vajutades generatsioonid nulli
}

function gridSwitch() {
    var cellElementsArray = document.getElementsByTagName("td"); // Kõigi lahtrielementide käsitlemine nimistuna
    if (gridState == 1) {
        gridState = 0;
        for (var i = 0; i < cellElementsArray.length; i++) { // Muudame kõiki nimistu lahtreid
            cellElementsArray[i].style.border = "none"; // Äärise eemaldamine
        }
    } else if (gridState == 0) {
        gridState = 1;
        for (var i = 0; i < cellElementsArray.length; i++) {
            cellElementsArray[i].style.border = "1px solid black"; // 1 piksli laiune must ääris
        }
    }
}

function createEmptyArray() { // 2D array alternatiiv, kuna 2D massiivi andmetüübina ei eksisteeri
    arr = [];
    for (var i = 0; i < tableHeight + 2; i++) {
        arr[i] = [];
        for (var j = 0; j < tableWidth + 2; j++) {
            arr[i][j] = 0;
        }
    }
}

function randomizeArray() { // Juhuasetuse genereerimine
    pauseSimulation();
    for (var i = 0; i < tableHeight + 2; i++) {
        for (var j = 0; j < tableWidth + 2; j++) {
            arr[i][j] = Math.round(Math.random()); // Genereerime suvaliselt 0 või 1
            if (i >= 1 && i < tableHeight + 1 && j >= 1 && j < tableWidth + 1) {
                if (arr[i][j] == 0) {
                    document.getElementById(i + "-" + j).setAttribute("class", "dead");
                } else {
                    document.getElementById(i + "-" + j).setAttribute("class", "live");
                }
            }
        }
    }
    updateCounter(0);
    colorTable();
}

function runSimulation() { // Simulatsiooni käivitamise esimene osa
    if (simulationState != 1) { // Tee ainult siis, kui simulatsioon juba ei käi
        simulationState = 1;
        runSimulation2();
    }
}

function runSimulation2() { // Simulatsiooni käivitamise teine osa
    if (simulationState == 1) { // Kontrolli, et vahepeal poleks pandud pausile
        nextGeneration(); // Liigu edasi ühe generatsiooni võrra
    } else {
        return; // Naaseme funktsioonist, et pausile pannes ja uuesti käivitades ei käivituks funktsioon mitmekordselt
    }
    setTimeout(runSimulation2, simulationSpeed); // Tekita simulationSpeed väärtuse pikkune paus ja sisene samasse funktsiooni uuesti
}

function pauseSimulation() { // Simulatsiooni peatamine
    simulationState = 0;
}

function nextGeneration() { // Ühe generatsiooni võrra edasi liikumine
    /* Järgnevad kaks vajalikud, et joonistamine toimiks kogu aeg*/
    createImaginaryEdges();
    fillDuplicateArray();
    updateCounter(1); // Uuenda loendurit liites juurde 1
    for (var i = 1; i < tableHeight + 1; i++) {
        for (var j = 1; j < tableWidth + 1; j++) {
            count = countNeighbors(i, j); // Elusate naabrite loendamine
            applyRules(i, j, count); // Reeglite teostamine
        }
    }
    copyFromDuplicate(); // Kopeerime duplikaatmassiivi väärtused originaali tagasi
    for (var i = 1; i < tableHeight + 1; i++) {
        for (var j = 1; j < tableWidth + 1; j++) {
            if (arr[i][j] == 0) {
                document.getElementById(i + "-" + j).setAttribute("class", "dead");
            } else {
                document.getElementById(i + "-" + j).setAttribute("class", "live");
            }
        }
    }
    colorTable();
}

function createTable() { // Tabeli lahtrielementide loomine ja tabelielemendiga ühendamine
    for (var i = 1; i < tableHeight + 1; i++) {
        var tr = document.createElement("tr"); // Loome uue rea, kõik identsed, sest neid pöördumisel ei kasuta
        for (var j = 1; j < tableWidth + 1; j++) {
            cell = document.createElement("td"); // Reealselt nähtav tabelilahter ehk rakk, mitte lihtsalt masssiivielement
            cell.setAttribute("id", i + "-" + j);
            if (arr[i][j] == 0) { // Kui rakk koordinaatidega (i; j) on surnud
                cell.setAttribute("class", "dead"); // Seame atribuudi "klass" väärtuseks "surnud"
            } else {
                cell.setAttribute("class", "live"); // Seame atribuudi "klass" väärtuseks "elus"
            }
            cell.addEventListener("mousedown", function (e) {
                e.preventDefault(); // takistab "haaramise" kui lohistamist alustatakse raku servalt
                mouseIsDown = true;
            });
            cell.onmousedown = cellDragged; // Et joonistada/kustutada ka see lahter, millelt klikiga lohistamist alustatakse
            cell.onmouseover = cellDragged; // Lohistamise jätkamine vasak- või parem-klikiga
            cell.onclick = cellClicked; // Vasak-klikk
            cell.oncontextmenu = cellClicked; // Parem-klikk
            tr.appendChild(cell);
        }
        document.getElementById("gameOfLifeGrid").appendChild(tr);
    }
}

function cellDragged(event) { // Hiire kursoriga lohistamine 
    var rowcol = this.id.split("-"); // Eralda lahtri id (nt 5-9) reaks (rowcol[0] = 5) ja tulbaks (rowcol[1] = 9)
    var rowcol_row = rowcol[0];
    var rowcol_col = rowcol[1];
    if (mouseIsDown && event.which == 1) { // Kui lohistatakse vasak-klikiga
        this.setAttribute("class", "live");
        arr[rowcol_row][rowcol_col] = 1;
    } else if (mouseIsDown && event.which == 3) { // Kui lohistatakse parem-klikiga
        this.setAttribute("class", "dead");
        arr[rowcol_row][rowcol_col] = 0;
    }
    colorTable();
}

function cellClicked(event) { // Hiire kursoriga klikkimine
    var rowcol = this.id.split("-");
    var rowcol_row = rowcol[0];
    var rowcol_col = rowcol[1];
    if (event.which == 1) { // Vasak-klikk
        this.setAttribute("class", "live");
        arr[rowcol_row][rowcol_col] = 1;
    } else if (event.which == 3) { // Parem-klikk
        this.setAttribute("class", "dead");
        arr[rowcol_row][rowcol_col] = 0;
    }
    colorTable();
}

function countNeighbors(row, col) {
    var count = 0; // Elusate naaberrakkude arv
    if (arr[row - 1][col - 1] == 1) {
        count++;
    }
    if (arr[row - 1][col] == 1) {
        count++;
    }
    if (arr[row - 1][col + 1] == 1) {
        count++;
    }
    if (arr[row][col - 1] == 1) {
        count++;
    }
    if (arr[row][col + 1] == 1) {
        count++;
    }
    if (arr[row + 1][col - 1] == 1) {
        count++;
    }
    if (arr[row + 1][col] == 1) {
        count++;
    }
    if (arr[row + 1][col + 1] == 1) {
        count++;
    }
    return count; // Tagastame saadud summa
}

function applyRules(row, col, count) { // Game of Life reeglite rakendamine
    if (arr[row][col] == 1) { // Kui tegemist elusrakuga
        if (count < 2) { // Elusnaabreid vähem kui 2?
            arrDup[row][col] = 0;
        } else if (count > 3) { // Elusnaabreid rohkem kui 3?
            arrDup[row][col] = 0;
        } else if (count == 2 || count == 3) { // Elusnaabreid 2 või 3?
            arrDup[row][col] = 1;
        }
    } else if (arr[row][col] == 0) { // Kui tegemist surnud rakuga
        if (count == 3) { // Elusnaabreid täpselt 3?
            arrDup[row][col] = 1;
        }
    }
}

function createImaginaryEdges() { // Tabeli ümber oleva nähtamatu lahtrite kihi loomine
    /* Nähtamatute külgede väärtuste seadmine (mitte nähtamatute) vastaskülgede põhjal*/
    for (var i = 1; i < tableHeight + 1; i++) {
        arr[i][0] = arr[i][tableWidth];
        arr[i][tableWidth + 1] = arr[i][1];
    }
    for (var j = 1; j < tableWidth + 1; j++) {
        arr[0][j] = arr[tableHeight][j];
        arr[tableHeight + 1][j] = arr[1][j];
    }
    /* Nähtamatute nurkade väärtuste seadmine (mitte nähtamatute) vastasnurkade põhjal */
    arr[0][0] = arr[tableHeight][tableWidth];
    arr[tableHeight + 1][0] = arr[1][tableWidth];
    arr[0][tableWidth + 1] = arr[tableHeight][1];
    arr[tableHeight + 1][tableWidth + 1] = arr[1][1];
}

function fillDuplicateArray() { // Duplikaatmassiivi loomine 
    arrDup = [];
    for (var i = 0; i < tableHeight + 2; i++) {
        arrDup[i] = [];
        for (var j = 0; j < tableWidth + 2; j++) {
            arrDup[i][j] = arr[i][j]; //Olekute kopeerimine tavamassiivist duplikaatmassiivi
        }
    }
}

function copyFromDuplicate() { // Duplikaatmassiivist tavamassiivi tagasi kopeerimine
    for (var i = 0; i < tableHeight + 2; i++) {
        for (var j = 0; j < tableWidth + 2; j++) {
            arr[i][j] = arrDup[i][j];
        }
    }
}

function updateCounter(updateType) { // Generatsiooniloenduri uuendamine
    if (updateType == 0) { // Kui funk. antakse uuendustüüp 0, siis nullimine
        currentGeneration = 0;
    } else if (updateType == 1) { // Kui 1, siis liidame ühe
        currentGeneration++;
    }
    document.getElementById("generationValue").innerHTML = currentGeneration;
}

function updateSlider(sliderPosition) { // Liuguri asendi põhjal kiiruse muutmine
    if (sliderPosition == 0) { // Slaideri vasakpoolne punkt
        simulationSpeed = 600; // Väikseim simul. kiirus
    } else if (sliderPosition == 1) {
        simulationSpeed = 500;
    } else if (sliderPosition == 2) {
        simulationSpeed = 400;
    } else if (sliderPosition == 3) {
        simulationSpeed = 300;
    } else if (sliderPosition == 4) {
        simulationSpeed = 200;
    } else if (sliderPosition == 5) {
        simulationSpeed = 100;
    } else if (sliderPosition == 6) { // Slaideri parempoolne punkt
        simulationSpeed = 1; // Suurim simul. kiirus
    }
    document.getElementById("sliderValue").innerHTML = "Kiirus: " + sliderPosition; // Kiiruse kuvamine liuguri kohal
}

/* 
JÄRGNEB MODAALAKNA KOOD 
Kood pärineb videoallikast "Build a Popup With JavaScript" aadressil
https://youtu.be/MBaw_6cPmAw.
*/

const openModalButtons = document.querySelectorAll('[data-modal-target]')
const closeModalButtons = document.querySelectorAll('[data-close-button]')
const overlay = document.getElementById('overlay')

openModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = document.querySelector(button.dataset.modalTarget)
        openModal(modal)
    })
})

overlay.addEventListener('click', () => {
    const modals = document.querySelectorAll('.modal.active')
    modals.forEach(modal => {
        closeModal(modal)
    })
})

closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('.modal')
        closeModal(modal)
    })
})

function openModal(modal) {
    if (modal == null) return
    modal.classList.add('active')
    overlay.classList.add('active')
}

function closeModal(modal) {
    if (modal == null) return
    modal.classList.remove('active')
    overlay.classList.remove('active')
}
