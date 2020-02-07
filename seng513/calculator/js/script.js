// Wait until html and css is fully loaded before executing javascript
window.addEventListener("load", process_calculator);

let calculator = {
    curr_display: "0",
    curr_num: "",
    prev_val: "",
    exp_completed: false
};

// function will cover all digits
function input_digit(digit){
    console.log("function input_digit");
    const {curr_display} = calculator;
    if(curr_display === '0'){
        calculator.curr_display = digit;
    }else{
        calculator.curr_display = curr_display + digit;
    }
    calculator.curr_num += digit;
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
    // if the function is just single backspace clear
    if(clear === "clear"){
        // this is the case if i just calculated something, in which i want C to do like AC, clear everything
        // OR, the case where i have just a single digit left, i should still display 0
        if(display_length <= 1){
            calculator.curr_display = "0";
        }else{
            calculator.curr_display = curr_display.substring(0,display_length-1);
        }
        if(!isNaN(last_input) || last_input === "."){
            calculator.curr_num = curr_num.substring(0, display_length-1);
        }
    }else{
        // the AC all clear
        calculator.curr_display = "0";
        calculator.curr_num = "";

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
    if((calculator.prev_val !== "") && (calculator.curr_display === "")){
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


// evaluate the current calculator display
function input_equal(){
    console.log("Evaluating current expression");
    // if the current display has something in it, evaluate it. However, if its empty (only when you just did a
    // calculation, just show the previous value
    if(calculator.curr_display !== ""){
        calculator.curr_display = eval(calculator.curr_display);
    }else{
        calculator.curr_display = calculator.prev_val;
    }

    update_display();

    calculator.curr_num = "";
    calculator.prev_val = calculator.curr_display;
    calculator.exp_completed = true;
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


        if(!target.matches("button")){
            console.log("Button was not pressed");
            return;
        }
        if(target.className === "operator"){
            console.log("Operator", val);
            input_operator(val);

        }else if(target.className === "decimal"){
            console.log("Decimal", val);
            input_decimal();

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
