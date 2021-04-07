var tableWidth, tableHeight;
var table;
var i, j;
var arr, arrDup;
var count;
var cell;
var generation;
var simulationState = 0;
var sliderAmount;

document.getElementById("generateButton").addEventListener("click", getTableSizes);
document.getElementById("stepButton").addEventListener("click", stepSimulation);
document.getElementById("playButton").addEventListener("click", runSimulation);
document.getElementById("pauseButton").addEventListener("click", pauseSimulation);

function getTableSizes() {
    tableWidth = parseInt(document.getElementById("tableWidth").value);
    tableHeight = parseInt(document.getElementById("tableHeight").value);
    generation = 0;
    updateCounter();
    create2DArray();
    $("tr").remove();
    createTable();
}

function runSimulation() {
    if (simulationState != 1) {
        simulationState = 1;
        runSimulation2();
    }
}

function runSimulation2() {
    if (simulationState == 1) {
        stepSimulation();
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
    createImaginaryEdges();
    fillDuplicateArray();
}

function stepSimulation() {
    generation++;
    updateCounter();
    createImaginaryEdges();
    for (i = 1; i < tableHeight+1; i++) {
        for (j = 1; j < tableWidth+1; j++) {
            count = countNeighbors(i, j);
            if (arr[i][j] == 1) {
                if (count < 2) {
                    arrDup[i][j] = 0;
                } else if (count > 3) {
                    arrDup[i][j] = 0;
                } else if (count == 2 || count == 3) {
                    arrDup[i][j] = 1;
                }
            } else if (arr[i][j] == 0) {
                if (count == 3) {
                    arrDup[i][j] = 1;
                }
            }
        }
    }
    copyAndClear(); // Kopeerime duplikaatmassiivi väärtused originaali tagasi ja nullime duplikaadi
    for (i = 1; i < tableHeight+1; i++) {
        for (j = 1; j < tableWidth+1; j++) {
            if (arr[i][j] == 0) {
                document.getElementById(i + "-" + j).setAttribute("class", "dead");
            } else {
                document.getElementById(i + "-" + j).setAttribute("class", "live");
            }
        }
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
    return count;
}

function createImaginaryEdges() {
    arr[0][0] = arr[tableHeight][tableWidth];
    arr[tableHeight + 1][0] = arr[1][tableWidth];
    arr[0][tableWidth + 1] = arr[tableHeight][1];
    arr[tableHeight + 1][tableWidth + 1] = arr[1][1];
    for (i = 1; i < tableHeight; i++) {
        arr[i][0] = arr[i][tableWidth];
    }
    for (i = 1; i < tableHeight; i++) {
        arr[i][tableWidth + 1] = arr[i][1];
    }
    for (j = 1; j < tableWidth; j++) {
        arr[0][j] = arr[tableHeight][j];
    }
    for (j = 1; j < tableWidth; j++) {
        arr[tableHeight + 1][j] = arr[1][j];
    }
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

function createTable() {
    table = document.getElementById("gameOfLifeGrid");
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
            tr.appendChild(cell);
        }
        table.appendChild(tr);
    }
}

function copyAndClear() {
    for (i = 0; i < tableHeight + 2; i++) {
        for (j = 0; j < tableWidth + 2; j++) {
            arr[i][j] = arrDup[i][j];
            arrDup[i][j] = 0;
        }
    }
    createImaginaryEdges();
}

function updateCounter() {
    var disp = document.getElementById("display");
    disp.innerHTML = generation;
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

window.onload = getTableSizes();
window.onlload = updateSlider(3);
