import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Clock, Trophy, Target, Zap, TrendingUp, Star } from 'lucide-react';

const ProgressTracker = ({ modules, currentModule, primaryColor = '#1e40af' }) => {
  const [completedModules, setCompletedModules] = useState(new Set());
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [animateProgress, setAnimateProgress] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

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

  // Sauvegarder la progression avec animation
  useEffect(() => {
    const progress = {
      completedModules: Array.from(completedModules),
      timeSpent,
      lastModule: currentModule,
      lastUpdate: new Date().toISOString()
    };
    localStorage.setItem('formation-progress', JSON.stringify(progress));
    
    // Animation de la barre de progression
    setAnimateProgress(true);
    setTimeout(() => setAnimateProgress(false), 1000);
  }, [completedModules, timeSpent, currentModule]);

  // Marquer un module comme terminé avec célébration
  const markModuleCompleted = (moduleId) => {
    setCompletedModules(prev => {
      const newSet = new Set([...prev, moduleId]);
      
      // Célébration si formation complétée
      if (newSet.size === modules?.length) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
      
      return newSet;
    });
  };

  // Calculer les statistiques
  const totalModules = modules?.length || 0;
  const completedCount = completedModules.size;
  const progressPercentage = totalModules > 0 ? (completedCount / totalModules) * 100 : 0;
  const estimatedTotalTime = modules?.reduce((total, module) => total + (module.estimatedDuration || 0), 0) || 0;
  const formattedTimeSpent = Math.floor(timeSpent / 60);
  
  // Calculer le niveau de progression
  const getProgressLevel = () => {
    if (progressPercentage === 100) return { level: 'Expert', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (progressPercentage >= 75) return { level: 'Avancé', color: 'text-green-600', bg: 'bg-green-100' };
    if (progressPercentage >= 50) return { level: 'Intermédiaire', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (progressPercentage >= 25) return { level: 'Débutant+', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Débutant', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  // Déterminer le statut d'un module
  const getModuleStatus = (moduleId) => {
    if (completedModules.has(moduleId)) return 'completed';
    if (moduleId === currentModule) return 'current';
    return 'pending';
  };

  const currentModuleIndex = modules?.findIndex(m => m.id === currentModule) || 0;
  const progressLevel = getProgressLevel();

  return (
    <div className="space-y-6">
      {/* Cercle de progression animé principal */}
      <div className="relative">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              {/* Cercle de progression avec animation */}
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="40" 
                  stroke="#e5e7eb" strokeWidth="6" fill="none"
                />
                <circle 
                  cx="50" cy="50" r="40" 
                  stroke={primaryColor} strokeWidth="6" fill="none" 
                  strokeDasharray="251.2" 
                  strokeDashoffset={251.2 - (progressPercentage / 100) * 251.2}
                  strokeLinecap="round"
                  className={`transition-all duration-1000 ease-out ${animateProgress ? 'animate-pulse' : ''}`}
                  style={{
                    filter: `drop-shadow(0 0 8px ${primaryColor}40)`
                  }}
                />
              </svg>
              
              {/* Contenu central avec animation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-1 transition-all duration-500 ${animateProgress ? 'scale-110' : ''}`} 
                       style={{ color: primaryColor }}>
                    {Math.round(progressPercentage)}%
                  </div>
                  <div className="text-xs text-gray-500 font-medium">Progression</div>
                </div>
              </div>
              
              {/* Effet de pulsation pour le module actuel */}
              {currentModule && (
                <div className="absolute inset-0 rounded-full animate-ping opacity-20" 
                     style={{ backgroundColor: primaryColor }}></div>
              )}
            </div>
            
            {/* Badge de niveau */}
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold ${progressLevel.bg} ${progressLevel.color} mb-4`}>
              <Star size={16} className="animate-pulse" />
              <span>{progressLevel.level}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques rapides avec animations */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle size={18} className="text-green-600 animate-bounce" />
            <span className="text-xs font-medium text-green-700 uppercase tracking-wide">Terminés</span>
          </div>
          <div className={`text-2xl font-bold text-green-800 transition-all duration-500 ${animateProgress ? 'animate-pulse' : ''}`}>
            {completedCount}
          </div>
          <div className="text-xs text-green-600 mt-1">
            sur {totalModules}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center space-x-2 mb-2">
            <Target size={18} className="text-blue-600 animate-pulse" />
            <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">Restants</span>
          </div>
          <div className="text-2xl font-bold text-blue-800">
            {totalModules - completedCount}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            modules
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center space-x-2 mb-2">
            <Clock size={18} className="text-purple-600 animate-spin" style={{ animationDuration: '3s' }} />
            <span className="text-xs font-medium text-purple-700 uppercase tracking-wide">Temps</span>
          </div>
          <div className="text-2xl font-bold text-purple-800">
            {formattedTimeSpent}
          </div>
          <div className="text-xs text-purple-600 mt-1">
            minutes
          </div>
        </div>
      </div>

      {/* Progression détaillée des modules */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
            <TrendingUp size={20} style={{ color: primaryColor }} />
            <span>Modules de formation</span>
          </h4>
          
          {/* Indicateur de temps estimé restant */}
          <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
            <Clock size={14} />
            <span>~{Math.max(0, estimatedTotalTime - formattedTimeSpent)} min restantes</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {modules?.map((module, index) => {
            const status = getModuleStatus(module.id);
            
            return (
              <div
                key={module.id}
                className={`group relative flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 cursor-pointer ${
                  status === 'current' 
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 shadow-md transform scale-[1.02]' 
                    : status === 'completed'
                    ? 'bg-gradient-to-r from-green-50 to-green-100 border border-green-200 hover:shadow-md'
                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:shadow-sm'
                }`}
              >
                {/* Effet de brillance au survol */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 transition-all duration-700 group-hover:translate-x-full rounded-xl"></div>
                
                {/* Icône de statut avec animations */}
                <div className="flex-shrink-0 relative">
                  {status === 'completed' ? (
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <CheckCircle size={18} className="text-white" />
                    </div>
                  ) : status === 'current' ? (
                    <div className="relative">
                      <div 
                        className="w-10 h-10 rounded-full border-3 flex items-center justify-center shadow-lg animate-pulse"
                        style={{ 
                          borderColor: primaryColor,
                          background: `linear-gradient(135deg, ${primaryColor}20, ${primaryColor}40)`
                        }}
                      >
                        <div 
                          className="w-4 h-4 rounded-full animate-ping"
                          style={{ backgroundColor: primaryColor }}
                        />
                      </div>
                      {/* Cercle de progression autour */}
                      <div className="absolute inset-0">
                        <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 40 40">
                          <circle cx="20" cy="20" r="18" stroke={`${primaryColor}30`} strokeWidth="2" fill="none"/>
                          <circle 
                            cx="20" cy="20" r="18" 
                            stroke={primaryColor} strokeWidth="2" fill="none" 
                            strokeDasharray="113" 
                            strokeDashoffset={113 - (60 / 100) * 113}
                            strokeLinecap="round"
                            className="animate-pulse"
                          />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center group-hover:bg-gray-400 transition-colors shadow-md">
                      <span className="text-sm font-bold text-gray-600 group-hover:text-gray-700">
                        {index + 1}
                      </span>
                    </div>
                  )}
                </div>

                {/* Informations du module */}
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold truncate transition-colors ${
                    status === 'current' ? 'text-gray-900' : 
                    status === 'completed' ? 'text-green-900' : 'text-gray-700'
                  }`}>
                    {module.title}
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Clock size={12} />
                      <span>{module.estimatedDuration}min</span>
                    </span>
                    
                    {/* Badge de statut */}
                    {status === 'completed' && (
                      <span className="inline-flex items-center space-x-1 text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs font-medium">
                        <CheckCircle size={10} />
                        <span>Terminé</span>
                      </span>
                    )}
                    
                    {status === 'current' && (
                      <span className="inline-flex items-center space-x-1 text-blue-600 bg-blue-100 px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                        <Zap size={10} />
                        <span>En cours</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Indicateur de progression pour le module actuel */}
                {status === 'current' && (
                  <div className="flex-shrink-0">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 animate-pulse"
                        style={{ 
                          width: '60%',
                          background: `linear-gradient(90deg, ${primaryColor}, #8B5CF6)`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bouton de marquage comme terminé avec animation */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        {!completedModules.has(currentModule) && currentModule && (
          <button
            onClick={() => markModuleCompleted(currentModule)}
            className="group w-full flex items-center justify-center space-x-3 px-6 py-4 text-white rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, ${primaryColor}, #8B5CF6)`,
            }}
          >
            {/* Effet de brillance */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 transition-all duration-700 group-hover:translate-x-full"></div>
            
            <CheckCircle size={20} className="animate-bounce group-hover:animate-spin" />
            <span className="font-semibold">Marquer comme terminé</span>
            <Zap size={16} className="animate-pulse" />
          </button>
        )}
        
        {completedModules.has(currentModule) && currentModule && (
          <div className="flex items-center justify-center space-x-3 px-6 py-4 text-green-700 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border-2 border-green-200">
            <CheckCircle size={20} className="text-green-600 animate-pulse" />
            <span className="font-semibold">Module terminé</span>
            <Star size={16} className="text-yellow-500 animate-bounce" />
          </div>
        )}
      </div>

      {/* Badge de completion avec célébration */}
      {progressPercentage === 100 && (
        <div className={`bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white rounded-2xl p-6 text-center shadow-xl transform transition-all duration-500 ${showCelebration ? 'scale-110 animate-bounce' : ''}`}>
          <div className="space-y-3">
            <div className="flex justify-center space-x-2">
              <Trophy size={32} className="animate-bounce" />
              {showCelebration && (
                <>
                  <div className="text-2xl animate-bounce" style={{ animationDelay: '0.1s' }}>🎉</div>
                  <div className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</div>
                  <div className="text-2xl animate-bounce" style={{ animationDelay: '0.3s' }}>🎊</div>
                </>
              )}
            </div>
            <div className="text-xl font-bold">Formation terminée !</div>
            <div className="text-sm opacity-90">Félicitations pour votre réussite exceptionnelle</div>
            
            {/* Confettis animés */}
            {showCelebration && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full animate-ping"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${1 + Math.random()}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;