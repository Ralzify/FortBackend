const fs = require("fs");
const path = require("path");
const readline = require("readline");

const defaultGamePath = path.join(__dirname, "..", "CloudStorage", "DefaultGame.ini");
const curveTables = require(path.join(__dirname, "..", "responses", "curves.json"));

function readFile() {
    return fs.readFileSync(defaultGamePath, "utf8");
}

function writeFile(content) {
    fs.writeFileSync(defaultGamePath, content.trim() + "\n", "utf8");
}

function ensureCurveTablesBlock(content) {
    if (!content.includes("# CurveTables")) {
        content = "# CurveTables\n[AssetHotfix]\n\n" + content;
    }
    return content;
}

function addCurveTable(id, amount) {
    const preset = curveTables[id];
    let value = preset.type === "amount" ? amount : preset.staticValue;

    let newLine = `+CurveTable=/Game/Athena/Balance/DataTables/AthenaGameData;RowUpdate;${preset.key};0;${value}`;

    let content = readFile();
    content = ensureCurveTablesBlock(content);

    if (content.includes(newLine)) {
        console.log(`\n${preset.name} is already applied.\n`);
        return;
    }

    const blockStart = content.indexOf("# CurveTables");
    const assetHotfixIndex = content.indexOf("[AssetHotfix]", blockStart);

    if (assetHotfixIndex === -1) {
        console.log("\nCurveTables block is malformed. Fix the formatting and try again.\n");
        return;
    }

    const insertAt = content.indexOf("\n", assetHotfixIndex) + 1;

    content = content.slice(0, insertAt) + newLine + "\n" + content.slice(insertAt);
    
    content = content.replace(/\n+# Straight Bloom/g, "\n\n# Straight Bloom");

    writeFile(content);

    console.log(`\nAdded: ${preset.name} (${value}) ! \n`);
}

function removeCurveTable(id) {
    const preset = curveTables[id];
    let content = readFile();

    const lineMatch = new RegExp(`\\+CurveTable=.*${preset.key}.*`, "g");
    content = content.replace(lineMatch, "");

    writeFile(content);
    console.log(`\nRemoved: ${preset.name}\n`);
}

function menuAdd() {
    console.log("\nSelect CurveTable to ADD:");
    Object.entries(curveTables).forEach(([id, info]) =>
        console.log(`(${id}) ${info.name}`)
    );

    ask("Choice: ", (choice) => {
        if (!curveTables[choice]) return back();

        if (curveTables[choice].type === "static") {
            addCurveTable(choice);
            return back();
        }

        ask("Enter amount (0 - 30000+): ", (val) => {
            addCurveTable(choice, val);
            back();
        });
    });
}

function menuDelete() {
    console.log("\nSelect CurveTable to DELETE:");
    Object.entries(curveTables).forEach(([id, info]) =>
        console.log(`(${id}) ${info.name}`)
    );

    ask("Choice: ", (choice) => {
        if (!curveTables[choice]) return back();
        removeCurveTable(choice);
        back();
    });
}

function ask(question, callback) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
        rl.close();
        callback(answer.trim());
    });
}

function back() {
    const backend = require(path.join(__dirname, "backend.js"));
    backend.main();
}

ask("\nWould you like to add or delete a CurveTable? (A/D) ", (choice) => {
    if (choice.toUpperCase() === "A") return menuAdd();
    if (choice.toUpperCase() === "D") return menuDelete();
    back();
});
