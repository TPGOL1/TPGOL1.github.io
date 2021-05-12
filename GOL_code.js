/* GLOBAALSED MUUTUJAD */
var tableWidth, tableHeight; // Kasutaja poolt valitud ruudustiku laius ja kõrgus
var arr, arrDup;
var cell;
var simulationState = 0;
var gridState = 1;
var simulationSpeed;
var mouseIsDown = false;
var currentGeneration;

window.onload = function() {
    newGrid();
    updateSlider(3);
}
window.addEventListener("resize", windowResized);
document.getElementById("tableHeight").addEventListener("input", newGrid);
document.getElementById("tableWidth").addEventListener("input", newGrid);
document.getElementById("stepButton").addEventListener("click", nextGeneration);
document.getElementById("playButton").addEventListener("click", runSimulation);
document.getElementById("pauseButton").addEventListener("click", pauseSimulation);
document.getElementById("clearButton").addEventListener("click", clearTable);
document.getElementById("randomizeButton").addEventListener("click", randomizeArray);
document.getElementById("gridButton").addEventListener("click", gridSwitch);
document.getElementById("gameOfLifeGrid").addEventListener("mouseup", function() {
    mouseIsDown = false;
});
document.getElementById("gameOfLifeGrid").addEventListener("contextmenu", function(e) {
    e.preventDefault();
});
document.getElementById("colorPicker").addEventListener("input", function() {
    colorTable();
});

function colorTable() {
    var cellColor = document.getElementsByTagName("td");
    for (var i = 0; i < cellColor.length; i++) {
        if (cellColor[i].getAttribute("class") == "live") {
            cellColor[i].style.backgroundColor = document.getElementById("colorPicker").value;
        } else {
            cellColor[i].style.backgroundColor = 'transparent';
        }
    }
}

function getSizeInput(id) {
    var input = document.getElementById(id);
    var n = Number(input.value); // Muudame stringi arv-tüübiks
    if (n < 3) {
        input.value = 3;
        /* "window[id]" ehk "id"-na funktsiooni sisenenud väärtuse nimeline
        muutuja, teisisõnu kas tableHeight või tableWidth väärtustamine
        miinimumile, juhul kui sisestati madalam väärtus */
        window[id] = 3;
    } else if (n > 50) {
        input.value = 50;
        window[id] = 50; // vt eelmist selgitust - siin sama, kõrgema väärtuse korral
    } else {
        window[id] = n;
    }
}

function windowResized() {
    var vw = window.innerWidth; // Viewport width
    var vh = window.innerHeight; // Viewport height
    if (vw > vh) {
        document.getElementById("gameOfLifeGrid").style.height = 0.6 * vh + "px";
        if (parseInt(document.getElementById("gameOfLifeGrid").style.height) / tableHeight * tableWidth > 0.8 * vw) {
            document.getElementById("gameOfLifeGrid").style.width = 0.8 * vw + "px";
            document.getElementById("gameOfLifeGrid").style.height = parseInt(document.getElementById("gameOfLifeGrid").style.width) / tableWidth * tableHeight + "px";
        } else {
            document.getElementById("gameOfLifeGrid").style.width = parseInt(document.getElementById("gameOfLifeGrid").style.height) / tableHeight * tableWidth + "px";
        }
    } else if (vw <= vh) {
        document.getElementById("gameOfLifeGrid").style.width = 0.8 * vw + "px";
        if (parseInt(document.getElementById("gameOfLifeGrid").style.width) / tableWidth * tableHeight > 0.6 * vh) {
            document.getElementById("gameOfLifeGrid").style.height = 0.6 * vh + "px";
            document.getElementById("gameOfLifeGrid").style.width = parseInt(document.getElementById("gameOfLifeGrid").style.height) / tableHeight * tableWidth + "px";
        } else {
            document.getElementById("gameOfLifeGrid").style.height = parseInt(document.getElementById("gameOfLifeGrid").style.width) / tableWidth * tableHeight + "px";
        }
    }
}

function clearTable() {
    for (var i = 1; i < tableHeight + 1; i++) {
        for (var j = 1; j < tableWidth + 1; j++) {
            arr[i][j] = 0; // Väärtustame kõik nulliks
            document.getElementById(i + "-" + j).setAttribute("class", "dead");
        }
    }
    pauseSimulation();
    updateCounter(0);
    colorTable();
}

function newGrid() {
    pauseSimulation();
    getSizeInput("tableHeight");
    getSizeInput("tableWidth");
    createEmptyArray();
    $("tr").remove(); /* Tabeliridade (sh <td> ehk lahtrite) eemaldus jQuery
    abil, kuid <table> element jääb alles, et sellesse uued andmed panna*/
    createTable();
    windowResized();
    if (gridState == 1) { /* Muudame hetkest ruudustiku sisse-/väljalülitatuse
        olekut, et järgnev gridSwitch() toimiks vahetaja asemel uuendajana. */
        gridState = 0;
    } else {
        gridState = 1;
    }
    gridSwitch();
    updateCounter(0); // "Genereeri" vajutades generatsioonid nulli
}

function gridSwitch() {
    var cellElementsArray = document.getElementsByTagName("td");
    if (gridState == 1) {
        gridState = 0;
        for (var i = 0; i < cellElementsArray.length; i++) {
            cellElementsArray[i].style.border = "none";
        }
    } else if (gridState == 0) {
        gridState = 1;
        for (var i = 0; i < cellElementsArray.length; i++) {
            cellElementsArray[i].style.border = "1px solid black";
        }
    }
}

