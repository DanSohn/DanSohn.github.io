// Wait until html and css is fully loaded before executing javascript
window.addEventListener("load", process_calculator);


// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
// using event listener with arrow function
function process_calculator(){
    console.log("function process_calculator");
    const calc_keys = document.querySelector(".calculator_buttons");
    console.log(calc_keys);
    calc_keys.addEventListener('click', (event) => {
        const {target} = event;
        if(!target.matches("button")){
            console.log("Button was not pressed");
            return;
        }
        if(target.className === "operator"){
            console.log("Operator", target.value);
            return;
        }
    });
}

function get_key_pressed(){
    console.log("Getting key pressed");
}
function update_display(){
    const output = document.querySelector('input_area');
    output.value = calculator.display_value;
}
