// src/services/signNowService.js
/**
 * Service for communicating with SignNow API via our proxy server
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Helper to handle response errors
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorData.message || `Request failed with status ${response.status}`;
    } catch (e) {
      errorMessage = `Request failed with status ${response.status}: ${errorText}`;
    }
    
    throw new Error(errorMessage);
  }
  
  return await response.json();
};

/**
 * Get an authentication token from SignNow
 */
export const getSignNowToken = async () => {
  try {
    console.log('[SignNow] Requesting auth token from proxy server');
    
    const response = await fetch(`${API_URL}/signnow/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await handleResponse(response);
    console.log('[SignNow] Token received successfully');
    
    return data.token;
  } catch (error) {
    console.error('[SignNow] Auth error:', error);
    throw error;
  }
};

/**
 * Process a document with SignNow
 * @param {ArrayBuffer} pdfBytes - PDF document as bytes
 * @param {Object} customerInfo - Customer information
 * @returns {Promise<Object>} Result with document URL
 */
export const processDocument = async (pdfBytes, customerInfo) => {
  try {
    console.log('[SignNow] Processing document for customer:', customerInfo.email);
    
    // Convert PDF bytes to base64
    const pdfBase64 = btoa(
      new Uint8Array(pdfBytes)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    
    console.log('[SignNow] PDF converted to base64, size:', Math.round(pdfBase64.length / 1024), 'KB');
    
    console.log('[SignNow] Sending document to proxy server for processing');
    const response = await fetch(`${API_URL}/signnow/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pdfBase64,
        customerInfo
      })
    });
    
    const result = await handleResponse(response);
    console.log('[SignNow] Document processed successfully:', result);
    
    return result;
  } catch (error) {
    console.error('[SignNow] Process error:', error);
    throw error;
  }
};

/**
 * Test the server connection
 */
export const testServerConnection = async () => {
  try {
    const response = await fetch(`${API_URL}/test`);
    return await handleResponse(response);
  } catch (error) {
    console.error('[SignNow] Server test error:', error);
    throw error;
  }
};