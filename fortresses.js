import fs from 'node:fs';
import os from 'node:os';
import YAML from 'yaml';
import { exec } from 'child_process';
import { wrap, createCard, createDeck } from './tts.js';
import { execSync } from 'node:child_process';

const yaml = fs.readFileSync('./fortresses.yml', 'utf8');
const fortresses = YAML.parse(yaml);
const template = fs.readFileSync("./fortress-template.svg", 'utf8');

let cards = [];
for (let fortressName in fortresses) {
    let description = fortresses[fortressName];

    if (description.split(":").length > 1) {
        description = `<tspan fill="#d4ccff">` + split(description.split(":")[0]) + ":</tspan>" + 
            "<tspan x=\"0\" dy=\"0.5em\"></tspan>" + split(description.split(":").slice(1).join(":"));
    } else {
        description = split(description);
    }

    const svg = template.replace("Ability Text", description)
        .replace("Name of Fortress", fortressName);
    const id = fortressName.toLowerCase().replace(/\s+/g, "-");
    fs.writeFileSync("out/fortress-" + id + ".svg", svg);
    execSync(`convert out/fortress-${id}.svg png/fortress-${id}.png`);
    cards.push([`https://raw.githubusercontent.com/allen-b1/starships/refs/heads/master/png/fortress-${id}.png`]);
}

function split(text) {
    return "<tspan x=\"0\">" + text.replaceAll("\n", "</tspan><tspan x=\"0\" dy=\"1.2em\">") + "</tspan>";
}

execSync(`convert fortress-back.svg png/fortress-back.png`);
fs.writeFileSync(os.homedir() + "/.local/share/Tabletop Simulator/Saves/Saved Objects/starships/fortress-deck.json", 
    JSON.stringify(wrap(createDeck("https://raw.githubusercontent.com/allen-b1/starships/refs/heads/master/png/fortress-back.png", cards)), null, "\t")
);
