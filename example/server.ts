import { HttpServer } from "@node-wot/binding-http";
import { Servient } from "@node-wot/core";

import { useHistory } from "../dist";

const servient = new Servient();
servient.addServer(new HttpServer({ port: 8080 }));

const partialThingDescription = {
    title: "Counter",
    properties: {
        counter: {
            type: "number",
            readonly: true,
            temporal: true
        }
    },
    actions: {
        increment: {
            title: "Increment the counter"
        },
        decrement: {
            title: "Decrement the counter"
        }
    }
};

let counter = 0;
let counterHistory = [counter];

async function main() {
    const WoT = await servient.start();

    //@ts-ignore
    const thing = await WoT.produce(partialThingDescription);

    useHistory(thing);

    thing.setPropertyReadHandler("counter", async () => {
        return counter;
    });

    thing.setPropertyHistoryReadHandler("counter", async () => {
        return counterHistory;
    });

    thing.setActionHandler("increment", async () => {
        counter++;
        counterHistory.push(counter);
        return undefined;
    });

    thing.setActionHandler("decrement", async () => {
        counter--;
        counterHistory.push(counter);
        return undefined;
    });

    thing.expose();
    console.log("Counter exposed on http://localhost:8080");
}

main();