function createEmptyArray() {
    arr = [];
    for (var i = 0; i < tableHeight + 2; i++) {
        arr[i] = [];
        for (var j = 0; j < tableWidth + 2; j++) {
            arr[i][j] = 0;
        }
    }
}

function randomizeArray() {
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

function runSimulation() {
    if (simulationState != 1) {
        simulationState = 1;
        runSimulation2();
    }
}

function runSimulation2() {
    if (simulationState == 1) {
        nextGeneration();
    } else {
        return; // Naaseme funktsioonist, et pausile pannes ja uuesti käivitades ei käivituks sama uuesti ehk topelt
    }
    setTimeout(runSimulation2, simulationSpeed);
}

function pauseSimulation() {
    simulationState = 0;
}

function nextGeneration() {
    /* Järgnevad kaks vajalikud, et joonistamine toimiks kogu aeg*/
    createImaginaryEdges();
    fillDuplicateArray();
    updateCounter(1);
    for (var i = 1; i < tableHeight + 1; i++) {
        for (var j = 1; j < tableWidth + 1; j++) {
            count = countNeighbors(i, j);
            applyRules(i, j, count);
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

function createTable() {
    for (var i = 1; i < tableHeight + 1; i++) {
        var tr = document.createElement("tr"); // Loome uue rea, kõik identsed, sest neid pöördumisel ei kasuta
        for (var j = 1; j < tableWidth + 1; j++) {//
            cell = document.createElement("td"); // Reealselt nähtav rakk, mitte lihtsalt masssiivielement
            cell.setAttribute("id", i + "-" + j);
            if (arr[i][j] == 0) {
                cell.setAttribute("class", "dead");
            } else {
                cell.setAttribute("class", "live");
            }
            cell.addEventListener("mousedown", function(e) {
                e.preventDefault(); // takistab "haaramise" kui lohistamist alustatakse raku servalt
                mouseIsDown = true;
            });
            cell.onmousedown = cellDragged;
            cell.onmouseover = cellDragged; // Lohistamine vasak- või parem-klikiga
            cell.onclick = cellClicked; // Vasak-klikk
            cell.oncontextmenu = cellClicked; // Parem-klikk
            tr.appendChild(cell);
        }
        document.getElementById("gameOfLifeGrid").appendChild(tr);
    }
}

function cellDragged(event) {
    var rowcol = this.id.split("-");
    var rowcol_row = rowcol[0];
    var rowcol_col = rowcol[1];
    if (mouseIsDown && event.which == 1) {
        this.setAttribute("class", "live");
        arr[rowcol_row][rowcol_col] = 1;
    } else if (mouseIsDown && event.which == 3) {
        this.setAttribute("class", "dead");
        arr[rowcol_row][rowcol_col] = 0;
    }
    colorTable();
}

function cellClicked(event) {
    var rowcol = this.id.split("-");
    var rowcol_row = rowcol[0];
    var rowcol_col = rowcol[1];
    if (event.which == 1) {
        this.setAttribute("class", "live");
        arr[rowcol_row][rowcol_col] = 1;
    } else if (event.which == 3) {
        this.setAttribute("class", "dead");
        arr[rowcol_row][rowcol_col] = 0;
    }
    colorTable();
}

function countNeighbors(row, col) {
    var count = 0;
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
    return count;
}

function applyRules(row, col, count) {
    if (arr[row][col] == 1) {
        if (count < 2) {
            arrDup[row][col] = 0;
        } else if (count > 3) {
            arrDup[row][col] = 0;
        } else if (count == 2 || count == 3) {
            arrDup[row][col] = 1;
        }
    } else if (arr[row][col] == 0) {
        if (count == 3) {
            arrDup[row][col] = 1;
        }
    }
}

function createImaginaryEdges() {
    for (var i = 1; i < tableHeight + 1; i++) {
        arr[i][0] = arr[i][tableWidth];
        arr[i][tableWidth + 1] = arr[i][1];
    }
    for (var j = 1; j < tableWidth + 1; j++) {
        arr[0][j] = arr[tableHeight][j];
        arr[tableHeight + 1][j] = arr[1][j];
    }
    arr[0][0] = arr[tableHeight][tableWidth];
    arr[tableHeight + 1][0] = arr[1][tableWidth];
    arr[0][tableWidth + 1] = arr[tableHeight][1];
    arr[tableHeight + 1][tableWidth + 1] = arr[1][1];
}

function fillDuplicateArray() {
    arrDup = [];
    for (var i = 0; i < tableHeight + 2; i++) {
        arrDup[i] = [];
        for (var j = 0; j < tableWidth + 2; j++) {
            arrDup[i][j] = arr[i][j];
        }
    }
}

function copyFromDuplicate() {
    for (var i = 0; i < tableHeight + 2; i++) {
        for (var j = 0; j < tableWidth + 2; j++) {
            arr[i][j] = arrDup[i][j];
        }
    }
}

function updateCounter(updateType) {
    if (updateType == 0) { // Kui funk. antakse 0, siis nullimine
        currentGeneration = 0;
    } else if (updateType == 1) { // Kui 1, siis +1
        currentGeneration++;
    }
    document.getElementById("generationValue").innerHTML = currentGeneration;
}

function updateSlider(sliderPosition) {
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
    document.getElementById("sliderValue").innerHTML = "Kiirus: " + sliderPosition;
}

/* INFOAKNA KOOD */

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
