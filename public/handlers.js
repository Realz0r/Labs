'use strict';

document.addEventListener("DOMContentLoaded", function(){
    var
        buttonAddRecord = document.getElementById("add_record"),
        buttonSaveFile = document.getElementById("saveFile"),
        allSelects = helpers.table.getElementsByTagName("select");

    helpers.resizeWidthButtons();

    [].forEach.call(helpers.allElementsWithValue, function(item) {
        helpers.toggleHandlersValueItem(item);
        helpers.subscribeOfIncorrectValue.call(item);

        if (item.type == 'checkbox') {
            item.addEventListener('change', helpers.subscribeOfIncorrectValue);
        }
        else {
            item.addEventListener('keyup', helpers.subscribeOfIncorrectValue);
        }
    });

    [].forEach.call(allSelects, function(item) {
        item.addEventListener('change', helpers.changeTypeValue);
    });

    helpers.table.addEventListener("click", function(event) {
        var
            target = event.target;

        if (target.className == "remove_row") {
            target.parentNode.parentNode.remove();
            helpers.refreshErors();
            helpers.resizeWidthButtons();
        }
    });

    buttonAddRecord.addEventListener("click", function() {
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
        elementValue.addEventListener('keyup', helpers.subscribeOfIncorrectValue);

        columns = row.children;

        for (var i = 0; i < 3; i++) {
            columns[i].appendChild(document.createElement("input"));
        }

        columns[3].appendChild(helpers.createTypeMenuSelection());
        columns[4].appendChild(elementValue);
        columns[5].appendChild(butDelete);

        helpers.table.appendChild(row);
        helpers.resizeWidthButtons();
    });

    buttonSaveFile.addEventListener("click", function() {
        var
            xhr = new XMLHttpRequest(),
            rows = helpers.table.children,
            data = [];

        for (var typeName in helpers.errorWindows) {
            if ([].indexOf.call(helpers.errorWindows[typeName].classList, 'actualBackground') != -1) {
                helpers.createAnimation(buttonSaveFile, 'background', 'red', 1000);
                return;
            }
        }

        [].forEach.call(rows, function(row, index) {
            if (index) {
                var
                    elemData = row.children,
                    valueElem = elemData[4].firstElementChild,
                    textType = helpers.getSelectedElement(elemData[3].firstElementChild),
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
                helpers.createAnimation(buttonSaveFile, 'background', 'green', 1000);
            }
            else  {
                helpers.createAnimation(buttonSaveFile, 'background', 'orange', 1000);
            }
        }
    });
});