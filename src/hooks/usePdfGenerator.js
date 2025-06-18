// src/hooks/usePdfGenerator.js
import { useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Custom hook for PDF generation and handling
 */
export const usePdfGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generatedPdf, setGeneratedPdf] = useState(null);

  /**
   * Helper function to get a descriptive equipment name based on ID
   * @param {string} itemId - Equipment ID 
   * @param {Array} allEquipment - Array of all equipment items
   */
  const getEquipmentNameById = (itemId, allEquipment = []) => {
    // First try to find the exact item in the equipment array
    const item = allEquipment.find(eq => eq && eq.id === itemId);
    if (item && item.name) {
      return item.name;
    }
    
    // If not found, provide better descriptive fallbacks based on common naming patterns
    // Water Conditioner types
    if (itemId === 'c1') return 'EC5 Conditioner 75 (8x44)';
    if (itemId === 'c2') return 'TCM Conditioner 75 (8x44)';
    if (itemId === 'c3') return 'EC5 OxyTech (Well) 150 (10x54)';
    
    // Filter types
    if (itemId === 'f1') return 'QRS Carbon Wholehouse Filter (8x44)';
    if (itemId === 'f2') return 'CleanStart (Laundry Station)';
    if (itemId === 'f3') return 'AirMaster (Air Purifier)';
    
    // Drinking water systems
    if (itemId === 'd1') return 'UltreFiner (RO)';
    if (itemId === 'd2') return 'Alkaline';
    if (itemId === 'd3') return 'HydroFiner (Drinking water)';
    
    // Upgrade types
    if (itemId.startsWith('u')) return 'System Upgrade';
    
    // Non-RainSoft products
    if (itemId.startsWith('n')) return 'Additional Product';
    
    // Special add-ons
    if (itemId.startsWith('addon')) return 'Service Add-on';
    
    // Generic fallbacks by type
    if (itemId.startsWith('c')) return 'Water Conditioner';
    if (itemId.startsWith('f')) return 'Water Filter';
    if (itemId.startsWith('d')) return 'Drinking Water System';
    
    // Last resort
    return `Item #${itemId}`;
  };

  /**
   * Fills a PDF form with customer and equipment data
   * @returns {Promise<Uint8Array>} The generated PDF as a Uint8Array
   */
  const fillPdfForm = async (data) => {
    const { 
      customerInfo, 
      selectedPackage,
      selectedEquipment, 
      totalPrice,
      discountedPrice,
      monthlyPayment,
      financingOption,
      financingTerm,
      customRate,
      allEquipment = []
    } = data;

    setIsGenerating(true);
    setError(null);
    setGeneratedPdf(null);

    try {
      console.log('[PDF] Loading PDF template...');
      // Try to fetch from public folder
      const formUrl = '/forms/HDE.pdf';
      
      try {
        const formBytes = await fetch(formUrl).then(res => {
          if (!res.ok) {
            throw new Error(`Failed to load PDF template: ${res.status} ${res.statusText}`);
          }
          return res.arrayBuffer();
        });
        
        const pdfDoc = await PDFDocument.load(formBytes);
        const form = pdfDoc.getForm();

        // Format today's date
        const today = new Date();
        const formattedToday = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

        console.log('[PDF] Filling customer information...');
        // Customer information
        try {
          form.getTextField('txtCustomerFirstName').setText(customerInfo.firstName || '');
          form.getTextField('txtCustomerLastName').setText(customerInfo.lastName || '');
          form.getTextField('txtCustomerEmailAddress').setText(customerInfo.email || '');
          form.getTextField('txtCustomerHomePhoneNbr').setText(customerInfo.phone || '');
          form.getTextField('txtCustomerAddress').setText(customerInfo.address || '');
          form.getTextField('txtCustomerCity').setText(customerInfo.city || '');
          form.getTextField('txtCustomerState').setText(customerInfo.state || '');
          form.getTextField('txtCustomerZip').setText(customerInfo.zip || '');
        } catch (fieldError) {
          console.warn('[PDF] Warning: Error filling customer fields:', fieldError);
          // Continue despite field errors
        }

        // Equipment details
        try {
          if (selectedPackage) {
            console.log('[PDF] Filling package details...');
            form.getTextField('txtModel1').setText(selectedPackage.name);
            
            // Use discounted price if available, otherwise use package price
            const effectivePrice = discountedPrice !== null ? discountedPrice : selectedPackage.packagePrice;
            form.getTextField('txtContractPriceHS106').setText(`$${effectivePrice.toLocaleString()}`);
            form.getTextField('txtRemainingContractBalance106').setText(`${effectivePrice}`);
          } else {
            console.log('[PDF] Filling individual equipment details...');
            const equipmentList = selectedEquipment.map(item => item.name).join(', ');
            form.getTextField('txtModel1').setText(equipmentList);
            
            // Use discounted price if available, otherwise use total price
            const effectivePrice = discountedPrice !== null ? discountedPrice : totalPrice;
            form.getTextField('txtContractPriceHS106').setText(`$${effectivePrice.toLocaleString()}`);
            form.getTextField('txtRemainingContractBalance106').setText(`${effectivePrice}`);
          }
        } catch (fieldError) {
          console.warn('[PDF] Warning: Error filling equipment fields:', fieldError);
          // Continue despite field errors
        }

        // Financing details with comprehensive order summary
        try {
          console.log('[PDF] Filling financing details...');
          if (financingOption) {
            const interestRate = customRate !== null ? customRate : financingOption.interestRate;
            const termText = financingOption.id === 'fin2' ? 'Revolving' : `${financingTerm} months`;
            
            // Create a better formatted comprehensive order summary for txtScope1
            let orderSummary = '';
            
            // SECTION 1: PACKAGE OR EQUIPMENT DETAILS
            orderSummary += "=== SELECTED EQUIPMENT ===\n\n";
            
            if (selectedPackage) {
              orderSummary += `Package: ${selectedPackage.name}\n`;
              orderSummary += `Original Price: $${selectedPackage.individualPrice.toLocaleString()}\n`;
              
              if (discountedPrice !== null) {
                orderSummary += `Special Price: $${discountedPrice.toLocaleString()}\n`;
                orderSummary += `Savings: $${(selectedPackage.individualPrice - discountedPrice).toLocaleString()}\n\n`;
              } else {
                orderSummary += `Package Price: $${selectedPackage.packagePrice.toLocaleString()}\n`;
                orderSummary += `Savings: $${(selectedPackage.individualPrice - selectedPackage.packagePrice).toLocaleString()}\n\n`;
              }
              
              // Add included items if available
              if (selectedPackage.items && selectedPackage.items.length > 0) {
                orderSummary += "Includes:\n";
                selectedPackage.items.forEach(itemId => {
                  orderSummary += `• ${getEquipmentNameById(itemId, allEquipment)}\n`;
                });
                orderSummary += "\n";
              }
            } else if (selectedEquipment && selectedEquipment.length > 0) {
              if (discountedPrice !== null) {
                orderSummary += `Selected Equipment\n`;
                orderSummary += `Original Price: $${totalPrice.toLocaleString()}\n`;
                orderSummary += `Special Price: $${discountedPrice.toLocaleString()}\n\n`;
              } else {
                orderSummary += `Selected Equipment\n`;
                orderSummary += `Price: $${totalPrice.toLocaleString()}\n\n`;
              }
              
              orderSummary += "Items:\n";
              selectedEquipment.forEach(item => {
                orderSummary += `• ${item.name}\n`;
              });
              orderSummary += "\n";
            }
            
            // SECTION 2: FINANCING DETAILS
            orderSummary += "=== FINANCING DETAILS ===\n\n";
            orderSummary += `Provider: ${financingOption.name}\n`;
            orderSummary += `Interest Rate: ${interestRate}% APR\n`;
            orderSummary += `Term: ${termText}\n`;
            orderSummary += `Monthly Payment: $${monthlyPayment.toFixed(2)}\n`;
            
            // Total financing cost if applicable
            if (financingOption.id !== 'fin2' && financingTerm && parseInt(financingTerm) > 0) {
              const totalFinancingCost = monthlyPayment * parseInt(financingTerm);
              orderSummary += `Total Financing Cost: $${totalFinancingCost.toFixed(2)}\n\n`;
            } else {
              orderSummary += "\n";
            }
            
            // SECTION 3: INCLUDED SERVICES
            orderSummary += "=== INCLUDED WITH PURCHASE ===\n\n";
            orderSummary += "• Professional installation\n";
            orderSummary += "• Applicable taxes\n";
            orderSummary += "• Full warranty coverage\n";
            orderSummary += "• 24/7 customer support\n";
            
            // Set the comprehensive summary to txtScope1
            try {
              form.getTextField('txtScope1').setText(orderSummary);
            } catch (e) {
              console.warn('[PDF] Warning: Could not set txtScope1 field:', e);
            }
            
            // Additional financing fields if they exist
            try {
              try { form.getTextField('txtFinancingOption').setText(financingOption.name); } catch (e) {}
              try { form.getTextField('txtInterestRate').setText(`${interestRate}%`); } catch (e) {}
              try { form.getTextField('txtTermLength').setText(termText); } catch (e) {}
              try { form.getTextField('txtMonthlyPayment').setText(`$${monthlyPayment.toFixed(2)}`); } catch (e) {}
              
              // Add total financing cost if applicable and field exists
              if (financingOption.id !== 'fin2' && financingTerm) {
                const totalFinancingCost = monthlyPayment * parseInt(financingTerm);
                try { form.getTextField('txtTotalFinancingCost').setText(`$${totalFinancingCost.toFixed(2)}`); } catch (e) {}
              }
            } catch (e) {
              // Ignore errors for optional fields
              console.warn('[PDF] Warning: Error setting optional financing fields:', e);
            }
          }
        } catch (fieldError) {
          console.warn('[PDF] Warning: Error filling financing fields:', fieldError);
          // Continue despite field errors
        }

        // Dates and other fixed information
        try {
          const nextYear = new Date();
          nextYear.setFullYear(today.getFullYear() + 1);
          const nextYearFormatted = `${nextYear.getMonth() + 1}/${nextYear.getDate()}/${nextYear.getFullYear()}`;
          
          try { form.getTextField('txtNotLaterThanMidnightOfDate').setText(nextYearFormatted); } catch (e) {}
          try { form.getTextField('txtTransactionDate').setText(formattedToday); } catch (e) {}
          try { form.getTextField('txtSalespersonName').setText('Miami Water Sales'); } catch (e) {}
          try { form.getTextField('txtAuthorizedRepresentativeName').setText('Miami Water & Air'); } catch (e) {}
          try { form.getTextField('txtDepositAmountHS106').setText('$0'); } catch (e) {}
          try { form.getTextField('txtDeposit106').setText('0'); } catch (e) {}
          try { form.getTextField('txtSalesTaxHS106').setText('$0'); } catch (e) {}
          try { form.getTextField('txtApproximateFinishDateHS106').setText(formattedToday); } catch (e) {}
          try { form.getTextField('txtApproximateStartDateHS106').setText(formattedToday); } catch (e) {}
          try { form.getTextField('txtCustomerSignatureDate').setText(formattedToday); } catch (e) {}
          try { form.getTextField('txtServiceProviderSignatureDate').setText(formattedToday); } catch (e) {}
        } catch (fieldError) {
          console.warn('[PDF] Warning: Error filling date fields:', fieldError);
          // Continue despite field errors
        }

        // THIS IS THE IMPORTANT CHANGE: Return as Uint8Array and also save to state
        const filledPdfBytes = await pdfDoc.save();
        console.log('[PDF] PDF filled successfully.');
        setGeneratedPdf(filledPdfBytes);
        setIsGenerating(false);
        
        // Return bytes directly - this is the main fix!
        return filledPdfBytes;
        
      } catch (fetchError) {
        console.error('[PDF] Error fetching PDF template:', fetchError);
        
        // Create a simple PDF if template is not available
        try {
          console.log('[PDF] Creating basic PDF without template...');
          const pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage([612, 792]); // US Letter
          
          // Get fonts
          const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
          const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
          
          // Format today's date
          const today = new Date();
          const formattedToday = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
          
          // Add a title
          page.drawText('Miami Water & Air - Sales Agreement', {
            x: 50,
            y: 750,
            size: 24,
            font: helveticaBold,
            color: rgb(0.1, 0.1, 0.7)
          });
          
          // Add customer info
          page.drawText(`Customer: ${customerInfo.firstName} ${customerInfo.lastName}`, {
            x: 50,
            y: 700,
            size: 12,
            font: helveticaBold,
          });
          
          page.drawText(`Email: ${customerInfo.email}`, {
            x: 50,
            y: 680,
            size: 12,
            font: helveticaFont,
          });
          
          page.drawText(`Phone: ${customerInfo.phone}`, {
            x: 50,
            y: 660,
            size: 12,
            font: helveticaFont,
          });
          
          page.drawText(`Address: ${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zip}`, {
            x: 50,
            y: 640,
            size: 12,
            font: helveticaFont,
          });
          
          // Add equipment info
          let equipmentText = '';
          let priceText = '';
          
          if (selectedPackage) {
            equipmentText = `Package: ${selectedPackage.name}`;
            
            if (discountedPrice !== null) {
              priceText = `Original Price: $${selectedPackage.individualPrice.toLocaleString()}\nSpecial Price: $${discountedPrice.toLocaleString()}`;
            } else {
              priceText = `Original Price: $${selectedPackage.individualPrice.toLocaleString()}\nPackage Price: $${selectedPackage.packagePrice.toLocaleString()}`;
            }
            
            page.drawText(equipmentText, {
              x: 50,
              y: 600,
              size: 14,
              font: helveticaBold
            });
            
            // Add included items
            if (selectedPackage.items && selectedPackage.items.length > 0) {
              page.drawText('Includes:', {
                x: 70,
                y: 560,
                size: 12,
                font: helveticaBold
              });
              
              let yPos = 540;
              let count = 0;
              selectedPackage.items.forEach(itemId => {
                if (count >= 10) return; // Limit to 10 items to avoid overflow
                
                const itemName = getEquipmentNameById(itemId, allEquipment);
                page.drawText(`• ${itemName}`, {
                  x: 70,
                  y: yPos,
                  size: 12,
                  font: helveticaFont,
                });
                yPos -= 20;
                count++;
              });
            }
          } else {
            equipmentText = `Selected Equipment:`;
            
            if (discountedPrice !== null) {
              priceText = `Original Price: $${totalPrice.toLocaleString()}\nSpecial Price: $${discountedPrice.toLocaleString()}`;
            } else {
              priceText = `Price: $${totalPrice.toLocaleString()}`;
            }
            
            page.drawText(equipmentText, {
              x: 50,
              y: 600,
              size: 14,
              font: helveticaBold
            });
            
            // List individual equipment
            if (selectedEquipment && selectedEquipment.length > 0) {
              let yPos = 560;
              let count = 0;
              selectedEquipment.forEach(item => {
                if (count >= 10) return; // Limit to 10 items to avoid overflow
                
                page.drawText(`• ${item.name}`, {
                  x: 70,
                  y: yPos,
                  size: 12,
                  font: helveticaFont,
                });
                yPos -= 20;
                count++;
              });
            }
          }
          
          // Add pricing info - split by newlines
          const priceLines = priceText.split('\n');
          priceLines.forEach((line, index) => {
            page.drawText(line, {
              x: 50,
              y: 500 - (index * 20),
              size: 12,
              font: helveticaFont,
            });
          });
          
          // Add financing info if available
          if (financingOption) {
            const interestRate = customRate !== null ? customRate : financingOption.interestRate;
            const termText = financingOption.id === 'fin2' ? 'Revolving' : `${financingTerm} months`;
            
            page.drawText('Financing Details:', {
              x: 50,
              y: 460,
              size: 14,
              font: helveticaBold
            });
            
            page.drawText(`Provider: ${financingOption.name}`, {
              x: 50,
              y: 440,
              size: 12,
              font: helveticaFont,
            });
            
            page.drawText(`Interest Rate: ${interestRate}%`, {
              x: 50,
              y: 420,
              size: 12,
              font: helveticaFont,
            });
            
            page.drawText(`Term: ${termText}`, {
              x: 50,
              y: 400,
              size: 12,
              font: helveticaFont,
            });
            
            page.drawText(`Monthly Payment: $${monthlyPayment.toFixed(2)}`, {
              x: 50,
              y: 380,
              size: 12,
              font: helveticaFont,
            });
            
            if (financingOption.id !== 'fin2' && financingTerm && parseInt(financingTerm) > 0) {
              const totalFinancingCost = monthlyPayment * parseInt(financingTerm);
              page.drawText(`Total Financing Cost: $${totalFinancingCost.toFixed(2)}`, {
                x: 50,
                y: 360,
                size: 12,
                font: helveticaFont,
              });
            }
          }
          
          // Add included services
          page.drawText('All prices include:', {
            x: 50,
            y: 320,
            size: 14,
            font: helveticaBold
          });
          
          let includedY = 300;
          ['Professional installation', 'Applicable taxes', 'Full warranty coverage', '24/7 customer support'].forEach(item => {
            page.drawText(`• ${item}`, {
              x: 70,
              y: includedY,
              size: 12,
              font: helveticaFont,
            });
            includedY -= 20;
          });
          
          // Add signature lines
          page.drawText('Customer Signature: __________________________', {
            x: 50,
            y: 200,
            size: 12,
            font: helveticaFont,
          });
          
          page.drawText(`Date: ${formattedToday}`, {
            x: 350,
            y: 200,
            size: 12,
            font: helveticaFont,
          });
          
          page.drawText('Company Representative: _____________________', {
            x: 50,
            y: 150,
            size: 12,
            font: helveticaFont,
          });
          
          // Add footer
          page.drawText('This document was generated by Miami Water & Air Sales Tool', {
            x: 150,
            y: 50,
            size: 10,
            font: helveticaFont,
          });
          
          // THIS IS THE KEY FIX: Save PDF as Uint8Array and return it directly
          const pdfBytes = await pdfDoc.save();
          console.log('[PDF] Basic PDF created successfully.');
          setGeneratedPdf(pdfBytes);
          setIsGenerating(false);
          return pdfBytes; // Return the bytes directly
        } catch (createError) {
          throw new Error('Failed to create PDF: ' + createError.message);
        }
      }
      
    } catch (error) {
      console.error('[PDF] Error filling PDF form:', error);
      setError(error.message || 'Error generating PDF');
      setIsGenerating(false);
      throw error;
    }
  };

  /**
   * Downloads the generated PDF file
   */
  const downloadPdf = (pdfBytes, customerLastName) => {
    try {
      console.log('[PDF] Initiating PDF download...');
      // Create a blob from the PDF bytes
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      const formattedDate = new Date().toISOString().slice(0, 10);
      const sanitizedLastName = (customerLastName || 'customer').replace(/[^a-zA-Z0-9]/g, '');
      
      link.download = `MiamiWater-${sanitizedLastName}-${formattedDate}.pdf`;
      document.body.appendChild(link);
      
      // Click the link to start the download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log('[PDF] PDF downloaded successfully.');
    } catch (error) {
      console.error('[PDF] Error downloading PDF:', error);
      setError(error.message || 'Error downloading PDF');
      throw error;
    }
  };
  
  /**
   * Displays PDF in browser
   */
  const openPdfInNewTab = (pdfBytes) => {
    try {
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('[PDF] Error opening PDF:', error);
      setError(error.message || 'Error opening PDF');
      throw error;
    }
  };

  return {
    fillPdfForm,
    downloadPdf,
    openPdfInNewTab,
    isGenerating,
    error,
    generatedPdf
  };
};