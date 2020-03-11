/*
SENG 513 Assignment 2
Jung Hyun Sohn
30017825
Tutorial 5
 */
// Wait until html and css is fully loaded before executing javascript
window.addEventListener("load", process_calculator);

let calculator = {
    curr_display: "0",
    curr_num: "0",
    prev_val: "",
    exp_completed: false,
    bracket_used: false
};

// function will cover all digits
function input_digit(digit){
    console.log("function input_digit");
    const {curr_display, curr_num} = calculator;
    let display_length = curr_display.length;

    if(curr_num === '0'){
        calculator.curr_num = digit;
        // this should remove the last digit
        calculator.curr_display = curr_display.substring(0, display_length-1) + digit;
    }else{
        calculator.curr_display = curr_display + digit;
        calculator.curr_num += digit;
    }
}


//function will handle decimals
function input_decimal(){
    console.log("Handling decimal");
    let dot = ".";
    const {curr_num} = calculator;
    // case 1: what if i already have a decimal in the current number? do nothing. Check only for when there is
    if(!curr_num.includes(dot)){
        calculator.curr_display += dot;
        calculator.curr_num += dot;
    }
}
// function will cover both clear and all clear
// it will just get rid of the last digit, or reset current display to be 0
function input_clear(clear){
    console.log("Handling clear");

    const {curr_display, curr_num} = calculator;
    let display_length = curr_display.length;
    let last_input = curr_display.charAt(display_length-1);
    let operator_str = "+-/*";

    // if the function is just single backspace clear
    if(clear === "clear"){
        // this is the case if i just calculated something, in which i want C to do like AC, clear everything
        // OR, the case where i have just a single digit left, i should still display 0
        if(display_length <= 1){
            calculator.curr_display = "0";
            calculator.curr_num = "0";
        }else{
            // this is the regular case
            calculator.curr_display = curr_display.substring(0,display_length-1);
        }
        // if the last inputted item is a digit or a decimal and not worrying about if curr display has 1 digit:
        if((!isNaN(last_input) || last_input === ".") && display_length !== 1){
            let curr_num_length = curr_num.length;
            calculator.curr_num = curr_num.substring(0, curr_num_length-1);
        // else if the last item was an operator
        }else if(operator_str.includes(last_input)){
            // then i must worry about what the current number is now
            calculator.curr_num = find_current_num();
        }

        // everytime i backspace, i also have to check if I have used brackets or not, which would change my parsing
        if(!(curr_display.includes("(") && curr_display.includes(")"))){
            calculator.bracket_used = false;
        }
    }else{
        // the AC all clear
        calculator.curr_display = "0";
        calculator.curr_num = "0";
        calculator.bracket_used = false;
    }
}


// function will handle operator inputs
function input_operator(op){
    console.log("Handling operator");
    const {curr_display} = calculator;

    let display_length = curr_display.length;
    let last_input = curr_display.charAt(display_length-1);
    let operator_str = "+-/*";
    // i reset the current number back to nothing
    calculator.curr_num  = "";

    console.log("Checking prev val and curr display ---", calculator.prev_val, calculator.curr_display);
    // Case where I previously did a calculation, and want to continue operating on the answer
    if((calculator.prev_val !== "") && (calculator.curr_display === "0")){
        console.log("Continuing previous calculation");
        calculator.curr_display = calculator.prev_val + op;
    }else{
        // if the last input is already an operator, I will replace it. This is my calculator design, I don't want error
        if(operator_str.includes(last_input)){
            calculator.curr_display = curr_display.substring(0, display_length-1) + op;
        }else{
            //if the last one wasn't an operator already, then continue as usual
            calculator.curr_display += op;
        }
    }

}

//function will handle brackets
function input_bracket(bracket_type){
    console.log("Handling a bracket");
    calculator.curr_display += bracket_type;
    calculator.curr_num = "";

    // so im not doing multiple true assertments if unneccessary
    if(calculator.bracket_used === false){
        calculator.bracket_used = true;
    }
}

