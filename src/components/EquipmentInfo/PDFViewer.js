// src/components/EquipmentInfo/PDFViewer.js
import React, { useState } from 'react';
import { useTranslation } from '../../utils/i18n';

const PDFViewer = ({ pdfUrl, title, language }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [pdfError, setPdfError] = useState(false);

  // Open the PDF in a modal
  const openPDFModal = () => {
    setIsOpen(true);
    setPdfError(false); // Reset error state
  };

  // Close the modal
  const closePDFModal = () => {
    setIsOpen(false);
  };

  // Handle PDF loading error
  const handlePdfError = () => {
    setPdfError(true);
  };

  return (
    <>
      {/* PDF Button */}
      <button
        onClick={openPDFModal}
        className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          language === 'en' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          language === 'en' ? 'focus:ring-blue-500' : 'focus:ring-green-500'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
        {title || (language === 'en' ? t('equipmentInfo.pdfEnglish') : t('equipmentInfo.pdfSpanish'))}
      </button>

      {/* PDF Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex">
          <div className="relative p-4 bg-white w-full max-w-5xl m-auto rounded-lg shadow-lg flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="text-xl font-semibold">{title || (language === 'en' ? t('equipmentInfo.pdfEnglish') : t('equipmentInfo.pdfSpanish'))}</h3>
              <button onClick={closePDFModal} className="text-gray-500 hover:text-gray-700">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* PDF Viewer */}
            <div className="flex-grow h-[75vh] mt-4">
              {pdfError ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                  <div className="text-center p-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">PDF Not Available</h3>
                    <p className="text-gray-600">The product documentation is currently being updated. Please check back later or contact sales for more information.</p>
                  </div>
                </div>
              ) : (
                <iframe
                  src={`${pdfUrl}#toolbar=0&navpanes=0`}
                  title={title || "PDF Viewer"}
                  className="w-full h-full border-0"
                  onError={handlePdfError}
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center pt-3 mt-4 border-t">
              {!pdfError && (
                <a
                  href={pdfUrl}
                  download
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t('download')} PDF
                </a>
              )}
              <button
                onClick={closePDFModal}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {t('navigation.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PDFViewer;