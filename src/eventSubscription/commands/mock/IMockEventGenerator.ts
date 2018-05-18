/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IEventSchema } from "./IEventSchema";

export interface IMockEventGenerator {
    eventSubscriptionId: string;
    numberOfEvents: number;
    jsonSchemaFakerOptions?: {
        alwaysFakeOptionals?: boolean,
        useDefaultValue?: boolean
    };
    eventSchema: IEventSchema;
}