// evaluate the current calculator display
function input_equal(){
    console.log("Evaluating current expression");
    const {curr_display, prev_val, bracket_used} = calculator;
    let res = "";
    // if the current display has something in it, evaluate it. However, if its empty (only when you just did a
    // calculation, just show the previous value
    if(curr_display !== ""){
        // if i used brackets, then there will be a problem using eval, so parse the expression first
        if(bracket_used === true){
            res = parseExp(curr_display);
        }else{
            res = curr_display;
        }

        try {
            res = eval(res);
        }catch(e){
            res = "ERROR";
        }
    }else{
        res = prev_val;
    }

    calculator.curr_display = res;
    calculator.prev_val = calculator.curr_display;

    update_display();

    calculator.curr_display = "0";
    calculator.curr_num = "0";
    calculator.f = true;
}

// function to parse an expression, only called when it contains brackets
function parseExp(expression){
    console.log("Changing bracket expression to be friendly");
    //examples: (TESTED)
    // 5(2)
    // (2)(2)
    // (2) + (2)
    // (5)2 + (2)((5))
    // 5+(2)((3-2)5)*3(1)
    let i = 1;
    while(i < expression.length){
        if(expression[i] === "(" && !isNaN(expression[i-1])){
            expression = expression.slice(0, i) + "*" + expression.slice(i);
        }else if(expression[i] === "(" && expression[i-1] === ")"){
            expression = expression.slice(0, i) + "*" + expression.slice(i);
        }else if(!isNaN(expression[i]) && expression[i-1] === ")"){
            expression = expression.slice(0, i) + "*" + expression.slice(i);
        }
        i++;
    }
    console.log("Returning ", expression);
    return expression;
}

// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
// using event listener with arrow function
function process_calculator(){
    console.log("function process_calculator");
    const calc_keys = document.querySelector(".calculator_buttons");
    //console.log(calc_keys);
    calc_keys.addEventListener('click', (event) => {
        console.log("-------- Button Pressed ---------");
        // Object deconstruction getting target property of click event.
        // Equivalent to const target = event.target;
        const {target} = event;
        let val = target.value;

        // doing the check if i just finished the expression, in which the next button pressed should then
        // reset the current display
        if(calculator.exp_completed === true){
            calculator.exp_completed = false;
            calculator.curr_display = "";
        }

        // temporary check if there is a bracket in teh current display
        if(calculator.bracket_used === true){
            console.log("There is a bracket in my input");
        }
        // If I clicked in the calculator area, but not an actual button, just do nothing
        if(!target.matches("button")){
            console.log("Button was not pressed");
            return;
        }
        if(target.className === "operator"){
            console.log("Operator", val);
            input_operator(val);

        }else if(target.className === "decimal") {
            console.log("Decimal", val);
            input_decimal();
        }else if(target.className === "bracket"){
            console.log("Bracket", val);
            input_bracket(val);
        }else if(target.className === "clear"){
            console.log("Clear", val);
            input_clear(val);

        }else if(target.className === "all-clear"){
            console.log("All Clear", val);
            input_clear(val);

        }else if(target.className === "equal-sign"){
            // this case is special, since I'm not just updating display
            // but also "resetting it". Hence, i update_display in the actual function
            console.log("Equal Sign", val);
            input_equal();
            console.log("Current number: ", calculator.curr_num);

            return;

        }else{
            console.log("Digit", val);
            input_digit(val);
        }

        update_display();
        console.log("Current number: ", calculator.curr_num);
    });
}

// Update the calculator display
function update_display(){
    const output = document.querySelector('.input_area');
    output.value = calculator.curr_display;
}


// finding the current number
function find_current_num(){
    console.log("Finding current number -----------------");
    const {curr_display} = calculator;
    const display_length = curr_display.length;
    let non_digits = "+-*/()";
    let i = 0;
    // loop through the current display from the back, and find the next non-digit
    for(i = display_length-1; i >= 0; i--){
        if(non_digits.includes(curr_display[i])){
            break;
        }
    }

    return curr_display.substring(i+1);

}