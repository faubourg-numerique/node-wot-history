import { HttpClientFactory } from "@node-wot/binding-http";
import { Servient } from "@node-wot/core";
import sleep from "sleep-promise";

import { useHistory } from "../dist";

const servient = new Servient();
servient.addClientFactory(new HttpClientFactory());

async function main() {
    const WoT = await servient.start();
    const td = await WoT.requestThingDescription("http://localhost:8080/counter");
    const thing = await WoT.consume(td);

    useHistory(thing);

    let interactionOutput: WoT.InteractionOutput;

    interactionOutput = await thing.readProperty("counter");
    console.log("Counter :", await interactionOutput.value());

    await sleep(2000);

    await thing.invokeAction("increment")
    console.log("Action invoked : 'increment'");

    interactionOutput = await thing.readProperty("counter");
    console.log("Counter :", await interactionOutput.value());

    await sleep(2000);

    await thing.invokeAction("increment")
    console.log("Action invoked : 'increment'");

    interactionOutput = await thing.readProperty("counter");
    console.log("Counter :", await interactionOutput.value());

    await sleep(2000);

    await thing.invokeAction("decrement")
    console.log("Action invoked : 'decrement'");

    interactionOutput = await thing.readProperty("counter");
    console.log("Counter :", await interactionOutput.value());

    await sleep(2000);

    interactionOutput = await thing.readPropertyHistory("counter");
    console.log("Counter history :", await interactionOutput.value());
}

main();
