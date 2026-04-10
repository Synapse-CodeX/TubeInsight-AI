
import { useEffect } from 'react';

interface SchemaMarkupProps {
  type: 'organization' | 'website' | 'product' | 'faq' | 'video';
  data?: any;
}

const SchemaMarkup = ({ type, data }: SchemaMarkupProps) => {
  const getSchema = () => {
    switch (type) {
      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "TubeInsight",
          "description": "AI-powered YouTube channel and video analysis platform.",
          "url": "https://tubeinsight.com",
          "logo": "https://tubeinsight.com/logo.png",
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "availableLanguage": "English"
          }
        };
      
      case 'website':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "TubeInsight",
          "description": "Master YouTube with AI Insights. Grow your channel with data-driven strategies.",
          "url": "https://tubeinsight.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://tubeinsight.com/?search={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        };
      
      case 'product':
        return data ? {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": data.name,
          "description": data.description || `TubeInsight ${data.page_type || 'analysis'} tool - ${data.name}`,
          "image": data.thumbnail_url,
          "url": `https://tubeinsight.com/product/${data.id}`,
          "brand": {
            "@type": "Brand",
            "name": "TubeInsight"
          }
        } : null;
      
      case 'faq':
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": data?.faqs?.map((faq: any) => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          })) || []
        };
      
      case 'video':
        return data ? {
          "@context": "https://schema.org",
          "@type": "VideoObject",
          "name": data.title,
          "description": data.description,
          "thumbnailUrl": `https://img.youtube.com/vi/${data.videoId}/maxresdefault.jpg`,
          "uploadDate": data.date,
          "embedUrl": `https://www.youtube.com/embed/${data.videoId}`,
          "contentUrl": data.url
        } : null;
      
      default:
        return null;
    }
  };

  const schema = getSchema();
  
  useEffect(() => {
    if (!schema) return;
    
    const scriptId = `schema-${type}`;
    let script = document.querySelector(`script[id="${scriptId}"]`) as HTMLScriptElement;
    
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    
    script.textContent = JSON.stringify(schema);
    
    return () => {
      const existingScript = document.querySelector(`script[id="${scriptId}"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [schema, type]);

  return null;
};

export default SchemaMarkup;