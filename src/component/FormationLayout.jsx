import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, BookOpen, Target, CheckCircle, Star, BarChart3, Users, Zap, Trophy, Flame, Sparkles, ArrowRight, Play, Lock, Unlock } from 'lucide-react';
import ModuleCard from '../component/ModuleCard';
import ProgressTracker from '../component/ProgressTracker';
import QuizSection from '../component/QuizSection';

const SkillsTemplate = ({ formation, currentModule, onModuleComplete }) => {
  const [skillLevels, setSkillLevels] = useState({});
  const [activeTab, setActiveTab] = useState('progression');
  const [completedExercises, setCompletedExercises] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  const primaryColor = formation.primary_color || '#10b981';
  const accentColor = formation.accent_color || '#f59e0b';

  // Animation de chargement
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Niveaux de compétence avec couleurs dynamiques
  const skillGrades = [
    { name: 'débutant', color: 'from-red-400 to-red-600', icon: '🌱' },
    { name: 'intermédiaire', color: 'from-yellow-400 to-orange-500', icon: '⚡' },
    { name: 'avancé', color: 'from-green-400 to-emerald-600', icon: '🚀' },
    { name: 'expert', color: 'from-purple-400 to-indigo-600', icon: '👑' }
  ];

  const currentSkillLevel = formation.difficulty || 'intermédiaire';
  const currentGrade = skillGrades.find(g => g.name === currentSkillLevel) || skillGrades[1];
  const targetGrade = skillGrades[Math.min(skillGrades.findIndex(g => g.name === currentSkillLevel) + 1, skillGrades.length - 1)];

  // Exercices pratiques avec gamification
  const practicalExercises = formation.learning_objectives?.map((objective, index) => ({
    id: index + 1,
    title: `Mission ${index + 1}`,
    description: objective,
    difficulty: currentSkillLevel,
    estimatedTime: 15 + (index * 5),
    xp: (index + 1) * 100,
    completed: completedExercises.has(index + 1),
    locked: index > 0 && !completedExercises.has(index)
  })) || [];

  // Charger les données sauvegardées
  useEffect(() => {
    const savedSkills = localStorage.getItem('skills-progress');
    if (savedSkills) {
      try {
        const data = JSON.parse(savedSkills);
        setSkillLevels(data.skillLevels || {});
        setCompletedExercises(new Set(data.completedExercises || []));
      } catch (error) {
        console.error('Erreur lors du chargement des compétences:', error);
      }
    }
  }, []);

  // Sauvegarder la progression
  useEffect(() => {
    const progressData = {
      skillLevels,
      completedExercises: Array.from(completedExercises),
      lastUpdate: new Date().toISOString()
    };
    localStorage.setItem('skills-progress', JSON.stringify(progressData));
  }, [skillLevels, completedExercises]);

  // Marquer un exercice comme terminé avec animation
  const completeExercise = (exerciseId) => {
    setCompletedExercises(prev => new Set([...prev, exerciseId]));
    
    // Animation de célébration
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
    
    // Mettre à jour le niveau de compétence
    const skill = formation.title;
    const currentLevel = skillLevels[skill] || 0;
    const newLevel = Math.min(currentLevel + (100 / practicalExercises.length), 100);
    
    setSkillLevels(prev => ({
      ...prev,
      [skill]: newLevel
    }));
  };

  // Obtenir le module actuel
  const getCurrentModule = () => {
    return formation.modules?.find(m => m.id === currentModule) || formation.modules?.[0];
  };

  // Calculer le niveau de maîtrise global
  const overallMastery = Object.values(skillLevels).reduce((acc, level) => acc + level, 0) / Object.keys(skillLevels).length || 0;
  const totalXP = Array.from(completedExercises).reduce((total, id) => {
    const exercise = practicalExercises.find(ex => ex.id === id);
    return total + (exercise?.xp || 0);
  }, 0);

  const module = getCurrentModule();

  // Loading screen moderne
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-32 h-32 border-4 border-white/20 rounded-full animate-spin">
              <div className="absolute top-0 left-0 w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="text-white text-4xl animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mt-8 animate-pulse">
            Chargement de votre parcours...
          </h2>
          <div className="text-blue-200 mt-2">Préparation de l'expérience d'apprentissage</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Animation de célébration */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl animate-bounce">🎉</div>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 animate-pulse"></div>
        </div>
      )}

      {/* Header héroïque avec glassmorphism */}
      <div className="relative overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Particules d'arrière-plan */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <div className="relative px-8 py-12">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                  <TrendingUp size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                    {formation.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-white/90">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                      {currentGrade.icon} {currentSkillLevel}
                    </span>
                    <span className="text-sm">→</span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                      {targetGrade.icon} {targetGrade.name}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Statistiques en temps réel */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'XP Total', value: totalXP, icon: Zap, color: 'from-yellow-400 to-orange-500' },
                  { label: 'Maîtrise', value: `${Math.round(overallMastery)}%`, icon: Target, color: 'from-green-400 to-emerald-500' },
                  { label: 'Missions', value: `${completedExercises.size}/${practicalExercises.length}`, icon: Trophy, color: 'from-blue-400 to-indigo-500' },
                  { label: 'Temps', value: `${formation.duration}min`, icon: BarChart3, color: 'from-purple-400 to-pink-500' }
                ].map((stat, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                        <stat.icon size={20} className="text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-xs text-white/70">{stat.label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Niveau circulaire animé */}
            <div className="ml-8 flex-shrink-0">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2.51 * overallMastery} 251`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#06d6a0" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{Math.round(overallMastery)}%</div>
                    <div className="text-xs text-white/70">Niveau</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets moderne */}
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 mb-8 mx-4 overflow-hidden">
        <nav className="flex">
          {[
            { id: 'progression', label: 'Progression', icon: BarChart3, gradient: 'from-blue-500 to-indigo-600' },
            { id: 'exercises', label: 'Missions', icon: Target, gradient: 'from-emerald-500 to-teal-600' },
            { id: 'content', label: 'Contenu', icon: BookOpen, gradient: 'from-purple-500 to-pink-600' },
            { id: 'evaluation', label: 'Évaluation', icon: Award, gradient: 'from-orange-500 to-red-600' }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-medium text-sm transition-all duration-300 relative overflow-hidden group ${
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} transition-all duration-300`} />
                )}
                <div className="relative z-10 flex items-center space-x-2">
                  <Icon size={18} className={isActive ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
                  <span>{tab.label}</span>
                </div>
                {!isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} opacity-0 group-hover:opacity-10 transition-all duration-300`} />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="space-y-8 mx-4">
        {/* Onglet Progression */}
        {activeTab === 'progression' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Dashboard gaming style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* XP et niveau */}
              <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <Zap size={32} className="animate-pulse" />
                  <div className="text-right">
                    <div className="text-3xl font-black">{totalXP}</div>
                    <div className="text-sm opacity-90">Points XP</div>
                  </div>
                </div>
                <div className="bg-white/20 rounded-full h-2 mb-2">
                  <div 
                    className="bg-white rounded-full h-2 transition-all duration-1000"
                    style={{ width: `${(totalXP % 1000) / 10}%` }}
                  />
                </div>
                <div className="text-xs opacity-80">Niveau {Math.floor(totalXP / 1000) + 1}</div>
              </div>

              {/* Missions complétées */}
              <div className="bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-2xl p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <Trophy size={32} className="animate-bounce" />
                  <div className="text-right">
                    <div className="text-3xl font-black">{completedExercises.size}</div>
                    <div className="text-sm opacity-90">Missions</div>
                  </div>
                </div>
                <div className="bg-white/20 rounded-full h-2 mb-2">
                  <div 
                    className="bg-white rounded-full h-2 transition-all duration-1000"
                    style={{ width: `${(completedExercises.size / practicalExercises.length) * 100}%` }}
                  />
                </div>
                <div className="text-xs opacity-80">sur {practicalExercises.length} missions</div>
              </div>

              {/* Maîtrise globale */}
              <div className="bg-gradient-to-br from-purple-400 via-pink-500 to-rose-500 rounded-2xl p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <Flame size={32} className="animate-pulse" />
                  <div className="text-right">
                    <div className="text-3xl font-black">{Math.round(overallMastery)}%</div>
                    <div className="text-sm opacity-90">Maîtrise</div>
                  </div>
                </div>
                <div className="bg-white/20 rounded-full h-2 mb-2">
                  <div 
                    className="bg-white rounded-full h-2 transition-all duration-1000"
                    style={{ width: `${overallMastery}%` }}
                  />
                </div>
                <div className="text-xs opacity-80">{targetGrade.name} en vue</div>
              </div>
            </div>

            {/* Progression détaillée par compétence */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
                <BarChart3 size={24} className="text-blue-600" />
                <span>Progression détaillée</span>
              </h3>
              
              <div className="space-y-4">
                {formation.learning_objectives?.map((objective, index) => {
                  const skillName = `Compétence ${index + 1}`;
                  const level = skillLevels[skillName] || 0;
                  const isCompleted = completedExercises.has(index + 1);
                  
                  return (
                    <div key={index} className="group">
                      <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                              isCompleted 
                                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' 
                                : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                            }`}>
                              {isCompleted ? <CheckCircle size={20} /> : <Target size={20} />}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">{skillName}</div>
                              <div className="text-sm text-gray-600 line-clamp-1">{objective}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-800">{Math.round(level)}%</div>
                            <div className="text-xs text-gray-500">Maîtrise</div>
                          </div>
                        </div>
                        
                        <div className="relative">
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                                isCompleted 
                                  ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                                  : 'bg-gradient-to-r from-blue-400 to-indigo-500'
                              }`}
                              style={{ width: `${level}%` }}
                            />
                          </div>
                          {isCompleted && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                              <Star size={16} className="text-yellow-400 animate-pulse" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Onglet Missions/Exercices */}
        {activeTab === 'exercises' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {practicalExercises.map(exercise => (
                <div
                  key={exercise.id}
                  className={`group relative overflow-hidden rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 ${
                    exercise.completed 
                      ? 'bg-gradient-to-br from-green-400 to-emerald-600' 
                      : exercise.locked
                        ? 'bg-gradient-to-br from-gray-300 to-gray-500'
                        : 'bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500'
                  }`}
                >
                  {/* Badge XP */}
                  <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm font-bold">
                    +{exercise.xp} XP
                  </div>

                  <div className="p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                          exercise.completed 
                            ? 'bg-white/20' 
                            : exercise.locked
                              ? 'bg-black/20'
                              : 'bg-white/20'
                        }`}>
                          {exercise.completed ? (
                            <CheckCircle size={24} />
                          ) : exercise.locked ? (
                            <Lock size={24} />
                          ) : (
                            exercise.id
                          )}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold">{exercise.title}</h4>
                          <div className="text-sm opacity-90 capitalize">
                            Niveau {exercise.difficulty} • {exercise.estimatedTime} min
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-white/90 mb-6 line-clamp-2">
                      {exercise.description}
                    </p>
                    
                    {exercise.completed ? (
                      <div className="flex items-center space-x-2 text-white font-medium">
                        <Trophy size={20} />
                        <span>Mission accomplie !</span>
                      </div>
                    ) : exercise.locked ? (
                      <div className="flex items-center space-x-2 text-white/70">
                        <Lock size={20} />
                        <span>Débloque la mission précédente</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => completeExercise(exercise.id)}
                        className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl py-3 px-6 text-white font-medium transition-all duration-300 flex items-center justify-center space-x-2 group"
                      >
                        <Play size={20} className="group-hover:scale-110 transition-transform" />
                        <span>Commencer la mission</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>

                  {/* Effet de brillance au survol */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Onglet Contenu */}
        {activeTab === 'content' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {module && (
              <ModuleCard
                module={module}
                formation={formation}
                isActive={true}
                onComplete={onModuleComplete}
              />
            )}
          </div>
        )}

        {/* Onglet Évaluation */}
        {activeTab === 'evaluation' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {(completedExercises.size >= practicalExercises.length * 0.8 && overallMastery >= 70) ? (
              formation.assessment ? (
                <QuizSection
                  assessment={formation.assessment}
                  primaryColor={primaryColor}
                  passingGrade={formation.assessment.passing_grade || 80}
                  onComplete={(results) => {
                    console.log('Évaluation terminée:', results);
                    if (onModuleComplete) {
                      onModuleComplete('evaluation', results);
                    }
                  }}
                />
              ) : (
                <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl p-8 text-center text-white shadow-2xl">
                  <Trophy size={64} className="mx-auto mb-6 animate-bounce" />
                  <h3 className="text-3xl font-bold mb-4">
                    🎉 Mission accomplie !
                  </h3>
                  <p className="text-xl mb-6">
                    Vous avez maîtrisé toutes les compétences !
                  </p>
                  <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold">{totalXP} XP gagnés</div>
                    <div className="text-sm opacity-90">Nouveau niveau débloqué</div>
                  </div>
                </div>
              )
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-center">
                <Lock size={64} className="mx-auto text-gray-400 mb-6" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Évaluation verrouillée
                </h3>
                <p className="text-gray-600 mb-6">
                  Complétez au moins 80% des missions pour débloquer l'évaluation finale.
                </p>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                  <div className="text-sm text-gray-700">
                    Progression : {completedExercises.size}/{practicalExercises.length} missions • {Math.round(overallMastery)}% maîtrise
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsTemplate;