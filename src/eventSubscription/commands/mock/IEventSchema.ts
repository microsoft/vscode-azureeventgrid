/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export interface IEventSchema {
    properties: {
        [key: string]: {
            pattern?: string,
            // tslint:disable-next-line:no-reserved-keywords
            default?: string
        }
    };
}
