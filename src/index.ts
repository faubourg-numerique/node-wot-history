import { pascalCase } from "change-case";

function getPropertyHistoryActionName(name: string) {
    return `get${pascalCase(name)}History`;
}

async function useHistoryOnExposedThing(thing: WoT.ExposedThing) {
    const propertyHistoryReadHandlers: { [name: string]: () => Promise<WoT.InteractionInput> } = {};

    thing.handleReadPropertyHistory = async (name: string) => {
        return await propertyHistoryReadHandlers[name]();
    };

    thing.setPropertyHistoryReadHandler = (name: string, handler: () => Promise<WoT.InteractionInput>) => {
        propertyHistoryReadHandlers[name] = handler;
        return thing;
    };

    for (const propertyName of Object.keys(thing.properties)) {
        const actionName = getPropertyHistoryActionName(propertyName);

        thing.actions[actionName] = {
            title: `Retrieve the history of the "${propertyName}" property`,
            output: {
                type: "array"
            }
        };

        thing.setActionHandler(actionName, async () => {
            return await thing.handleReadPropertyHistory(propertyName);
        });
    }
}

async function useHistoryOnConsumedThing(thing: WoT.ConsumedThing) {
    thing.readPropertyHistory = async (name: string) => {
        const actionName = getPropertyHistoryActionName(name);
        return await thing.invokeAction(actionName);
    };
}

async function useHistory(thing: WoT.ExposedThing | WoT.ConsumedThing) {
    if (thing.expose) {
        useHistoryOnExposedThing(thing);
    } else {
        useHistoryOnConsumedThing(thing);
    }
}

export { useHistory };
