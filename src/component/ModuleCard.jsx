import React, { useState, useEffect } from 'react';
import { Clock, BookOpen, Video, FileText, ExternalLink, ChevronDown, ChevronUp, AlertTriangle, Lightbulb, Play } from 'lucide-react';

const ModuleCard = ({ module, formation, isActive = false, onComplete }) => {
  const [isExpanded, setIsExpanded] = useState(isActive);
  const [readingProgress, setReadingProgress] = useState(0);

  const primaryColor = formation?.primary_color || '#1e40af';
  const accentColor = formation?.accent_color || '#f59e0b';

  useEffect(() => {
    if (isActive) {
      setIsExpanded(true);
    }
  }, [isActive]);

  // Simuler la progression de lecture basée sur le scroll
  useEffect(() => {
    if (!isActive) return;

    const handleScroll = () => {
      const element = document.getElementById(`module-${module.id}`);
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementHeight = rect.height;
      
      // Calculer le pourcentage de l'élément visible
      let visibleHeight = 0;
      if (rect.top < windowHeight && rect.bottom > 0) {
        visibleHeight = Math.min(windowHeight, rect.bottom) - Math.max(0, rect.top);
      }
      
      const progress = Math.min(100, (visibleHeight / elementHeight) * 100);
      setReadingProgress(progress);
      
      // Marquer comme lu si 80% du contenu a été vu
      if (progress > 80 && onComplete) {
        onComplete(module.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Vérification initiale

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isActive, module.id, onComplete]);

  // Fonction pour parser et styliser le contenu HTML
  const parseContent = (htmlContent) => {
    if (!htmlContent) return '';

    // Remplacer les callouts spéciaux
    let content = htmlContent
      .replace(/<div class="video-callout">/g, '<div class="video-callout bg-blue-50 border-l-4 border-blue-500 p-4 my-4 rounded-r-md">')
      .replace(/<div class="warning-callout">/g, '<div class="warning-callout bg-red-50 border-l-4 border-red-500 p-4 my-4 rounded-r-md">')
      .replace(/<div class="tip-callout">/g, '<div class="tip-callout bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4 rounded-r-md">');

    return content;
  };

  return (
    <div 
      id={`module-${module.id}`}
      className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-300 ${
        isActive ? 'ring-2 ring-offset-2' : 'hover:shadow-md'
      }`}
      style={{
        borderColor: isActive ? primaryColor : '#e5e7eb',
        ringColor: isActive ? primaryColor : 'transparent'
      }}
    >
      {/* En-tête du module */}
      <div 
        className="px-6 py-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Numéro du module */}
            <div 
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: primaryColor }}
            >
              {module.order}
            </div>
            
            {/* Titre et métadonnées */}
            <div>
              <h3 className={`text-lg font-semibold transition-colors ${
                isActive ? 'text-gray-900' : 'text-gray-800'
              }`}>
                {module.title}
              </h3>
              
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <Clock size={14} />
                  <span>{module.estimatedDuration} min</span>
                </span>
                
                <span className="flex items-center space-x-1">
                  <BookOpen size={14} />
                  <span>{Math.ceil((module.content?.length || 0) / 500)} pages</span>
                </span>
              </div>
            </div>
          </div>

          {/* Indicateur d'expansion */}
          <div className="flex items-center space-x-2">
            {/* Barre de progression de lecture */}
            {isActive && readingProgress > 0 && (
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: `${readingProgress}%`,
                    backgroundColor: accentColor
                  }}
                />
              </div>
            )}
            
            {isExpanded ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Contenu du module */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          {/* Ressources associées */}
          {(formation.resources?.videos || formation.resources?.documents || formation.resources?.links) && (
            <div className="mb-6 mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Ressources disponibles</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Vidéos */}
                {formation.resources?.videos?.map((video, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                    <Video size={16} className="text-blue-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-blue-900 truncate">
                        {video.title}
                      </div>
                      {video.duration && (
                        <div className="text-xs text-blue-600">{video.duration}</div>
                      )}
                    </div>
                    <Play size={14} className="text-blue-600 flex-shrink-0" />
                  </div>
                ))}

                {/* Documents */}
                {formation.resources?.documents?.map((doc, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
                    <FileText size={16} className="text-green-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-green-900 truncate">
                        {doc.title}
                      </div>
                      <div className="text-xs text-green-600">PDF</div>
                    </div>
                    <ExternalLink size={14} className="text-green-600 flex-shrink-0" />
                  </div>
                ))}

                {/* Liens */}
                {formation.resources?.links?.map((link, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
                    <ExternalLink size={16} className="text-purple-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-purple-900 truncate">
                        {link.title}
                      </div>
                      {link.description && (
                        <div className="text-xs text-purple-600 truncate">{link.description}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contenu HTML du module */}
          <div 
            className="prose prose-blue max-w-none module-content"
            dangerouslySetInnerHTML={{ 
              __html: parseContent(module.htmlContent) 
            }}
          />

          {/* Actions du module */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              Module {module.order} sur {formation.moduleCount}
            </div>
            
            <div className="flex space-x-3">
              {/* Bouton imprimer */}
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Imprimer
              </button>
              
              {/* Bouton marquer comme terminé */}
              <button
                onClick={() => onComplete && onComplete(module.id)}
                className="px-4 py-2 text-sm text-white rounded-md hover:opacity-90 transition-opacity"
                style={{ backgroundColor: primaryColor }}
              >
                Terminé
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles CSS intégrés pour le contenu */}
      <style jsx>{`
        .module-content h1, .module-content h2, .module-content h3 {
          color: ${primaryColor};
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        
        .module-content h1 { font-size: 1.5rem; }
        .module-content h2 { font-size: 1.25rem; }
        .module-content h3 { font-size: 1.125rem; }
        
        .module-content p {
          margin-bottom: 1rem;
          line-height: 1.6;
          color: #374151;
        }
        
        .module-content ul, .module-content ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        
        .module-content li {
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }
        
        .module-content strong {
          color: ${primaryColor};
          font-weight: 600;
        }
        
        .module-content code {
          background-color: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
        }
        
        .module-content pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        
        .module-content blockquote {
          border-left: 4px solid ${accentColor};
          background-color: #fffbeb;
          padding: 1rem;
          margin: 1rem 0;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        
        .module-content .video-callout::before {
          content: "📹 ";
          font-size: 1.2rem;
          margin-right: 0.5rem;
        }
        
        .module-content .warning-callout::before {
          content: "⚠️ ";
          font-size: 1.2rem;
          margin-right: 0.5rem;
        }
        
        .module-content .tip-callout::before {
          content: "💡 ";
          font-size: 1.2rem;
          margin-right: 0.5rem;
        }
        
        .module-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        
        .module-content th, .module-content td {
          border: 1px solid #d1d5db;
          padding: 0.75rem;
          text-align: left;
        }
        
        .module-content th {
          background-color: ${primaryColor};
          color: white;
          font-weight: 600;
        }
        
        .module-content tr:nth-child(even) {
          background-color: #f9fafb;
        }
      `}</style>
    </div>
  );
};

export default ModuleCard;