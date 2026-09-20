let expression = "";

const display = document.querySelector("#display");
const buttons = document.querySelectorAll("button");
const calculatorBox = document.querySelector(".calculator");


// Core Actions of Calculator

function clearAll() {
    expression = "";
    display.value = "";
}

function deleteLast() {
    if (expression === "Error") {
        clearAll();
        return;
    }
    
    // Get current cursor location
    const start = display.selectionStart;
    
    if (start > 0) {
        // Cut out the single character directly behind the cursor position
        expression = expression.slice(0, start - 1) + expression.slice(start);
        display.value = expression;
        
        // Reposition cursor one step back
        display.focus();
        display.setSelectionRange(start - 1, start - 1);
    }
}

function runCalculation() {
    if (expression === "") return;
    let result = calculate(expression);
    display.value = result;
    expression = String(result);
    
    // Drop cursor at the end of the calculated answer
    display.focus();
    display.setSelectionRange(expression.length, expression.length);
}

function appendToExpression(val) {

    if (expression === "Error") {
        clearAll();
    }
    
    // Grab the exact location of the cursor insertion point
    display.focus();
    const cursorPos = display.selectionStart;
    const operators = ["+","-","*","/","^"];

    // Prevent starting with a broken operator symbol
    if (cursorPos === 0 && ["+", "*", "/", "^", "-", ")", ","].includes(val)) return;

    // Grab character directly behind the cursor position
    const charBefore = expression.slice(cursorPos - 1, cursorPos);

    // Add 0 before decimal at start or after an operator
    if (val === "." && (cursorPos === 0 || operators.includes(charBefore))) {
        val = "0.";
    }

    //Prevent two operators entered simultaneously -> replace it with recently entered one
    if (operators.includes(val) && operators.includes(charBefore)) {
        expression = expression.slice(0, cursorPos - 1) + val + expression.slice(cursorPos);
        display.value = expression;
        display.setSelectionRange(cursorPos, cursorPos);
        return;
    }
    
    // Splice character precisely at the cursor location
    expression = expression.slice(0, cursorPos) + val + expression.slice(cursorPos);
    display.value = expression;
    
    // Move the cursor forward by the length of what was just added
    const nextCursorPos = cursorPos + val.length;
    display.setSelectionRange(nextCursorPos, nextCursorPos);
}


// Mouse Click Listener

buttons.forEach(function(button){
    button.addEventListener("click", function(){
        console.log(button.textContent);
        const value = button.textContent;

        if (value === "SCI" || value === "STD") {
            // Toggle the scientific layout class on the main container
            calculatorBox.classList.toggle("scientific-active");
            
            // Dynamically switch the button text so the user knows how to go back
            if (button.textContent === "SCI") {
                button.textContent = "STD";
            } else {
                button.textContent = "SCI";
            }
            display.focus();
            return;
        }
        
        // Dynamic multiplier checks based on the cursor position
        const cursorPos = display.selectionStart;
        const lastChar = expression.slice(cursorPos - 1, cursorPos);
        const needsMultiply = cursorPos > 0 && (!isNaN(lastChar) || lastChar === ")");

        if (value === "AC")  clearAll();
        else if (value === "DEL")  deleteLast();
        else if (value === "=")  runCalculation();
        else if (value === "xʸ")    appendToExpression("^(");

        // Custom Routing for scientic buttons
        else if (value === "eˣ")    appendToExpression(needsMultiply ? "*e^(" : "e^(");
        else if (value === "logₓ")  appendToExpression(needsMultiply ? "*log(" : "log(");
        else if (value === "ʸ√x")   appendToExpression(needsMultiply ? "*root(" : "root(");
        else if (value === "sin")   appendToExpression(needsMultiply ? "*sin(" : "sin(");
        else if (value === "cos")   appendToExpression(needsMultiply ? "*cos(" : "cos(");
        else if (value === "tan")   appendToExpression(needsMultiply ? "*tan(" : "tan(");
        else if (value === "sin⁻¹") appendToExpression(needsMultiply ? "*asin(" : "asin(");
        else if (value === "cos⁻¹") appendToExpression(needsMultiply ? "*acos(" : "acos(");
        else if (value === "tan⁻¹") appendToExpression(needsMultiply ? "*atan(" : "atan(");
        else if (value === "ln")    appendToExpression(needsMultiply ? "*ln(" : "ln(");
        else  appendToExpression(value);
    });
});

