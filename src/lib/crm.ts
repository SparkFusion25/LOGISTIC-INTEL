// src/lib/crm.ts
// CRM functionality for managing contacts

import { supabase } from './supabase';

interface Contact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  city?: string;
  commodity?: string;
  last_contacted?: string;
  notes?: string;
}

interface SearchContact {
  company: string;
  name: string;
  city: string;
  commodity: string;
  contact: string;
  email: string;
  phone?: string;
}

// In-memory storage for demo purposes (since we're not using real Supabase)
// In production, this would use the Supabase database
let crmContacts: Contact[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    company: 'Global Electronics Trading Corp',
    email: 'sarah.chen@getc.com',
    phone: '+86-21-123456',
    city: 'Shanghai',
    commodity: 'Electronics',
    last_contacted: '2024-01-15T10:30:00Z',
    notes: 'Initial contact made via market intelligence search. Interested in Q2 shipment volumes.'
  },
  {
    id: '2',
    name: 'Miguel Rodriguez',
    company: 'European Auto Parts Ltd',
    email: 'm.rodriguez@eaparts.eu',
    phone: '+49-40-123456',
    city: 'Hamburg',
    commodity: 'Auto Parts',
    last_contacted: '2024-01-12T14:20:00Z',
    notes: 'Follow up needed on pricing for ocean freight rates.'
  },
  {
    id: '3',
    name: 'Jin Kim',
    company: 'Pacific Textiles Manufacturing',
    email: 'j.kim@pactextiles.com',
    phone: '+82-51-123456',
    city: 'Busan',
    commodity: 'Textiles',
    notes: 'New contact from search. No previous outreach.'
  }
];

/**
 * Add contact to CRM system (from search results)
 */
export async function addToCRM(searchContact: SearchContact): Promise<void> {
  try {
    // Check if contact already exists (by email)
    const existingContact = crmContacts.find(c => c.email === searchContact.email);
    
    if (!existingContact) {
      const newContact: Contact = {
        id: Date.now().toString(),
        name: searchContact.name,
        company: searchContact.company,
        email: searchContact.email,
        phone: searchContact.phone,
        city: searchContact.city,
        commodity: searchContact.commodity,
        notes: `Added from market intelligence search on ${new Date().toLocaleDateString()}`
      };
      
      crmContacts.push(newContact);
      console.log('Contact added to CRM:', searchContact.name, searchContact.email);
    } else {
      console.log('Contact already exists in CRM:', searchContact.email);
    }
  } catch (error) {
    console.error('Error adding contact to CRM:', error);
    throw new Error('Failed to add contact to CRM');
  }
}

/**
 * Get all CRM contacts
 */
export function getCRMContacts(): Contact[] {
  return crmContacts;
}

/**
 * Fetch CRM contacts (mimics Supabase API)
 */
export async function fetchCRMContacts(): Promise<Contact[]> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In production, this would be:
    // const { data, error } = await supabase
    //   .from('crm_contacts')
    //   .select('*')
    //   .order('created_at', { ascending: false });
    // if (error) throw error;
    // return data;
    
    return [...crmContacts].sort((a, b) => {
      // Sort by last_contacted or creation order
      const aTime = a.last_contacted ? new Date(a.last_contacted).getTime() : 0;
      const bTime = b.last_contacted ? new Date(b.last_contacted).getTime() : 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error('Error fetching CRM contacts:', error);
    throw new Error('Failed to fetch CRM contacts');
  }
}

/**
 * Update CRM contact note (mimics Supabase API)
 */
export async function updateCRMContactNote(id: string, note: string): Promise<void> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In production, this would be:
    // const { error } = await supabase
    //   .from('crm_contacts')
    //   .update({ notes: note, last_contacted: new Date().toISOString() })
    //   .eq('id', id);
    // if (error) throw error;
    
    const contactIndex = crmContacts.findIndex(c => c.id === id);
    if (contactIndex === -1) {
      throw new Error('Contact not found');
    }
    
    crmContacts[contactIndex] = {
      ...crmContacts[contactIndex],
      notes: note,
      last_contacted: new Date().toISOString()
    };
    
    console.log('Updated contact note for:', crmContacts[contactIndex].name);
  } catch (error) {
    console.error('Error updating CRM contact note:', error);
    throw new Error('Failed to update contact note');
  }
}

/**
 * Update CRM contact
 */
export async function updateCRMContact(email: string, updates: Partial<Contact>): Promise<void> {
  try {
    const contactIndex = crmContacts.findIndex(c => c.email === email);
    
    if (contactIndex !== -1) {
      crmContacts[contactIndex] = { ...crmContacts[contactIndex], ...updates };
      console.log('Contact updated in CRM:', email);
    } else {
      throw new Error('Contact not found in CRM');
    }
  } catch (error) {
    console.error('Error updating CRM contact:', error);
    throw new Error('Failed to update CRM contact');
  }
}

/**
 * Remove contact from CRM
 */
export async function removeCRMContact(email: string): Promise<void> {
  try {
    const initialLength = crmContacts.length;
    crmContacts = crmContacts.filter(c => c.email !== email);
    
    if (crmContacts.length === initialLength) {
      throw new Error('Contact not found in CRM');
    }
    
    console.log('Contact removed from CRM:', email);
  } catch (error) {
    console.error('Error removing CRM contact:', error);
    throw new Error('Failed to remove CRM contact');
  }
}

/**
 * Search CRM contacts
 */
export function searchCRMContacts(query: string): Contact[] {
  const lowercaseQuery = query.toLowerCase();
  
  return crmContacts.filter(contact => 
    contact.company.toLowerCase().includes(lowercaseQuery) ||
    contact.name.toLowerCase().includes(lowercaseQuery) ||
    contact.email.toLowerCase().includes(lowercaseQuery) ||
    contact.city.toLowerCase().includes(lowercaseQuery) ||
    contact.commodity.toLowerCase().includes(lowercaseQuery)
  );
}