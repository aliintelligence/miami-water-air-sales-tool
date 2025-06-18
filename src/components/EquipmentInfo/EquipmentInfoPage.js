// src/components/EquipmentInfo/EquipmentInfoPage.js (partial)
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEquipmentCatalog } from '../../hooks/useEquipmentCatalog';
import { useTranslation } from '../../utils/i18n';
import PDFViewer from './PDFViewer';

const EquipmentInfoPage = () => {
  const { t } = useTranslation();
  const { equipmentId } = useParams();
  const { catalog } = useEquipmentCatalog();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (catalog) {
      let foundEquipment = null;
      const categories = Object.keys(catalog);
      for (const category of categories) {
        if (!Array.isArray(catalog[category])) continue;
        // Find item and ensure it has an ID
        const found = catalog[category].find(item => item && item.id === equipmentId); 
        if (found) {
          foundEquipment = { ...found, categoryKey: category };
          break;
        }
      }
      setEquipment(foundEquipment);
      setLoading(false);
    }
  }, [catalog, equipmentId]);
  
  // Hardcoded descriptions - Consider moving this to catalog data
  const getEquipmentDetails = (equipmentId) => {
    const details = { /* ... your details map ... */ };
    return details[equipmentId] || t('equipmentInfo.defaultDescription');
  };
 
  // Get media paths using imageFilename if available
  const getEquipmentMediaPaths = (item) => {
     if (!item || !item.id) {
        return { image: '/images/equipment/placeholder.jpg', pdfEn: '', pdfEs: '', details: t('loading') };
     }
     const filename = item.imageFilename || `${item.id}.jpg`; // Use filename or fallback
     const imagePath = filename.trim() ? `/images/equipment/${filename}` : '/images/equipment/placeholder.jpg';
     
     return {
       image: imagePath,
       pdfEn: `/pdfs/en/${item.id}.pdf`, // Assuming PDFs still use ID
       pdfEs: `/pdfs/es/${item.id}.pdf`, // Assuming PDFs still use ID
       details: getEquipmentDetails(item.id) // Assuming details map uses ID
     };
  };

  if (loading) {
    return ( <div className="max-w-4xl mx-auto p-4 text-center">{t('loading')}</div> );
  }

  if (!equipment) {
    return ( <div className="max-w-4xl mx-auto p-4">{t('equipmentInfo.notFound')}</div> );
  }

  const media = getEquipmentMediaPaths(equipment); // Use the updated function

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Back Link */}
      <div className="mb-4">
        <Link to="/equipment" className="text-blue-600 hover:underline flex items-center">
          {t('equipmentInfo.backToList')}
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Equipment Image */}
          <div className="md:flex-shrink-0 p-4 flex justify-center">
            <img 
              src={media.image} // Use path from getEquipmentMediaPaths
              alt={equipment.name || t('equipmentInfo.image')} 
              className="h-64 w-auto object-contain"
              onError={(e) => { e.target.onerror = null; e.target.src = '/images/equipment/placeholder.jpg'; }}
            />
          </div>
          
          {/* Equipment Details */}
          <div className="p-8">
            {/* ... Category, Name, Description ... */}
             <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
               {t(`equipmentCategories.${equipment.categoryKey}`, t('equipmentCategories.default'))}
             </div>
             <h1 className="mt-1 text-3xl font-bold text-gray-900">{equipment.name}</h1>
             <p className="mt-2 text-gray-600">{media.details}</p>

            {/* Price Info */}
            <div className="mt-4">
                <span className="text-gray-700 font-medium">{t('equipmentInfo.price')} </span>
                <span className="text-gray-900 font-bold">${(equipment.price || 0).toLocaleString()}</span>
                {equipment.packagePrice && (
                  <span className="ml-4 text-green-600">
                    {t('equipmentInfo.packagePrice')} ${equipment.packagePrice.toLocaleString()}
                  </span>
                )}
            </div>
            
            {/* Subscription Info */}
            {equipment.subscriptionInfo && (
              <div className="mt-2 text-blue-600">
                <span className="text-gray-700 font-medium">{t('equipmentInfo.subscription')} </span>
                {equipment.subscriptionInfo}
              </div>
            )}
            
            {/* PDF Viewers */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <PDFViewer pdfUrl={media.pdfEn} title={t('equipmentInfo.pdfEnglish')} language="en" />
              <PDFViewer pdfUrl={media.pdfEs} title={t('equipmentInfo.pdfSpanish')} language="es" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Technical Specifications */}
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('equipmentInfo.technicalSpecs')}</h2>
        {/* ... Spec grid (consider moving specs to catalog data too) ... */}
      </div>
      
      {/* Call-to-Action */}
      <div className="mt-8 text-center">
        <Link 
          to={`/?equipmentId=${equipment.id}`} 
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          {t('equipmentInfo.addToQuote')}
        </Link>
      </div>
    </div>
  );
};

export default EquipmentInfoPage;