// Wait until html and css is fully loaded before executing javascript
window.addEventListener("load", process_calculator);

let calculator = {
    curr_display: "0",
    first_op: null,
    waiting_for_second_op: false,
    operator: null
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
}

// function will cover both clear and all clear
// it will just get rid of the last digit, or reset current display to be 0
function input_clear(clear){
    
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
        if(!target.matches("button")){
            console.log("Button was not pressed");
            return;
        }
        if(target.className === "operator"){
            console.log("Operator", target.value);
        }else if(target.className === "decimal"){
            console.log("Decimal", target.value);
        }else if(target.className === "clear"){
            console.log("Clear", target.value);
            input_clear(target.value);
        }else if(target.className === "all-clear"){
            console.log("All Clear", target.value)
            input_clear(target.value);
        }else if(target.className === "equal-sign"){
            console.log("Equal Sign", target.value);
        }else{
            console.log("Digit", target.value);
            input_digit(target.value);
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