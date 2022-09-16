const path = require('path');
const fs =require('fs');

let map = new Map();
map[' '] = (x, y) => x + y;
map['-'] = (x, y) => x - y; 
map['*'] = (x, y) => x * y;
map['/'] = (x, y) => x / y;
map['%'] = (x, y) => x % y;
map['!'] = (x) => factorial(x);
map['p'] = (x) => isPrime(x);
map['np'] = (x) => { 
    let i = 0;
    let number = 0;
    while (number < x) {
        if (isPrime(i)) {
            number++;
        }
        i++;
    }
     return i - 1;
};

const factorial = (a) => a < 2 ? 1 : a * factorial(a - 1);

// Code taken from https://lucidar.me/fr/web-dev/how-to-check-if-a-number-is-prime-in-javascript/
function isPrime(n) 
{
    // Check if n is less than 2 => not prime
    if (n<2) return false;

    // Loop from 2 to square root of n
    for (let i = 2; i <= Math.sqrt(n); i++) 
        // If i is a divisor of n, n is not prime
        if (n % i == 0) return false;

    return true;
}

module.exports =
    class MathsController extends require('./Controller') {
        constructor(HttpContext) {
            super(HttpContext);
        }
        get() {
            if (this.HttpContext.path.queryString == "?")
            {
                // Send helpPage
                let helpPagePath = path.join(process.cwd(), "wwwroot/helpPages/mathsServiceHelp.html");
                let content = fs.readFileSync(helpPagePath);
                this.HttpContext.response.content("text/html", content);
            }
            else {
                if (this.HttpContext.path.params.op) {
                    let op = this.HttpContext.path.params.op;
                    
                    // Opérateurs qui requièrent un x et un y
                    if ((op == " " ||
                        op == "-" ||
                        op == "*" ||
                        op == "/" ||
                        op == "%" ) &&
                        this.HttpContext.path.params.x && 
                        this.HttpContext.path.params.y) {
                        let x = this.HttpContext.path.params.x;
                        let y = this.HttpContext.path.params.y

                        // Opérateurs sont un nombre
                        if (!isNaN(x) && !isNaN(y)) {
                            this.HttpContext.path.params.value = map[op](x, y); 
                            this.HttpContext.response.JSON(this.HttpContext.path.params);
                        }
                        else {
                            this.HttpContext.path.params.error = "(x or y)) is not a number";
                            this.HttpContext.response.JSON(this.HttpContext.path.params);
                        }
                    }

                    // Opérateur n'ont besoin qu'un n
                    else if ((op == "!" || 
                        op == "p" ||
                        op == "np") &&
                        this.HttpContext.path.params.n) {
                        let n = this.HttpContext.path.params.n

                        this.HttpContext.path.params.value = map[op](n); 
                        this.HttpContext.response.JSON(this.HttpContext.path.params);
                    }
                    else {
                        this.HttpContext.path.params.error = "Op is not a valid type, or there is parameter missing (x and y, or n)";
                        this.HttpContext.response.JSON(this.HttpContext.path.params);
                    }
                }
                else {
                    this.HttpContext.path.params.error = "Parameter op is missing";
                    this.HttpContext.response.JSON(this.HttpContext.path.params);
                }
            }
        }
    }