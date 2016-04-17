'use strict';

document.addEventListener("DOMContentLoaded", function(){
    var
        table = document.getElementById("main_table").firstElementChild,
        buttonAddRecord = document.getElementById("add_record"),
        buttonSaveFile = document.getElementById("saveFile"),
        allSelects = table.getElementsByTagName("select"),
        allElementsWithValue = table.querySelectorAll(".valueColumn");

    [].forEach.call(allElementsWithValue, function(item) {
        toggleHandlersValueItem(item);
    });

    [].forEach.call(allSelects, function(item) {
        item.addEventListener('change', changeTypeValue);
    });

    resizeWidthButtons();

    table.addEventListener("click", function(event) {
        var
            target = event.target;

        if (target.className == "remove_row") {
            target.parentNode.parentNode.remove();
            resizeWidthButtons();
        }
    });

    buttonAddRecord.addEventListener("click", function(){
        var
            row = document.createElement("tr"),
            butDelete = document.createElement("button"),
            elementValue = document.createElement("input"),
            columns;


        for (var i = 0; i < 6; i++) {
            row.appendChild(document.createElement("td"));
        }

        butDelete.className = "remove_row";
        butDelete.innerHTML = "delete";
        elementValue.className = "valueColumn";

        columns = row.children;

        for (var i = 0; i < 3; i++) {
            columns[i].appendChild(document.createElement("input"));
        }

        columns[3].appendChild(createTypeMenuSelection());
        columns[4].appendChild(elementValue);
        columns[5].appendChild(butDelete);

        table.appendChild(row);
        resizeWidthButtons();


    });

    buttonSaveFile.addEventListener("click", function() {
        var
            xhr = new XMLHttpRequest(),
            rows = table.children,
            data = [];

        [].forEach.call(rows, function(row, index) {
            if (index) {
                var
                    elemData = row.children,
                    valueElem = elemData[4].firstElementChild,
                    textType = getSelectedElement(elemData[3].firstElementChild),
                    textValue = textType == "System.Boolean" ? valueElem.checked : valueElem.value;

                data.push({
                    Id: elemData[0].firstElementChild.value,
                    Name: elemData[1].firstElementChild.value,
                    Description: elemData[2].firstElementChild.value,
                    Type: textType,
                    Value: textValue
                });
            }
        });


        xhr.open("POST", "/saveFile", true);
        xhr.send(JSON.stringify(data));

        xhr.onreadystatechange = function() {
            if (xhr.readyState != 4) return;

            if (xhr.status == 200) {
                addAnimation(buttonSaveFile, 'background', 'green', 1000);
            }
            else  {
                addAnimation(buttonSaveFile, 'background', 'red', 1000);
            }
        }

    });

    function  createTypeMenuSelection() {
        var
            menuSelectionType = document.createElement("select"),
            options;

        for (var i = 0; i < 3; i++) {
            menuSelectionType.appendChild(document.createElement("option"));
        }

        options = menuSelectionType.children;
        options[0].innerHTML = "System.String";
        options[1].innerHTML = "System.Int32";
        options[2].innerHTML = "System.Boolean";

        menuSelectionType.addEventListener("change", changeTypeValue);

        return menuSelectionType;
    }

    function getSelectedElement(selectElement) {
        var
            options = selectElement.children;

        for (var j = 0; j < options.length; j++){
            if (options[j].selected) {
                return options[j].innerHTML;
            }
        }
    }

    function changeTypeValue(){
        var
            textType = getSelectedElement(this),
            valueElement = this.parentNode.nextElementSibling.firstElementChild;

        valueElement.type = textType == "System.Boolean" ? "checkbox" : "text";
        toggleHandlersValueItem(valueElement);

        if (textType == "System.Int32") {
            valueElement.value = "";
        }
    }

    function changeIntegerValue(e) {
        var
            valueElem = this.value,
            character = String.fromCharCode(e.which),
            allTextaAlocated = !(valueElem.length - this.selectionStart - this.selectionEnd);

        if (isNaN(character) ||
            (!valueElem.length || allTextaAlocated || valueElem.length == 1 && valueElem[0] == "-") && character == "0" ||
            character==" ") {

            if (allTextaAlocated && character == "-") {
                return true;
            }

            return false;
        }
    }

    function toggleHandlersValueItem(item) {
        if (getSelectedElement(item.parentNode.previousElementSibling.firstElementChild) == "System.Int32") {
            item.onkeypress = changeIntegerValue;
            item.onselectstart = function() {
                return false;
            };
        }
        else {
            item.onkeypress = null;
            item.onselectstart = null;
        }
    }

    function addAnimation(elem, prop, value, delay) {
        elem.style[prop] = value;

        (function(elem) {
            setTimeout(function(){
                elem.style[prop] = "";
            }, delay);
        })(elem)
    }

    function resizeWidthButtons() {
        [].forEach.call(document.getElementsByClassName('nice_button'), function(item) {
            item.style.width = table.offsetWidth/2;
        });
    }
});