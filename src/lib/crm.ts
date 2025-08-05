// src/lib/crm.ts
// CRM functionality for managing contacts

interface Contact {
  company: string;
  name: string;
  city: string;
  commodity: string;
  contact: string;
  email: string;
  phone?: string;
}

// In-memory storage for demo purposes
// In production, this would use a database
let crmContacts: Contact[] = [];

/**
 * Add contact to CRM system
 */
export async function addToCRM(contact: Contact): Promise<void> {
  try {
    // Check if contact already exists (by email)
    const existingContact = crmContacts.find(c => c.email === contact.email);
    
    if (!existingContact) {
      crmContacts.push({
        ...contact,
        // Add timestamp or additional CRM fields if needed
      });
      
      console.log('Contact added to CRM:', contact.name, contact.email);
    } else {
      console.log('Contact already exists in CRM:', contact.email);
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