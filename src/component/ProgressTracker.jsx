import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Clock, Trophy } from 'lucide-react';

const ProgressTracker = ({ modules, currentModule, primaryColor = '#1e40af' }) => {
  const [completedModules, setCompletedModules] = useState(new Set());
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState(null);

  // Charger les données de progression depuis le localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('formation-progress');
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        setCompletedModules(new Set(progress.completedModules || []));
        setTimeSpent(progress.timeSpent || 0);
      } catch (error) {
        console.error('Erreur lors du chargement de la progression:', error);
      }
    }
  }, []);

  // Démarrer le chronomètre quand on arrive sur un module
  useEffect(() => {
    setStartTime(Date.now());
    return () => {
      if (startTime) {
        const sessionTime = Math.floor((Date.now() - startTime) / 1000);
        setTimeSpent(prev => prev + sessionTime);
      }
    };
  }, [currentModule]);

  // Sauvegarder la progression
  useEffect(() => {
    const progress = {
      completedModules: Array.from(completedModules),
      timeSpent,
      lastModule: currentModule,
      lastUpdate: new Date().toISOString()
    };
    localStorage.setItem('formation-progress', JSON.stringify(progress));
  }, [completedModules, timeSpent, currentModule]);

  // Marquer un module comme terminé
  const markModuleCompleted = (moduleId) => {
    setCompletedModules(prev => new Set([...prev, moduleId]));
  };

  // Calculer les statistiques
  const totalModules = modules?.length || 0;
  const completedCount = completedModules.size;
  const progressPercentage = totalModules > 0 ? (completedCount / totalModules) * 100 : 0;
  const estimatedTotalTime = modules?.reduce((total, module) => total + (module.estimatedDuration || 0), 0) || 0;
  const formattedTimeSpent = Math.floor(timeSpent / 60);

  // Déterminer le statut d'un module
  const getModuleStatus = (moduleId) => {
    if (completedModules.has(moduleId)) return 'completed';
    if (moduleId === currentModule) return 'current';
    return 'pending';
  };

  // Obtenir l'index du module actuel
  const currentModuleIndex = modules?.findIndex(m => m.id === currentModule) || 0;

  return (
    <div className="space-y-4">
      {/* Barre de progression principale */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Progression</span>
          <span className="font-medium" style={{ color: primaryColor }}>
            {Math.round(progressPercentage)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${progressPercentage}%`, 
              backgroundColor: primaryColor 
            }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>{completedCount} / {totalModules} modules</span>
          <span>{formattedTimeSpent} / {estimatedTotalTime}min</span>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-lg font-bold" style={{ color: primaryColor }}>
            {completedCount}
          </div>
          <div className="text-xs text-gray-600">Terminés</div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-lg font-bold text-gray-700">
            {totalModules - completedCount}
          </div>
          <div className="text-xs text-gray-600">Restants</div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-lg font-bold text-gray-700">
            {formattedTimeSpent}min
          </div>
          <div className="text-xs text-gray-600">Temps</div>
        </div>
      </div>

      {/* Progression détaillée des modules */}
      <div className="space-y-1">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Modules</h4>
        
        {modules?.map((module, index) => {
          const status = getModuleStatus(module.id);
          
          return (
            <div
              key={module.id}
              className={`flex items-center space-x-3 p-2 rounded-md transition-colors ${
                status === 'current' ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              {/* Icône de statut */}
              <div className="flex-shrink-0">
                {status === 'completed' ? (
                  <CheckCircle size={16} style={{ color: primaryColor }} />
                ) : status === 'current' ? (
                  <div 
                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: primaryColor }}
                  >
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                  </div>
                ) : (
                  <Circle size={16} className="text-gray-300" />
                )}
              </div>

              {/* Informations du module */}
              <div className="flex-1 min-w-0">
                <div className={`text-sm truncate ${
                  status === 'current' ? 'font-medium text-gray-900' : 'text-gray-700'
                }`}>
                  {module.title}
                </div>
                <div className="text-xs text-gray-500">
                  {module.estimatedDuration}min
                </div>
              </div>

              {/* Numéro du module */}
              <div className={`text-xs px-2 py-1 rounded-full ${
                status === 'completed' 
                  ? 'text-white' 
                  : status === 'current'
                    ? 'text-white'
                    : 'bg-gray-200 text-gray-600'
              }`}
              style={{
                backgroundColor: status === 'completed' || status === 'current' ? primaryColor : undefined
              }}>
                {index + 1}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bouton de marquage comme terminé */}
      <div className="pt-2 border-t">
        {!completedModules.has(currentModule) && (
          <button
            onClick={() => markModuleCompleted(currentModule)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: primaryColor }}
          >
            <CheckCircle size={16} />
            <span>Marquer comme terminé</span>
          </button>
        )}
        
        {completedModules.has(currentModule) && (
          <div className="flex items-center justify-center space-x-2 px-4 py-2 text-sm text-green-700 bg-green-50 rounded-md">
            <CheckCircle size={16} className="text-green-600" />
            <span>Module terminé</span>
          </div>
        )}
      </div>

      {/* Badge de completion */}
      {progressPercentage === 100 && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg p-3 text-center">
          <Trophy size={24} className="mx-auto mb-1" />
          <div className="text-sm font-bold">Formation terminée !</div>
          <div className="text-xs opacity-90">Félicitations pour votre réussite</div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;