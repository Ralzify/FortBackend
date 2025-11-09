const readline = require("readline");
const path = require("path");

function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question("Do you want to modify the backend? (Y/N) ", (answer) => {
        if (answer.toUpperCase() === "Y") {
            rl.close();
            showMenu();
        } else {
            rl.close();
            require(path.join(__dirname, "..", "index.js"));
        }
    });
}

function showMenu() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log("\nWhat would you like to modify?");
    console.log("(A) Toggle Straight Bloom");
    console.log("(B) Modify CurveTables");
    console.log("(C) Skip and start backend\n");

    rl.question("Select an option: ", (choice) => {
        rl.close();

        switch (choice.toUpperCase()) {
            case "A":
                const bloomPath = path.join(__dirname, "bloom.js");
                delete require.cache[require.resolve(bloomPath)];
                require(bloomPath);
                break;
            case "B":
                require(path.join(__dirname, "..", "index.js"));
                break;
            case "C":
                require(path.join(__dirname, "..", "index.js"));
                break;
            default:
                console.log("\nInvalid choice. Returning to main menu...\n");
                main();
                break;
        }
    });
}

main();

module.exports = { main, showMenu };