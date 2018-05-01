/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { TextDocument, Uri, workspace } from "vscode";
import { IMockEventGenerator } from "../mock/IMockEventGenerator";

// tslint:disable-next-line:no-require-imports
import Chance = require('chance');
// tslint:disable-next-line:no-require-imports
import jsf = require('json-schema-faker');

// tslint:disable-next-line:no-unsafe-any
jsf.extend('chance', () => {
    return new Chance();
});

export async function generateEvents(uri: Uri): Promise<[{}[], IMockEventGenerator]> {
    const doc: TextDocument = await workspace.openTextDocument(uri);
    const eventGenerator: IMockEventGenerator = <IMockEventGenerator>JSON.parse(doc.getText());

    if (eventGenerator.jsonSchemaFakerOptions) {
        // tslint:disable-next-line:no-unsafe-any
        jsf.option(eventGenerator.jsonSchemaFakerOptions);
    }

    const events: Promise<{}>[] = [];
    let count: number = 0;
    while (count < eventGenerator.numberOfEvents) {
        // tslint:disable-next-line:no-unsafe-any
        events.push(jsf.resolve(eventGenerator.eventSchema));
        count += 1;
    }

    return [await Promise.all(events), eventGenerator];
}