// Keyboard Listener (Safe Whitelist Validation)

document.addEventListener("keydown", function(event) {
    const key = event.key;

    if (["Shift","Control","Alt","Tab","CapsLock","ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(key)){
        return; // Allow navigation arrows to move natively inside field
    }

    // Matches physical keys or keywords to our core actions
    if (key === "Escape") {
        clearAll();
    } 
    else if (key === "Backspace") {
        event.preventDefault(); // Stop default browser backspace double-firing
        deleteLast();
    } 
    else if (key === "Enter" || key === "=") {
        event.preventDefault(); // Prevents accidental browser double-clicks
        runCalculation();
    }
    // Safely whitelist typing
    else if (!isNaN(key) || [".", "+", "-", "*", "/", "^", "(", ")", ","].includes(key)) {
        event.preventDefault(); // Stop default raw typing duplication
        appendToExpression(key);
    }
    else if (key === " ") {
        event.preventDefault(); // Ignore empty spacebar inputs completely
    }
    else {
        event.preventDefault();
        display.classList.add("invalid-flash");
        setTimeout(function() {
            display.classList.remove("invalid-flash");
        }, 150);
    }
});

// Operator Functions

function add(a, b){ return a + b; }
function sub(a, b){ return a - b; }
function mul(a, b){ return a * b; }
function div(a, b){ return a / b; }
function pow(a, b){ return a ** b;}


// Scientific Operator Functions

// Standard Trigonometry (Configured to use Degrees)
function sin(deg) { return Math.sin(deg * Math.PI / 180); }
function cos(deg) { return Math.cos(deg * Math.PI / 180); }
function tan(deg) { return Math.tan(deg * Math.PI / 180); }

// Inverse Trigonometry (Converts back to degrees for the user)
function asin(val) { return Math.asin(val) * 180 / Math.PI; }
function acos(val) { return Math.acos(val) * 180 / Math.PI; }
function atan(val) { return Math.atan(val) * 180 / Math.PI; }

// Natural Logarithm
function ln(val) { return Math.log(val); }

// Custom Logarithm Base handling: log(number, base) (defaults to base 10)
function log(val, base = 10) { return Math.log(val) / Math.log(base); }

// Custom Root Index handling: root(number, index) (defaults to base 2)
function root(val, index = 2) { return Math.pow(val, 1 / index); }


function calculate(exp) {
    try {

        let formattedExpression = exp;

        // Swap '^' with '**' so JavaScript understands the power rule natively
        formattedExpression = exp.replace(/\^/g, "**"); // regex

        // Convert the Euler constant character 'e' to its numerical value
        // Ensures it doesn't break function names like 'tan' or 'sin'
        formattedExpression = formattedExpression.replace(/e(?![a-z])/g, String(Math.E));

        // Evaluate the mathematical expression string
        let evaluatedValue = new Function("return " + formattedExpression)();
        
        // Catch division by zero (Infinity) and indeterminate forms like 0/0 (NaN)
        if (evaluatedValue === Infinity || evaluatedValue === -Infinity || isNaN(evaluatedValue)) {
            return "Error";
        }

        // This rounds it cleanly to a maximum of 10 decimal places only if needed
        return Number(Math.round(evaluatedValue + 'e10') + 'e-10');
        
    } catch (error) {
        return "Error";
    }
}

// Automatically focus on the display screen the exact millisecond the page loads
window.addEventListener("DOMContentLoaded", function() {
    display.focus();
});

// If the user accidentally clicks anywhere outside the buttons, keep the focus locked on the screen
document.addEventListener("click", function(e) {
    if (!e.target.matches("button")) {
        display.focus();
    }
});
