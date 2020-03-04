// BUDGET CONTROLLER
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        data.totals[type] = data.allItems[type].reduce((total, item) => {
            return total += item.value;
        }, 0)
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: 0
    };
    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            //Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }


            //Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //Push it into our data structure
            data.allItems[type].push(newItem);

            //return the new element
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids = data.allItems[type].map((item => item.id));

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },
        calBudget: function () {
            //calculate total income and total expense
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate total buget
            data.budget = data.totals.inc - data.totals.exp;

            //calculate percentage of income that we spend
            data.totals.inc > 0 && data.totals.inc > data.totals.exp ? data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100) : data.percentage = -1;

        },
        calPercentages: function () {
            data.allItems.exp.forEach(cur => cur.calPercentage(data.totals.inc));
        },
        getPercentages: function () {
            var allPerc = data.allItems.exp.map(cur => cur.getPercentage());
            return allPerc;
        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function () {
            console.log(data);
        }
    };
})();

// UI CONTROLLER
var UIController = (function () {
    var DOMstrings = {
        inputType: '.add__type',
        inputDescripton: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage'
    }
    var formatNumber=function (num, type) {
        var numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);//2310 => 2,310
        }
        dec = numSplit[1];
        return (type === 'exp' ? '-' : '+') + '' + int +'.'+ dec

    }
    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i)
        }
    };
    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescripton).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)

            }
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div></div>';
            }
            else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace thhe placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)

        },

        deleteListItem: function (selectorID) {
            document.getElementById(selectorID).parentNode.removeChild(document.getElementById(selectorID));
        },
        clearFields: function () {
            /*document.querySelector('.add__description').value="";
            document.querySelector('.add__value').value="";*/

            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescripton + ',' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });
            fieldsArr[0].focus(); // set the focus back to the first filed
        },
        displayBudget: function (obj) {
            var type;
            obj.budget>0?type='inc':type='exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,type);
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,type);
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;
            obj.percentage > 0 ? document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%' : document.querySelector(DOMstrings.percentageLabel).textContent = '---';
        },
        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            
            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0)
                    current.textContent = percentages[index] + '%';
                else current.textContent = '---';
            })
        },
        changedType: function(){
            var fields=document.querySelectorAll(
            DOMstrings.inputType + ','+
            DOMstrings.inputDescripton + ',' +
            DOMstrings.inputValue);
          
            nodeListForEach(fields,function(cur){
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        getDOMstrings: function () {
            return DOMstrings;
        }
    }


})();


// GLOBAL APP CONTROLLER
var controller = (function (bugetCrl, UICtrl) {
    var setupEventlisteners = function () {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (e) {
            if (e.keyCode === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);

    }
    var updateBudget = function () {
        //1. Calcutelate the budget
        bugetCrl.calBudget();
        //2. Return budget   
        var budget = bugetCrl.getBudget();
        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    }

    var updatePercentages = function () {
        //1. Calculate percentages
        bugetCrl.calPercentages();
        //2. Read percentages from the budget controller
        var percentages = bugetCrl.getPercentages();
        //3. Update the UI with new percentages
        UICtrl.displayPercentages(percentages);
    };
    var ctrlAddItem = function () {
        var input, newItem, total;
        //Get the filed input data
        input = UICtrl.getInput();
        if (input.description !== "" && !isNaN(input.value) && input.value !== 0) {

            //Add the item to the buget controller

            newItem = bugetCrl.addItem(input.type, input.description, input.value);

            //Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            //Clear the fields
            UICtrl.clearFields();

            //Calculate and update budget
            updateBudget();
            // calculate and update percentages
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function (e) {
        var itemID, splitID, type, ID;
        itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            // inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. delete the item from the data structure
            bugetCrl.deleteItem(type, ID);
            //2. Dedete the item from UI
            UICtrl.deleteListItem(itemID);
            //3. Update and show the new budger
            updateBudget();
            // calculate and update percentages
            updatePercentages();
        }
    };
    return {
        init: function () {
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })
            setupEventlisteners();
        }
    }

})(budgetController, UIController);

controller.init();