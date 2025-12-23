import type { RecordModel } from 'pocketbase';

// Base record with common PocketBase fields
export interface BaseRecord extends RecordModel {
	id: string;
	created: string;
	updated: string;
}

export interface Address extends BaseRecord {
	line: string;
	line_2?: string;
	zip: string;
	city: string;
	state?: string;
	country: string;
}

export interface Agency extends BaseRecord {
	name: string;
	phone?: string;
	email?: string;
	website?: string;
	address?: string; // relation ID
}

export interface Store extends BaseRecord {
	name: string;
	phone?: string;
	email?: string;
	website?: string;
	address?: string; // relation ID
}

export interface AgencyStore extends BaseRecord {
	agency?: string; // relation ID
	store?: string; // relation ID
	relation_hash?: string;
}

export interface Contact extends BaseRecord {
	name: string;
	last_name: string;
	phone: string;
	email: string;
	acceptance: boolean;
	virtual_check_active: boolean;
	email_sent: boolean;
	redeemed_at?: Date;
	address?: string; // relation ID
	agency: string; // relation ID
	store: string; // relation ID
}

// Expanded types for relations
export interface AgencyStoreExpanded extends AgencyStore {
	expand?: {
		agency?: Agency;
		store?: Store;
	};
}

export interface ContactExpanded extends Contact {
	expand?: {
		agency?: Agency;
		store?: Store;
		address?: Address;
	};
}

// Form submission type
export interface ContactFormData {
	name: string;
	last_name: string;
	phone: string;
	email: string;
}
