/**
 * Created by Илья on 18.04.2016.
 */

'use strict';

/*
 createTypeMenuSelection - Создает select с 3-мя стандарт опциями и подписывает его на событие 'onchange'
 getSelectedElement - По select возвращяет значение выбранного эл-та
 changeTypeValue - При 'onchange' select сменяет тип поля ввода Value и тянет за собой 'toggleHandlersValueItem'
 toggleHandlersValueItem - Вешает(снимает) обработчики на поле Value в зависимости от его типа
 subscribeOfIncorrectValue - При изменение значений полей Value(string, int) проверяет корректность данных
 changeIntegerValue - Запрещяет ввод некоректных данных в поле Value(Int)
 createAnimation - Инициирует анимацию
 getTypeValue - Возвращяет Type по Value
 checkingOtherIncorrectValue - Проверяет наличие других некорректных данных данного типа
 resizeWidthButtons
 refreshErors
 */
var helpers = helpers || {};

helpers.createTypeMenuSelection = function() {
    var
        options,
        menuSelectionType = document.createElement("select");

    for (var i = 0; i < 3; i++) {
        menuSelectionType.appendChild(document.createElement("option"));
    }

    options = menuSelectionType.children;
    options[0].innerHTML = "System.String";
    options[1].innerHTML = "System.Int32";
    options[2].innerHTML = "System.Boolean";

    menuSelectionType.addEventListener("change", helpers.changeTypeValue);

    return menuSelectionType;
};

helpers.getSelectedElement = function(selectElement) {
    var
        options = selectElement.children;

    for (var j = 0; j < options.length; j++){
        if (options[j].selected) {
            return options[j].innerHTML;
        }
    }
};

helpers.changeTypeValue = function() {
    var
        textType = helpers.getSelectedElement(this),
        valueElement = this.parentNode.nextElementSibling.firstElementChild;

    valueElement.type = textType == "System.Boolean" ? "checkbox" : "text";

    if (textType == "System.Int32") {
        valueElement.value = "";
    }

    if (textType == "System.Boolean") {
        valueElement.addEventListener('change', helpers.subscribeOfIncorrectValue);
        valueElement.removeEventListener('keyup', helpers.subscribeOfIncorrectValue);
    }
    else {
        valueElement.removeEventListener('change', helpers.subscribeOfIncorrectValue);
        valueElement.addEventListener('keyup', helpers.subscribeOfIncorrectValue);
    }

    helpers.toggleHandlersValueItem(valueElement);
    helpers.refreshErors();
};

helpers.changeIntegerValue = function(e) {
    var
        character = String.fromCharCode(e.which),
        allTextaAlocated = !(this.value.length - this.selectionStart - this.selectionEnd);

    if (isNaN(character) ||
        (!this.value.length || allTextaAlocated || this.value.length == 1 && this.value[0] == "-") && character == "0" ||
        character==" ") {

        if (allTextaAlocated && character == "-") {
            return true;
        }

        return false;
    }
};

helpers.toggleHandlersValueItem = function(item) {
    if (helpers.getTypeValue(item) == "System.Int32") {
        item.addEventListener('keyup', helpers.validationInt);
        item.onkeypress = helpers.changeIntegerValue;
        item.onselectstart = function() {
            return false;
        };
        item.onpaste = function() {
            return false;
        }
    }
    else {
        item.removeEventListener('keyup', helpers.validationInt);
        item.onkeypress = null;
        item.onselectstart = null;
        item.onpaste = null;
    }
};

helpers.subscribeOfIncorrectValue = function() {
    var
        typeElement = helpers.getTypeValue(this),
        itemValue = this.value;

    if ((typeElement == "System.Int32" && (+itemValue > 255 || +itemValue < -255)) || (typeElement == "System.String" && itemValue.length > 10) || (typeElement == "System.Boolean" && !this.checked)) {
        this.classList.add("incorrect_value");

        if (helpers.checkingOtherIncorrectValue(typeElement)) {
            helpers.errorWindows[typeElement].classList.add('actualBackground');
        }
    }
    else {
        this.classList.remove("incorrect_value");

        if (!helpers.checkingOtherIncorrectValue(typeElement)) {
            helpers.errorWindows[typeElement].classList.remove('actualBackground');
        }
    }
};

helpers.createAnimation = function(elem, prop, value, delay) {
    elem.style[prop] = value;

    (function(elem) {
        setTimeout(function(){
            elem.style[prop] = "";
        }, delay);
    })(elem)
};

helpers.resizeWidthButtons = function() {
    [].forEach.call(document.getElementsByClassName('nice_button'), function(item) {
        item.style.width = helpers.table.offsetWidth/2;
    });
};

helpers.getTypeValue = function(itemValue) {
    return helpers.getSelectedElement(itemValue.parentNode.previousElementSibling.firstElementChild);
};

helpers.checkingOtherIncorrectValue = function(nameType) {
    var
        incorrectValues = document.getElementsByClassName('incorrect_value'),
        thereOthers = false;

    if (nameType == "System.Boolean") {
        [].forEach.call(document.querySelectorAll('input[type="checkbox"]') , function(checkbox) {
            if (checkbox.checked) {
                thereOthers = true;
            }
        });
    }
    else {
        [].forEach.call(incorrectValues, function(item) {
            if (helpers.getTypeValue(item) == nameType) {
                thereOthers = true;
            }
        });
    }

    return nameType == "System.Boolean" ? !thereOthers : thereOthers;
};

helpers.refreshErors = function() {
    for (var typeName in helpers.errorWindows) {
        helpers.errorWindows[typeName].classList.remove('actualBackground');
    }

    [].forEach.call(helpers.allElementsWithValue, function(item) {
        helpers.subscribeOfIncorrectValue.call(item);
    });
};

helpers.validationInt = function() {
    if (this.value[0] == '0') {
        this.value = this.value.slice(1);
    }

    if (this.value[1] == '-') {
        this.value = this.value[0] + this.value.splice(2);
    }
};

document.addEventListener("DOMContentLoaded", function() {
    helpers.errorWindows = {
        "System.Int32": document.getElementById('errorInt'),
        "System.String": document.getElementById('errorString'),
        "System.Boolean": document.getElementById('errorBoolean')
    };

    helpers.table = document.getElementById("main_table").firstElementChild;
    helpers.allElementsWithValue = helpers.table.getElementsByClassName("valueColumn");
});