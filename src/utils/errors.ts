/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from './localize';

// tslint:disable-next-line:export-name
export class ArgumentError extends Error {
    constructor(obj: object) {
        super(localize('argumentError', 'Invalid {0}.', obj.constructor.name));
    }
}
