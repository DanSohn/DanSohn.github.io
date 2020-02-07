// Wait until html and css is fully loaded before executing javascript
window.addEventListener("load", process_calculator);


// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
// using event listener with arrow function
function process_calculator(){
    console.log("function process_calculator");
    const calc_keys = document.querySelector(".calculator_buttons");
    console.log(calc_keys);
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
        }else if(target.className === "all-clear"){
            console.log("All Clear", target.value);
        }else if(target.className === "equal-sign"){
            console.log("Equal Sign", target.value);
        }else{
            console.log("Digit", target.value);
        }

    });
}

function update_display(){
    const output = document.querySelector('input_area');
    output.value = calculator.display_value;
}
