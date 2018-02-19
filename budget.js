
//Budget Controller
var budgetController = (function() {

    var Expense = function (id, description, value) {
        this.id = id,
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    
    };

    Expense.prototype.getPercentages = function () {
        
        return this.percentage;

    }

    var Income = function (id, description, value) {
        this.id = id,
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });

        data.totals[type] = sum;
    };

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
        percentage: -1
    };

    return {
        addItem: function (type, des, val) {

            var newItem, ID;
            //Created new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;//Most Complicated thing to understand
            } else {
                ID = 0;
            }


            //Create a new item based on inc or exp
            if(type === "exp") {
                newItem = new Expense(ID, des, val);
            } else if (type === "inc")
                newItem = new Income(ID, des, val);

            //Pushing items to our data structure
            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function (type, id) {
            
            var ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;      
            });

            index = ids.indexOf(id);
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }


        },

        calculateBudget: function () {
            
            // calculate total income and expense
            calculateTotal("exp");
            calculateTotal("inc");

            // calculate Budget income-expense
            data.budget = data.totals.inc - data.totals.exp;

            // calculate percentageof income that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        calculatePercentages: function () {
            
            data.allItems.exp.forEach(function (current) {
                current.calcPercentage(data.totals.inc);
            });

        },

        getPercentages: function () {
            
            var allPercentages = data.allItems.exp.map(function (cur) {
                return cur.getPercentages();
            });
            return allPercentages;

        },

        getBudget: function () {

            return {
                budget: data.budget,
                percentage: data.percentage,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp
            }

        },

        testing: function () {
            console.log(data);

        }
    };


})();

//UI Controller
var UIController = (function () {

    var DOMinput = {
        type: ".add__type",
        description: ".add__description",
        inputValue: ".add__value",
        button: ".add__btn",
        incomeContainer: ".income__list",
        expenseContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expenseLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
    };

    var formatNumber =  function(num, type) {

        var numSplit, int, decimal;

        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split(".");

        int = numSplit[0];
        if (int.length > 3) {
            int  = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
        }

        decimal = numSplit[1];

        return (type === "exp" ?  "-" : "+") + " " + int + "." +  decimal;

    };

    var nodeListforeach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMinput.type).value,
                description: document.querySelector(DOMinput.description).value,
                value: parseFloat(document.querySelector(DOMinput.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
          var html, newhtml, element;

          //Create html string with place holder text

          if(type === "inc") {
              element = DOMinput.incomeContainer;
            html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"</i></button></div></div></div>';
        } else {
            element = DOMinput.expenseContainer;
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"</i></button></div></div></div>';
        }
        //Replace the placeholder text with some actual data
        newhtml = html.replace("%id%", obj.id);
        newhtml = newhtml.replace('%description%', obj.description);
        newhtml = newhtml.replace('%value%', formatNumber(obj.value, type));

        //Insert the HTML into the DOM
        document.querySelector(element).insertAdjacentHTML("beforeend", newhtml);

        },

        deleteListItem: function (selectorID) {

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMinput.inputDescription + ", " + DOMinput.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });
            fieldsArr[0].focus();
        },

        displayBudget: function(obj){

            obj.budget > 0 ? type = "inc" : type = "exp";

            document.querySelector(DOMinput.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMinput.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
            document.querySelector(DOMinput.expenseLabel).textContent = formatNumber(obj.totalExp, "exp");

            if(obj.percentage > 0) { 
                document.querySelector(DOMinput.percentageLabel).textContent = obj.percentage + "%" ;
            } else {
                document.querySelector(DOMinput.percentageLabel).textContent = "---";
            }

        },
        dispalyPercentages: function (percentages) {
            
            var fields = document.querySelectorAll(DOMinput.expensesPercLabel);


            nodeListforeach(fields, function (current, index) {

                if(percentages[index] > 0){
                    current.textContent = percentages[index] + "%";
                } else {
                    current.textContent = "--";
                }
                
            });

        },

        displayMonth: function () {
            var now, year, month, months;

            months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
          
            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMinput.dateLabel).textContent = months[month] + " " + year;

        },

        changedType: function () {
          
            var fields = document.querySelectorAll(
                DOMinput.type + ',' + 
                DOMinput.description + ',' +
                DOMinput.inputValue
            );

            nodeListforeach(fields, function (cur) {
               cur.classList.toggle('red-focus'); 
            });

            document.querySelector(DOMinput.button).classList.toggle('red');

        },

        getDOMinput: function () {
            return DOMinput;
        }
    }

})();


// Global App Controller
var Controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {

        var DOM = UICtrl.getDOMinput();

        document.querySelector(DOM.button).addEventListener("click", ctrlAddItem);

        document.addEventListener("keypress", function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);

        document.querySelector(DOM.type).addEventListener("change", UICtrl.changedType);

    };

    var updateBudget = function () {
        //4. Calculate the Budget
        budgetCtrl.calculateBudget();

        //4.1 Return the budget
        var budget = budgetCtrl.getBudget();

        //5. Display the budget on the UI
        UICtrl.displayBudget(budget);
        
    };

    var updatePercentages = function() {

        //1. calculate the percentages
        budgetCtrl.calculatePercentages();

        //2. read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();

        //3. Update the UI with new percentages
        UICtrl.dispalyPercentages(percentages);
        
    };


    function ctrlAddItem() {

        var input, newItem;

        //1. Get the filled input data
        input = UIController.getInput();

        if(input.description !== " " && !isNaN(input.value) &&input.value > 0) {

        //2. Add the item to thge budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        //3. Add the item to the UI
        UICtrl.addListItem(newItem, input.type);
        //3.1 Clear the fields
        UICtrl.clearFields();

        //Calculate and Update Budget   
        updateBudget();

        //6. calculate and update percentages
        updatePercentages();


        console.log(newItem);
        }

    };

    var ctrlDeleteItem = function (e) {

        var  itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        console.log(event.target.parentNode.parentNode.parentNode.parentNode.id);//parentNode of ion-icon i.e button, but we don't want that so we go all the way back to up
        if(itemID) {

            splitID = itemID.split("-")
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. Delete the item from data structure
            budgetCtrl.deleteItem(type,ID);

            //2. Delete the item from UI
            UICtrl.deleteListItem(itemID);

            //3. Update and show the new Budget
            updateBudget();


        }
        
    };

    return {
        init: function () {
            console.log("Application started");
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                percentage: -1,
                totalInc: 0,
                totalExp: 0
            });
            setupEventListeners();
        }
    }

})(budgetController, UIController);

Controller.init();
