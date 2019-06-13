
import { Base } from '../_base';
import { Person, Vessel, PrimaryContactID } from '../_lookups';
import { CouchID } from './couch-id';
import { BoatnetDate } from './boatnet-date';

declare type MessageStatus = string; // TODO
declare type PriorityLevel = string; // TODO
declare type MessageType = string; // Email, Phone Call, Text, In-Person Conversation

export interface Receipt {
    receivedBy: (Person | Vessel);
    receivedDate: BoatnetDate;
}

/*
General approach

- Messages datastore
- Encrypted
- User writes messages to user db, sync to center user db

- MasterDB <-> UserDB synchronization

Recipients sending to Organization - need to noodle through it

*/

export const MessageAttachmentTypeName = 'message-attachment';
export interface MessageAttachment extends Base {
    // Attachments - any record that has an ID can have an attachment
    title?: string;
    type?: string;
    attachment?: object;
}

export const MessageTypeName = 'message';
export interface Message extends Base {
    /*
    Search for all comms by:
    - vessel
    - person (captain, observer, etc.)
    - trip
    - date range
    - status
    - etc.
    */

    messageType: MessageType; //
    sender: CouchID; // of the Person record
    recipients?: CouchID[]; // of Person or Organization (use sw to show people on a vessel)
    sentDateTime: BoatnetDate;
    priority: PriorityLevel;
    subject?: string;
    associatedRecords?: CouchID[]; // Any record with which to associate
        // Trips, Deployments, Hauls, VesselSelectionResult, etc ...
    message: string;
    receipt?: Receipt[];
    status?: MessageStatus; // Sent, Unsent, Failed, Retried 1st
    failedToSendDate?: BoatnetDate[];

    attachments?: MessageAttachment[];
    // Message Category? - Safety Decal, Initial Contact, Vessel Selection

}
