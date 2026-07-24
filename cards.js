import fs from 'node:fs';
import YAML from 'yaml';
import { exec } from 'child_process';

const yaml = fs.readFileSync('./cards.yml', 'utf8');
const companies = YAML.parse(yaml);
const template = fs.readFileSync("./template.svg", 'utf8');


const COLORS = {
    "basic": "#404040",
    "red": "#702323",
    "green": "#107040",
    "yellow": "#707010"
};
const COMPANY_NAMES = {
    "basic":    "Basic",
    "red":      "Destruction Inc.",
    "green":    "Green Inc.",
    "yellow":   "Yellow Inc."
};

let list = "";
let basicList = "";

for (let company in companies) {
    for (let shipName in companies[company]) {
        const ship = companies[company][shipName];

        let effects = [];
        if (ship.effects.draw) {
            effects.push("Draw " + (ship.effects.draw == 1 ? "1 card" : (ship.effects.draw + " cards")));
        }
        if (ship.effects.recall) {
            effects.push("Recall");
        }

        let actions = 0;
        if (ship.effects.dmg) actions++;
        if (ship.effects.heal) actions++;
        if (ship.effects.fuel) actions++;

        let actionsString = "";
        const ACTION_SIZE = 64;
        let actionsY = (effects.length == 0 ? 64 + 128 : 64 + 128 - 24);
        if (ship.effects.dmg) {
            actionsString += `
                <use href="#dmg" y="${actionsY - ACTION_SIZE/2}" x="${128 - ACTION_SIZE/2 - ACTION_SIZE/2 * (actions - 1)}" />
                <text x="${128 - ACTION_SIZE/2 * (actions - 1)}" y="${actionsY + 3}" class="amt">${ship.effects.dmg}</text>
            `;
        }
        if (ship.effects.heal) {
            actionsString += `
                <use href="#${ship.effects.heal < 0 ? "hploss": "heal"}" y="${actionsY - ACTION_SIZE/2}" x="${128 - ACTION_SIZE/2 + ACTION_SIZE/2 * (actions - 1)}" />
               <text x="${128 + ACTION_SIZE/2 * (actions - 1)}" y="${actionsY + 3}" class="amt">${ship.effects.heal}</text>
             `;
        }
        if (ship.effects.fuel) {
            actionsString += `
                <use href="#fuel" y="${actionsY - ACTION_SIZE/2}" x="${128 - ACTION_SIZE/2 - ACTION_SIZE/2 * (actions - 1)}" />
                <text x="${128 - ACTION_SIZE/2 * (actions - 1)}" y="${actionsY + 3}" class="amt">${ship.effects.fuel}</text>
             `;
        }


        const svg = template.replace("Name of Ship", shipName)
            .replace("Company", COMPANY_NAMES[company])
            .replace(COLORS.basic, COLORS[company])
            .replace("<!-- Card Actions -->", actionsString)
            .replace("Card Effect", effects.join(". "))
            .replace("Fuel", ship.fuel);
        const shipId = shipName.replace(/\s+/g, "-").toLowerCase();
        fs.writeFileSync("out/" + shipId + ".svg", svg);
        exec(`convert out/${shipId}.svg png/${shipId}.png`);

        if (company == "basic") {
            let amt = {
                "Heavy Ship": 2,
                "Light Ship": 6,
                "Support Ship": 1
            }[shipName];
            basicList += `${amt} https://raw.githubusercontent.com/allen-b1/starships/refs/heads/master/png/${shipId}.png\n`;
        } else {
            list += `3 https://raw.githubusercontent.com/allen-b1/starships/refs/heads/master/png/${shipId}.png\n`;
        }
    }
}

fs.writeFileSync("out/list.txt", list);
fs.writeFileSync("out/list-basic.txt", basicList);