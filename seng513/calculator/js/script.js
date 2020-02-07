// Wait until html and css is fully loaded before executing javascript
window.addEventListener("load", process_calculator);

let calculator = {
    curr_display: "0",
    curr_num: ""
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
    // TODO: Check if its for the current number, since on the screen i'll have multiple numbers, decimals allowed for each
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

    const {curr_display} = calculator;
    let display_length = curr_display.length;
    // if the function is just single backspace clear
    if(clear === "clear"){
        calculator.curr_display = curr_display.substring(0,display_length-1);
    }else{
        // the AC all clear
        calculator.curr_display = "0";
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

    // if the last input is already an operator, I will replace it. This is my calculator design, I don't want error
    if(operator_str.includes(last_input)){
        calculator.curr_display = curr_display.substring(0, display_length-1) + op;
    }else{
        //if the last one wasn't an operator already, then continue as usual
        calculator.curr_display += op;
    }
}


// evaluate the current calculator display
function input_equal(){
    console.log("Evaluating current expression");
    calculator.curr_display = eval(calculator.curr_display);
}


// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
// using event listener with arrow function
function process_calculator(){
    console.log("function process_calculator");
    const calc_keys = document.querySelector(".calculator_buttons");
    //console.log(calc_keys);
    calc_keys.addEventListener('click', (event) => {
        // Object deconstruction getting target property of click event.
        // Equivalent to const target = event.target;
        const {target} = event;
        let val = target.value;
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
            console.log("Equal Sign", val);
            input_equal();

        }else{
            console.log("Digit", val);
            input_digit(val);
        }

        update_display();
    });
}

// Update the calculator display
function update_display(){
    const output = document.querySelector('.input_area');
    output.value = calculator.curr_display;
}

update_display();