import fs from 'node:fs';
import os from 'node:os';
import YAML from 'yaml';
import { exec } from 'child_process';
import { wrap, createCard, createDeck } from './tts.js';
import { execSync } from 'node:child_process';

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


function split(text) {
    return "<tspan x=\"0\">" + text.replaceAll("\n", "</tspan><tspan x=\"0\" dy=\"1.2em\">") + "</tspan>";
}


function upgrade(ship) {
    if (ship.effects.dmg) {
        ship.effects.dmg++;
        if (ship.fuel >= 2 && !(ship.effects.heal > 0) && !ship.effects.draw && !ship.effects.havoc && ship.effects.hologram == null) {
            ship.effects.dmg++;
        }
    }
    if (ship.effects.heal > 0)
        ship.effects.heal++;
    if (ship.effects.fuel)
        ship.effects.fuel++;

    if (ship.effects.draw)
        ship.effects.draw++;
    if (ship.effects.havoc)
        ship.effects.havoc++;
    return ship;
}

function generateShip(ship, shipName, company) {
    let effects = [];
    if (ship.effects.peacekeeper) {
        effects.push("for each card\nin your hand")   
    }
    if (ship.effects.draw) {
        effects.push("Draw " + (ship.effects.draw == 1 ? "1 card" : (ship.effects.draw + " cards")));
    }
    if (ship.effects.havoc) {
        effects.push("Play the top\n" + (ship.effects.havoc == 1 ? "1 card" : (ship.effects.havoc + " cards")) + "\nof your draw pile");
    }
    if (ship.effects.hologram == 0) {
        effects.push("Put all 0-cost cards\nfrom your discard pile\ninto your hand")
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
            <use href="#dmg" y="${actionsY - ACTION_SIZE/2}" x="${0 - ACTION_SIZE/2 - ACTION_SIZE/2 * (actions - 1)}" />
            <text x="${0 - ACTION_SIZE/2 * (actions - 1)}" y="${actionsY + 3}" class="amt">${ship.effects.dmg}</text>
        `;
    }
    if (ship.effects.heal) {
        actionsString += `
            <use href="#${ship.effects.heal < 0 ? "hploss": "heal"}" y="${actionsY - ACTION_SIZE/2}" x="${0 - ACTION_SIZE/2 + ACTION_SIZE/2 * (actions - 1)}" />
            <text x="${0 + ACTION_SIZE/2 * (actions - 1)}" y="${actionsY + 3}" class="amt">${ship.effects.heal}</text>
            `;
    }
    if (ship.effects.fuel) {
        actionsString += `
            <use href="#fuel" y="${actionsY - ACTION_SIZE/2}" x="${0 - ACTION_SIZE/2 - ACTION_SIZE/2 * (actions - 1)}" />
            <text x="${0 - ACTION_SIZE/2 * (actions - 1)}" y="${actionsY + 3}" class="amt">${ship.effects.fuel}</text>
            `;
    }


    const svg = template.replace("Name of Ship", shipName)
        .replace("Company", COMPANY_NAMES[company])
        .replace(COLORS.basic, COLORS[company])
        .replace("<!-- Card Actions -->", actionsString)
        .replace("Card Effect", split(effects.join(".\n")))
        .replace("Fuel", ship.fuel);
    return svg;
}

let cards = [];
let basicCards = [];

for (let company in companies) {
    for (let shipName in companies[company]) {
        const ship = companies[company][shipName];
        const svg = generateShip(ship, shipName, company);
        const svgUpgraded = generateShip(upgrade(ship), shipName + "+", company);

        const shipId = shipName.replace(/\s+/g, "-").toLowerCase();
        fs.writeFileSync("out/" + shipId + ".svg", svg);
        fs.writeFileSync("out/" + shipId + "-upgraded.svg", svgUpgraded);
        execSync(`convert out/${shipId}.svg png/${shipId}.png`);
        execSync(`convert out/${shipId}-upgraded.svg png/${shipId}-upgraded.png`);

        if (company == "basic") {
            let amt = {
                "Heavy Ship": 2,
                "Light Ship": 5,
                "Support Ship": 2
            }[shipName];
            for (let i = 0; i < amt; i++) {
                basicCards.push([
                    `https://raw.githubusercontent.com/allen-b1/starships/refs/heads/master/png/${shipId}.png`,
                    `https://raw.githubusercontent.com/allen-b1/starships/refs/heads/master/png/${shipId}-upgraded.png`
                ]);
            }
        } else {
            for (let i = 0; i < 3; i++) {
                cards.push([
                    `https://raw.githubusercontent.com/allen-b1/starships/refs/heads/master/png/${shipId}.png`,
                    `https://raw.githubusercontent.com/allen-b1/starships/refs/heads/master/png/${shipId}-upgraded.png`
                ]);
            }
        }
    }
}

fs.writeFileSync(os.homedir() + "/.local/share/Tabletop Simulator/Saves/Saved Objects/starships/basic-deck.json", 
    JSON.stringify(wrap(createDeck("https://img.freepik.com/premium-photo/square-space-background-with-nebula-stars-watercolor-galaxy-illustration_924727-2431.jpg?w=2000", basicCards)), null, "\t")
);
fs.writeFileSync(os.homedir() + "/.local/share/Tabletop Simulator/Saves/Saved Objects/starships/rewards-deck.json", 
    JSON.stringify(wrap(createDeck("https://img.freepik.com/premium-photo/square-space-background-with-nebula-stars-watercolor-galaxy-illustration_924727-2431.jpg?w=2000", cards)), null, "\t")
);