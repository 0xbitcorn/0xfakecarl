import Vibrant from "node-vibrant"; //for finding predominant color of image
import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';

async function importModulesFromDir(directoryPath) {
  const files = await fs.readdir(directoryPath);
  const importedModules = {};
  for (const file of files) {
    if (file.endsWith('.mjs')) {
      const filePath = path.resolve(path.join(directoryPath, file));
      const moduleName = path.parse(file).name;
      const module = await import(pathToFileURL(filePath));
      importedModules[moduleName] = module.default || module;
    }
  }
  return importedModules;
}

async function getPredominantColor(imagePath) {
    try {
        const vibrant = new Vibrant(imagePath);
        const palette = await vibrant.getPalette();
        const predominantColor = palette.Vibrant.hex;
        return predominantColor;
    } catch (error) {
        console.error("Error:", error.message);
        return null;
    }
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

async function randomSelect(randomPlayers, winnersToSelect = 1, nopemoji = false) {
    var totalentries = 0;
    var currUser = "";
    var numEntries = 0;
    const entries = [];

    //check for multi-entry
    randomPlayers.forEach((element) => {
        if (element.includes(",")) {
            currUser = element.split(",")[0];
            numEntries = element.split(",")[1];
        } else {
            currUser = element;
            numEntries = 1;
        }
        for (let i = 0; i < numEntries; i++) {
            entries[i + totalentries] = currUser;
            totalentries++;
        }
    });

    if (winnersToSelect > entries.length) {
        winnersToSelect = entries.length;
    }

    const winners = [];

    for (let i = 1; i <= winnersToSelect; i++) {
        console.log("Picking winner " + i + "...");
        let randomIndex = getRndInteger(0, entries.length);
        winners.push(entries[randomIndex]);

        if (winnersToSelect > 1 && i < winnersToSelect) {
            console.log("Removing selected winner...");
            entries.splice(randomIndex, 1);
        }
    }
    return winners.join(" ");
}

function getNopemoji() {
    const nopeAvocado = 5; //% chance of winning
    const nopeCarrot = 31; //% chance of winning
    const nopePotato = 30; //% chance of winning
    const nopeTomato = 17; //% chance of winning
    const nopeEggplant = 17; //% chance of winning

    var nopes = [];
    for (let i = 1; i < nopeAvocado; i++) {
        nopes.push("🥑");
    }
    for (let i = 1; i < nopeCarrot; i++) {
        nopes.push("🥕");
    }
    for (let i = 1; i < nopeEggplant; i++) {
        nopes.push("🍆");
    }
    for (let i = 1; i < nopePotato; i++) {
        nopes.push("🥔");
    }
    for (let i = 1; i < nopeTomato; i++) {
        nopes.push("🍅");
    }

    var randomIndex = getRndInteger(0, nopes.length);
    return nopes[randomIndex];
}

export { importModulesFromDir, getPredominantColor, toTitleCase, getRndInteger, randomSelect, getNopemoji };
