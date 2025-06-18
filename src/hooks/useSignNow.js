// src/hooks/useSignNow.js
import { useState } from 'react';

/**
 * Custom hook for SignNow integration
 */
export const useSignNow = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  /**
   * Process a document with SignNow
   * @param {Uint8Array} pdfBytes - PDF document as Uint8Array
   * @param {Object} customerInfo - Customer information
   * @param {string} sendMethod - 'email' or 'sms'
   * @returns {Promise<Object>} Processing result
   */
  const processDocument = async (pdfBytes, customerInfo, sendMethod = 'email') => {
    setIsProcessing(true);
    setError(null);
    
    try {
      if (!pdfBytes) {
        throw new Error('No PDF data provided');
      }
      
      if (sendMethod === 'email' && (!customerInfo?.email || !customerInfo.email.trim())) {
        throw new Error('Email address is required for email signing');
      }
      
      if (sendMethod === 'sms' && (!customerInfo?.phone || !customerInfo.phone.trim())) {
        throw new Error('Phone number is required for SMS signing');
      }
      
      // Check if pdfBytes is a Uint8Array
      if (!(pdfBytes instanceof Uint8Array)) {
        console.warn('[SignNow] PDF data is not a Uint8Array, attempting to convert');
        
        // Try to handle both ArrayBuffer and Uint8Array
        if (pdfBytes instanceof ArrayBuffer) {
          pdfBytes = new Uint8Array(pdfBytes);
        } else {
          throw new Error('Invalid PDF data type: Expected Uint8Array or ArrayBuffer');
        }
      }
      
      // Convert PDF bytes to base64 with improved error handling
      const pdfBase64 = uint8ArrayToBase64(pdfBytes);
      console.log('[SignNow] PDF converted to base64, size:', Math.round(pdfBase64.length / 1024), 'KB');
      
      // Send to server for SignNow processing
      console.log(`[SignNow] Sending document to server for processing via ${sendMethod}`);
      const response = await fetch(`${API_URL}/signnow/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        body: JSON.stringify({ 
          pdfBase64,
          customerInfo,
          sendMethod,
          timestamp: new Date().toISOString()
        })
      });
      
      // Handle response
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorDetail = '';
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorDetail = errorData.error || errorData.details || `HTTP status ${response.status}`;
        } else {
          errorDetail = `HTTP status ${response.status}`;
        }
        
        throw new Error(`Error processing document: ${errorDetail}`);
      }
      
      // Parse successful response
      const data = await response.json();
      
      console.log('[SignNow] Document processed successfully:', data);
      setResult(data);
      return data;
    } catch (err) {
      console.error('[SignNow] Error processing document:', err);
      setError(err.message || 'An unknown error occurred');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Helper function to convert Uint8Array to base64
   */
  function uint8ArrayToBase64(bytes) {
    // Make sure we have a Uint8Array
    if (!(bytes instanceof Uint8Array)) {
      console.error('[SignNow] Expected Uint8Array but received:', typeof bytes);
      throw new Error('Invalid PDF data type: Must be a Uint8Array');
    }
    
    // Create a binary string from the Uint8Array
    let binary = '';
    const len = bytes.byteLength;
    
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    // Convert binary string to base64
    return window.btoa(binary);
  }

  return {
    processDocument,
    isProcessing,
    error,
    result
  };
};

export default useSignNow;