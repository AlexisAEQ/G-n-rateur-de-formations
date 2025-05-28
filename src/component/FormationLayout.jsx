import React, { useState } from 'react';
import { Menu, X, BookOpen, Clock, User, Building } from 'lucide-react';

const FormationLayout = ({ formation, currentModule, onModuleChange, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!formation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Aucune formation sélectionnée
          </h2>
          <p className="text-gray-600">
            Sélectionnez une formation pour commencer
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-4 border-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              <div className="flex items-center space-x-3">
                <BookOpen size={32} className="text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
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
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out`}>
          <div className="flex flex-col h-full">
            <div className="px-6 py-4 border-b-2 border-blue-500">
              <h2 className="text-lg font-semibold text-gray-900">
                Table des matières
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {formation.moduleCount || 0} modules
              </p>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-1 px-4">
                {formation.modules?.map((module, index) => (
                  <li key={module.id}>
                    <button
                      onClick={() => onModuleChange && onModuleChange(module.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        currentModule === module.id
                          ? 'bg-blue-600 text-white font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`w-6 h-6 rounded-full text-xs font-medium flex items-center justify-center ${
                          currentModule === module.id 
                            ? 'bg-white text-blue-600' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="truncate">{module.title}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              {formation.modules?.find(m => m.id === currentModule) ? (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {formation.modules.find(m => m.id === currentModule).title}
                  </h2>
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: formation.modules.find(m => m.id === currentModule).htmlContent || 
                              '<p>Contenu du module à charger...</p>'
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sélectionnez un module
                  </h3>
                  <p className="text-gray-600">
                    Choisissez un module dans la barre latérale pour commencer
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FormationLayout;