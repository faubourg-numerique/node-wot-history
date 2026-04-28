# @dih-fbn/node-wot-history

An extension for the [Eclipse Thingweb node-wot](https://github.com/eclipse-thingweb/node-wot) framework to implement and manage a temporal history of properties. It automatically leverages WoT actions to transmit temporal history data seamlessly.

> [!WARNING]
> This package is currently under development for our organization's specific needs. It is not intended for production use yet and APIs may change.

## Installation

```
npm i @dih-fbn/node-wot-history
```

## Usage

Import the `useHistory` hook from the library

```ts
import { useHistory } from "@dih-fbn/node-wot-history";
```

Define your properties as temporal by setting the `temporal: true` custom flag in your Thing Description

```ts
const partialThingDescription = {
    title: "Counter",
    properties: {
        counter: {
            type: "number",
            readonly: true,
            temporal: true
        }
    }
};
```

Call `useHistory` by passing your `WoT.ExposedThing` or `WoT.ConsumedThing`

```ts
const WoT = await servient.start();
const td = await WoT.requestThingDescription("http://localhost:8080/counter");
const thing = await WoT.consume(td);

useHistory(thing);
```

## Full examples

### Server

```ts
import { useHistory } from "@dih-fbn/node-wot-history";
import { HttpServer } from "@node-wot/binding-http";
import { Servient } from "@node-wot/core";

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
```

### Client

```ts
import { useHistory } from "@dih-fbn/node-wot-history";
import { HttpClientFactory } from "@node-wot/binding-http";
import { Servient } from "@node-wot/core";

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

    await thing.invokeAction("increment")
    console.log("Action invoked : 'increment'");

    interactionOutput = await thing.readProperty("counter");
    console.log("Counter :", await interactionOutput.value());

    await thing.invokeAction("increment")
    console.log("Action invoked : 'increment'");

    interactionOutput = await thing.readProperty("counter");
    console.log("Counter :", await interactionOutput.value());

    await thing.invokeAction("decrement")
    console.log("Action invoked : 'decrement'");

    interactionOutput = await thing.readProperty("counter");
    console.log("Counter :", await interactionOutput.value());

    interactionOutput = await thing.readPropertyHistory("counter");
    console.log("Counter history :", await interactionOutput.value());
}

main();
```
