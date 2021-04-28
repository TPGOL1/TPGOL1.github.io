var tableWidth, tableHeight;
var table;
var i, j;
var arr, arrDup;
var count;
var cell;
var generation;
var simulationState = 0;
var gridState = 1;
var sliderAmount;
var vw, vh;
var mouseIsDown = false;

document.getElementById("stepButton").addEventListener("click", nextGeneration);
document.getElementById("playButton").addEventListener("click", runSimulation);
document.getElementById("pauseButton").addEventListener("click", pauseSimulation);
document.getElementById("gridButton").addEventListener("click", gridSwitch);
window.addEventListener("resize", windowResized);
document.getElementById("gameOfLifeGrid").addEventListener("mouseup", function(){mouseIsDown = false;});
document.getElementById("gameOfLifeGrid").addEventListener("contextmenu", function(e){e.preventDefault()});

function getSizeInput(id) {
    var input = document.getElementById(id);
    var n = Number(input.value);
    if (n < 3) {
        document.getElementById(id).value = 3;
        /* "window[id]" ehk "id"-na funktsiooni sisenenud väärtuse nimeline
        muutuja, teisisõnu kas tableHeight või tableWidth väärtustamine
        miinimumile, juhul kui sisestati madalam väärtus */
        window[id] = 3;
    } else if (n > 50) {
        document.getElementById(id).value = 50;
        window[id] = 50; // vt eelmist selgitust - siin sama, kõrgema väärtuse korral
    } else {
        window[id] = n;
    }
}

function windowResized() {
    vw = window.innerWidth; // Viewport width
    vh = window.innerHeight; // Viewport height
    if (vw > vh) {
        document.getElementById("gameOfLifeGrid").style.height = 0.6 * vh + "px";
        if (parseInt(document.getElementById("gameOfLifeGrid").style.height) / tableHeight * tableWidth > 0.7 * vw) {
            document.getElementById("gameOfLifeGrid").style.width = 0.7 * vw + "px";
            document.getElementById("gameOfLifeGrid").style.height = parseInt(document.getElementById("gameOfLifeGrid").style.width) / tableWidth * tableHeight + "px";
        } else {
            document.getElementById("gameOfLifeGrid").style.width = parseInt(document.getElementById("gameOfLifeGrid").style.height) / tableHeight * tableWidth + "px";
        }
    } else if (vw <= vh) {
        document.getElementById("gameOfLifeGrid").style.width = 0.7 * vw + "px";
        if (parseInt(document.getElementById("gameOfLifeGrid").style.width) / tableWidth * tableHeight > 0.6 * vh) {
            document.getElementById("gameOfLifeGrid").style.height = 0.5 * vh + "px";
            document.getElementById("gameOfLifeGrid").style.width = parseInt(document.getElementById("gameOfLifeGrid").style.height) / tableHeight * tableWidth + "px";
        } else {
            document.getElementById("gameOfLifeGrid").style.height = parseInt(document.getElementById("gameOfLifeGrid").style.width) / tableWidth * tableHeight + "px";
        }
    }
}

function gridSwitch() {
    if (gridState == 1) {
        gridState = 0;
        var x = document.getElementsByTagName("td");
        var i;
        for (i = 0; i < x.length; i++) {
            x[i].style.border = "0px";
        }
    } else if (gridState == 0) {
        gridState = 1;
        var x = document.getElementsByTagName("td");
        var i;
        for (i = 0; i < x.length; i++) {
            x[i].style.border = "1px solid black";
        }
    }
}

function clearTable() {
    for (i = 1; i < tableHeight + 1; i++) {
        for (j = 1; j < tableWidth + 1; j++) {
            arr[i][j] = 0; // Väärtustame kõik nulliks
            document.getElementById(i + "-" + j).setAttribute("class", "dead");
        }
    }
    pauseSimulation();
    updateCounter(0);
}

function generateTable() {
    getSizeInput("tableHeight");
    getSizeInput("tableWidth");
    updateCounter(0); // "Genereeri" vajutades generatsioonid nulli
    create2DArray();
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
    setTimeout(runSimulation2, sliderAmount);
}

function pauseSimulation() {
    simulationState = 0;
}

function create2DArray() {
    arr = [];
    for (i = 0; i < tableHeight + 2; i++) {
        arr[i] = [];
        for (j = 0; j < tableWidth + 2; j++) {
            arr[i][j] = Math.round(Math.random()); // Genereerime suvaliselt 0 või 1
        }
    }
}

function nextGeneration() {
    /* Järgnevad kaks vajalikud, et joonistamine toimiks kogu aeg*/
    createImaginaryEdges();
    fillDuplicateArray();
    updateCounter(1);
    for (i = 1; i < tableHeight + 1; i++) {
        for (j = 1; j < tableWidth + 1; j++) {
            countNeighbors(i, j);
            applyRules(i, j);
        }
    }
    copyFromDuplicate(); // Kopeerime duplikaatmassiivi väärtused originaali tagasi
    for (i = 1; i < tableHeight + 1; i++) {
        for (j = 1; j < tableWidth + 1; j++) {
            if (arr[i][j] == 0) {
                document.getElementById(i + "-" + j).setAttribute("class", "dead");
            } else {
                document.getElementById(i + "-" + j).setAttribute("class", "live");
            }
        }
    }
}

function createTable() {
    table = document.getElementById("gameOfLifeGrid");
    for (i = 1; i < tableHeight + 1; i++) {
        var tr = document.createElement("tr"); // Loome uue rea, kõik identsed, sest neid pöördumisel ei kasuta
        for (j = 1; j < tableWidth + 1; j++) {//
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
        table.appendChild(tr);
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
}

function countNeighbors(row, col) {
    count = 0;
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
}

function applyRules(row, col) {
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
    for (i = 1; i < tableHeight + 1; i++) {
        arr[i][0] = arr[i][tableWidth];
        arr[i][tableWidth + 1] = arr[i][1];
    }
    for (j = 1; j < tableWidth + 1; j++) {
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
    for (i = 0; i < tableHeight + 2; i++) {
        arrDup[i] = [];
        for (j = 0; j < tableWidth + 2; j++) {
            arrDup[i][j] = arr[i][j];
        }
    }
}

function copyFromDuplicate() {
    for (i = 0; i < tableHeight + 2; i++) {
        for (j = 0; j < tableWidth + 2; j++) {
            arr[i][j] = arrDup[i][j];
        }
    }
}

function updateCounter(updateType) {
    if (updateType == 0) { // Kui funk. antakse 0, siis nullimine
        generation = 0;
    } else if (updateType == 1) { // Kui 1, siis +1
        generation++;
    }
    document.getElementById("display").innerHTML = generation;
}

function updateSlider(slideAmount) {
    if (slideAmount == 0) {
        sliderAmount = 600;
    } else if (slideAmount == 1) {
        sliderAmount = 500;
    } else if (slideAmount == 2) {
        sliderAmount = 400;
    } else if (slideAmount == 3) {
        sliderAmount = 300;
    } else if (slideAmount == 4) {
        sliderAmount = 200;
    } else if (slideAmount == 5) {
        sliderAmount = 100;
    } else if (slideAmount == 6) {
        sliderAmount = 0;
    }
    document.getElementById("sliderAmount").innerHTML = "Kiirus: " + slideAmount;
}

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



window.onload = generateTable();
window.onload = updateSlider(3);
window.onresize = windowResized();
