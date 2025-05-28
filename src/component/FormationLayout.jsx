import React, { useState, useEffect } from 'react';
import { Menu, X, BookOpen, Clock, User, Building, ChevronRight, Home } from 'lucide-react';
import ProgressTracker from './ProgressTracker';

const FormationLayout = ({ formation, currentModule, onModuleChange, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Gestion du thème basé sur les métadonnées de la formation
  const themeColors = formation?.primary_color ? {
    primary: formation.primary_color,
    accent: formation.accent_color || '#f59e0b'
  } : {
    primary: '#1e40af',
    accent: '#f59e0b'
  };

  // Navigation entre modules
  const handleModuleClick = (moduleId) => {
    onModuleChange(moduleId);
    setSidebarOpen(false); // Fermer la sidebar sur mobile
  };

  // Calcul du module suivant/précédent
  const currentIndex = formation?.modules?.findIndex(m => m.id === currentModule) || 0;
  const nextModule = formation?.modules?.[currentIndex + 1];
  const prevModule = formation?.modules?.[currentIndex - 1];

  if (!mounted || !formation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header 
        className="bg-white shadow-sm border-b-4"
        style={{ borderBottomColor: themeColors.primary }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo et titre */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              <div className="flex items-center space-x-3">
                <BookOpen 
                  size={32} 
                  style={{ color: themeColors.primary }}
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900 truncate max-w-md">
                    {formation.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Building size={14} />
                      <span>{formation.company}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <User size={14} />
                      <span>{formation.instructor}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{formation.duration}min</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions header */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm">
                <span className="text-gray-600">Version</span>
                <span 
                  className="px-2 py-1 rounded-full text-white text-xs font-medium"
                  style={{ backgroundColor: themeColors.accent }}
                >
                  {formation.version || '1.0'}
                </span>
              </div>
              
              <button 
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => window.history.back()}
              >
                <Home size={16} />
                <span className="hidden sm:inline">Accueil</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Table des matières */}
        <aside 
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out`}
        >
          <div className="flex flex-col h-full">
            {/* En-tête sidebar */}
            <div 
              className="px-6 py-4 border-b-2"
              style={{ borderBottomColor: themeColors.primary }}
            >
              <h2 className="text-lg font-semibold text-gray-900">
                Table des matières
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {formation.moduleCount} modules • {formation.estimatedTotalDuration}min
              </p>
            </div>

            {/* Barre de progression */}
            <div className="px-6 py-4 border-b">
              <ProgressTracker 
                modules={formation.modules}
                currentModule={currentModule}
                primaryColor={themeColors.primary}
              />
            </div>

            {/* Liste des modules */}
            <nav className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-1 px-4">
                {formation.modules?.map((module, index) => (
                  <li key={module.id}>
                    <button
                      onClick={() => handleModuleClick(module.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        currentModule === module.id
                          ? 'text-white font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      style={{
                        backgroundColor: currentModule === module.id ? themeColors.primary : 'transparent'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-medium flex items-center justify-center ${
                              currentModule === module.id 
                                ? 'bg-white text-blue-600' 
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {index + 1}
                            </span>
                            <span className="font-medium truncate">
                              {module.title}
                            </span>
                          </div>
                          <div className={`ml-9 text-xs mt-1 ${
                            currentModule === module.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {module.estimatedDuration}min de lecture
                          </div>
                        </div>
                        
                        {currentModule === module.id && (
                          <ChevronRight size={16} className="text-white" />
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Footer sidebar */}
            <div className="px-6 py-4 border-t bg-gray-50">
              <div className="text-xs text-gray-600">
                <p>Dernière mise à jour</p>
                <p className="font-medium">
                  {formation.last_updated ? 
                    new Date(formation.last_updated).toLocaleDateString('fr-CA') : 
                    'Non spécifiée'
                  }
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay pour mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Contenu principal */}
        <main className="flex-1 lg:ml-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Contenu du module */}
            <div className="bg-white rounded-lg shadow-sm">
              {children}
            </div>

            {/* Navigation entre modules */}
            <div className="flex justify-between items-center mt-8 pt-8 border-t">
              <div>
                {prevModule && (
                  <button
                    onClick={() => handleModuleClick(prevModule.id)}
                    className="flex items-center space-x-2 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight size={20} className="rotate-180" />
                    <div className="text-left">
                      <div className="text-sm text-gray-500">Précédent</div>
                      <div className="font-medium">{prevModule.title}</div>
                    </div>
                  </button>
                )}
              </div>

              <div>
                {nextModule && (
                  <button
                    onClick={() => handleModuleClick(nextModule.id)}
                    className="flex items-center space-x-2 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: themeColors.primary }}
                  >
                    <div className="text-right">
                      <div className="text-sm opacity-90">Suivant</div>
                      <div className="font-medium">{nextModule.title}</div>
                    </div>
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FormationLayout;