// src/components/SalesTool/SuccessModal.js
import React, { useEffect } from 'react';
import { useTranslation } from '../../utils/i18n';

// Simple confetti animation component
const Confetti = () => {
  useEffect(() => {
    // Only run if canvas is supported
    if (typeof document === 'undefined') return;
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '100';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const pieces = [];
    const numberOfPieces = 100;
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', 
                   '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', 
                   '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];
    
    // Create confetti pieces
    for (let i = 0; i < numberOfPieces; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        rot: Math.random() * 360,
        size: Math.random() * 20 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 3 + 2,
        shape: Math.random() > 0.5 ? 'circle' : 'rect'
      });
    }
    
    // Animation function
    let animationFrame;
    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      pieces.forEach((piece) => {
        piece.y += piece.speed;
        piece.rot += Math.random() * 2;
        
        ctx.save();
        ctx.translate(piece.x + piece.size / 2, piece.y + piece.size / 2);
        ctx.rotate((piece.rot * Math.PI) / 180);
        ctx.translate(-(piece.x + piece.size / 2), -(piece.y + piece.size / 2));
        ctx.fillStyle = piece.color;
        
        if (piece.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(piece.x, piece.y, piece.size / 2, 0, 2 * Math.PI);
          ctx.fill();
        } else {
          ctx.fillRect(piece.x, piece.y, piece.size, piece.size / 2);
        }
        
        ctx.restore();
        
        // Reset confetti when it goes out of screen
        if (piece.y > canvas.height) {
          piece.y = -piece.size;
          piece.x = Math.random() * canvas.width;
        }
      });
      
      animationFrame = requestAnimationFrame(update);
    };
    
    update();
    
    // Cleanup function
    return () => {
      cancelAnimationFrame(animationFrame);
      document.body.removeChild(canvas);
    };
  }, []);
  
  return null;
};

const SuccessModal = ({ 
  isVisible, 
  customerEmail, 
  onClose, 
  onStartNew,
  documentUrl = null, 
  result = null // Accept the full result object
}) => {
  const { t } = useTranslation();
  
  if (!isVisible) return null;

  // Extract local file path from result if available
  const localFilePath = result?.localFilePath || null;
  const hasSignNowError = result?.message && result.message.includes("SignNow integration encountered an error");
  const sendMethod = result?.sendMethod || 'email';
  
  // Format local file path for display (if exists)
  const formatLocalPath = (path) => {
    if (!path) return '';
    // Get just the filename from the full path
    return path.split('\\').pop() || path;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <Confetti />
      <div className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-md max-h-[90vh] overflow-y-auto relative">
        {/* Success Header */}
        <div className="bg-green-600 text-white p-6 text-center">
          <div className="mx-auto flex items-center justify-center w-20 h-20 bg-white text-green-600 rounded-full mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold">{t('salesTool.success.title')}</h3>
        </div>
        
        {/* Success Message */}
        <div className="p-6">
          <div className="mb-6 text-center">
            <p className="text-lg mb-3">
              {t('salesTool.success.message')}
            </p>
            <p className="font-medium text-blue-600 text-xl bg-blue-50 py-2 px-4 rounded-lg inline-block">
              {sendMethod === 'sms' 
                ? (result?.customerPhone || t('signingMethod.sentBySms', 'Sent via text message to phone number'))
                : (customerEmail || 'No email provided')}
            </p>
            
            {/* Add more message details based on sending method */}
            {sendMethod === 'sms' && (
              <p className="text-sm text-gray-600 mt-2">
                {t('signingMethod.smsFollowup', 'The customer will receive a text message with a link to sign the document')}
              </p>
            )}
            
            {documentUrl && (
              <div className="mt-4">
                <a 
                  href={documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                >
                  {t('general.viewDocument')}
                </a>
              </div>
            )}
            
            {localFilePath && (
              <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                <p className="font-medium text-blue-700">Document saved successfully!</p>
                <p className="text-sm text-blue-600 break-words">
                  {formatLocalPath(localFilePath)}
                </p>
              </div>
            )}
            
            {hasSignNowError && (
              <div className="mt-2 bg-yellow-50 p-3 rounded-lg">
                <p className="text-yellow-700 text-sm">
                  Note: The document was saved locally, but there was an issue with online signing. 
                  You can still download the PDF and send it manually.
                </p>
              </div>
            )}
            
            <div className="mt-6 text-base text-gray-600 bg-blue-50 p-4 rounded-xl">
              <p className="mb-2 font-medium">
                {t('salesTool.success.nextSteps')}
              </p>
              <ul className="list-disc ml-5 space-y-2">
                {hasSignNowError ? (
                  <>
                    <li>You can download the PDF from your local documents folder</li>
                    <li>Send the document manually to the customer for review</li>
                    <li>Schedule installation after receiving signed agreement</li>
                  </>
                ) : (
                  <>
                    <li>{t('salesTool.success.stepsList.email')}</li>
                    <li>{t('salesTool.success.stepsList.notification')}</li>
                    <li>{t('salesTool.success.stepsList.installation')}</li>
                  </>
                )}
              </ul>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <button 
              onClick={onStartNew}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {t('salesTool.success.newQuote')}
            </button>
            <button 
              onClick={onClose}
              className="w-full px-4 py-3 bg-gray-200 text-gray-800 rounded-lg text-lg hover:bg-gray-300 transition-colors"
            >
              {t('navigation.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;