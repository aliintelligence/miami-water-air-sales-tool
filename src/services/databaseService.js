// src/services/databaseService.js
import {
    defaultCatalog,
    defaultPackages,
    financingOptions as defaultFinancingOptions
  } from '../utils/catalogDefaults';
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  
  export const DatabaseService = {
    // Seed the database with default data
    seedDatabase: async () => {
      console.log('Starting database seeding...');
      
      const results = {
        equipment: 0,
        packages: 0,
        financing: 0,
        errors: []
      };
  
      try {
        // Get auth token
        const token = localStorage.getItem('authToken');
        
        // Seed through API endpoint
        const response = await fetch(`${API_URL}/seed`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            equipment: defaultCatalog,
            packages: defaultPackages,
            financingOptions: defaultFinancingOptions
          })
        });
        
        if (!response.ok) {
          throw new Error('Seeding failed');
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Database seeding error:', error);
        throw error;
      }
    },
  
    // Export data from database
    exportData: async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        const response = await fetch(`${API_URL}/export`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Export failed');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Export error:', error);
        throw error;
      }
    },
  
    // Import data to database
    importData: async (data) => {
      try {
        const token = localStorage.getItem('authToken');
        
        const response = await fetch(`${API_URL}/import`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error('Import failed');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Import error:', error);
        throw error;
      }
    }
  };