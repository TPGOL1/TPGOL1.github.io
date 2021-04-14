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



document.getElementById("generateButton").addEventListener("click", getTableSizes);
document.getElementById("stepButton").addEventListener("click", stepSimulation);
document.getElementById("playButton").addEventListener("click", runSimulation);
document.getElementById("pauseButton").addEventListener("click", pauseSimulation);
document.getElementById("gridButton").addEventListener("click", gridSwitch);
window.addEventListener("resize", windowResized);

function windowResized() {
    vw = window.innerWidth; // ehk viewport width
    vh = window.innerHeight; // ehk viewport height
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
    windowResized();
}

function getTableSizes() {
    tableWidth = parseInt(document.getElementById("tableWidth").value);
    tableHeight = parseInt(document.getElementById("tableHeight").value);
    generation = 0;
    updateCounter();
    create2DArray();
    $("tr").remove();
    createTable();
    windowResized();
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
    for (i = 1; i < tableHeight + 1; i++) {
        for (j = 1; j < tableWidth + 1; j++) {
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
            cell.onclick = cellClicked;
            tr.appendChild(cell);
        }
        table.appendChild(tr);
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

function cellClicked() {
    var rowcol = this.id.split("-");
    var rowcol_row = rowcol[0];
    var rowcol_col = rowcol[1];

    var classes = this.getAttribute("class");
    if (classes.indexOf("live") > -1) { // indexOf returnib -1 kui "live" massiivist ei leita
        this.setAttribute("class", "dead");
        arr[rowcol_row][rowcol_col] = 0;
    } else {
        this.setAttribute("class", "live");
        arr[rowcol_row][rowcol_col] = 1;
    }
    createImaginaryEdges();
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

window.onload = getTableSizes();
window.onload = updateSlider(3);
window.onresize = windowResized();
