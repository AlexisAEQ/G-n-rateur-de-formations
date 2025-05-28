import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, BookOpen, Target, CheckCircle, Star, BarChart3, Users } from 'lucide-react';
import ModuleCard from '../components/ModuleCard';
import ProgressTracker from '../components/ProgressTracker';
import QuizSection from '../components/QuizSection';

const SkillsTemplate = ({ formation, currentModule, onModuleComplete }) => {
  const [skillLevels, setSkillLevels] = useState({});
  const [activeTab, setActiveTab] = useState('progression');
  const [completedExercises, setCompletedExercises] = useState(new Set());

  const primaryColor = formation.primary_color || '#10b981';
  const accentColor = formation.accent_color || '#f59e0b';

  // Niveaux de compétence
  const skillGrades = ['débutant', 'intermédiaire', 'avancé', 'expert'];
  const currentSkillLevel = formation.difficulty || 'intermédiaire';
  const targetSkillLevel = skillGrades[Math.min(skillGrades.indexOf(currentSkillLevel) + 1, skillGrades.length - 1)];

  // Exercices pratiques basés sur les objectifs
  const practicalExercises = formation.learning_objectives?.map((objective, index) => ({
    id: index + 1,
    title: `Exercice ${index + 1}`,
    description: objective,
    difficulty: currentSkillLevel,
    estimatedTime: 15 + (index * 5),
    completed: completedExercises.has(index + 1)
  })) || [];

  // Charger les données de progression sauvegardées
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

  // Marquer un exercice comme terminé
  const completeExercise = (exerciseId) => {
    setCompletedExercises(prev => new Set([...prev, exerciseId]));
    
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

  const module = getCurrentModule();

  return (
    <div className="max-w-6xl mx-auto">
      {/* En-tête spécialisé compétences */}
      <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <TrendingUp size={32} />
                <div>
                  <h1 className="text-2xl font-bold">{formation.title}</h1>
                  <p className="text-green-100">Formation de mise à niveau des compétences</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="font-medium">Niveau actuel</div>
                  <div className="text-green-100 capitalize">{currentSkillLevel}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="font-medium">Objectif</div>
                  <div className="text-green-100 capitalize">{targetSkillLevel}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="font-medium">Exercices</div>
                  <div className="text-green-100">{practicalExercises.length}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="font-medium">Durée</div>
                  <div className="text-green-100">{formation.duration}min</div>
                </div>
              </div>
            </div>
            
            <div className="ml-6 flex-shrink-0">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold">{Math.round(overallMastery)}%</div>
                  <div className="text-xs text-green-100">Maîtrise</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'progression', label: 'Progression', icon: BarChart3 },
              { id: 'exercises', label: 'Exercices', icon: Target },
              { id: 'content', label: 'Contenu', icon: BookOpen },
              { id: 'evaluation', label: 'Évaluation', icon: Award }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="space-y-6">
        {/* Onglet Progression */}
        {activeTab === 'progression' && (
          <div className="space-y-6">
            {/* Tableau de bord des compétences */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <BarChart3 size={20} style={{ color: primaryColor }} />
                <span>Tableau de bord des compétences</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Niveau de maîtrise global */}
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                  <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{Math.round(overallMastery)}%</div>
                      <div className="text-xs text-green-500">Global</div>
                    </div>
                  </div>
                  <div className="font-medium text-gray-900">Niveau de maîtrise</div>
                </div>

                {/* Exercices terminés */}
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                  <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{completedExercises.size}</div>
                      <div className="text-xs text-blue-500">sur {practicalExercises.length}</div>
                    </div>
                  </div>
                  <div className="font-medium text-gray-900">Exercices terminés</div>
                </div>

                {/* Temps passé */}
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(completedExercises.size * 15)}
                      </div>
                      <div className="text-xs text-purple-500">min</div>
                    </div>
                  </div>
                  <div className="font-medium text-gray-900">Temps d'apprentissage</div>
                </div>
              </div>
            </div>

            {/* Progression par compétence */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Progression détaillée
              </h3>
              
              <div className="space-y-4">
                {formation.learning_objectives?.map((objective, index) => {
                  const skillName = `Compétence ${index + 1}`;
                  const level = skillLevels[skillName] || 0;
                  const isCompleted = completedExercises.has(index + 1);
                  
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {isCompleted ? <CheckCircle size={16} /> : <Target size={16} />}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{skillName}</div>
                            <div className="text-sm text-gray-600">{objective}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{Math.round(level)}%</div>
                          <div className="text-xs text-gray-500">Maîtrise</div>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${level}%`,
                            backgroundColor: isCompleted ? '#10b981' : '#6b7280'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommandations */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center space-x-2">
                <Users size={20} />
                <span>Recommandations personnalisées</span>
              </h3>
              
              <div className="space-y-3">
                {completedExercises.size === 0 && (
                  <p className="text-blue-800">
                    Commencez par les exercices de base pour développer vos compétences fondamentales.
                  </p>
                )}
                
                {completedExercises.size > 0 && completedExercises.size < practicalExercises.length && (
                  <p className="text-blue-800">
                    Excellent progrès ! Continuez avec les exercices suivants pour approfondir vos connaissances.
                  </p>
                )}
                
                {completedExercises.size === practicalExercises.length && (
                  <p className="text-blue-800">
                    Félicitations ! Vous avez terminé tous les exercices. Passez à l'évaluation finale.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Onglet Exercices */}
        {activeTab === 'exercises' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Target size={20} style={{ color: primaryColor }} />
                <span>Exercices pratiques</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {practicalExercises.map(exercise => (
                  <div
                    key={exercise.id}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      exercise.completed 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                          exercise.completed 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {exercise.completed ? <CheckCircle size={16} /> : exercise.id}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{exercise.title}</h4>
                          <div className="text-sm text-gray-600 capitalize">
                            Niveau {exercise.difficulty}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right text-sm text-gray-500">
                        {exercise.estimatedTime} min
                      </div>
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-4">
                      {exercise.description}
                    </p>
                    
                    {!exercise.completed ? (
                      <button
                        onClick={() => completeExercise(exercise.id)}
                        className="w-full px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Commencer l'exercice
                      </button>
                    ) : (
                      <div className="flex items-center space-x-2 text-green-600 text-sm font-medium">
                        <CheckCircle size={16} />
                        <span>Exercice terminé</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Plan d'apprentissage */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Plan d'apprentissage recommandé
              </h3>
              
              <div className="space-y-4">
                {[
                  { 
                    phase: 'Phase 1 - Fondamentaux', 
                    duration: '30 min', 
                    exercises: practicalExercises.slice(0, 2),
                    color: 'blue'
                  },
                  { 
                    phase: 'Phase 2 - Pratique', 
                    duration: '45 min', 
                    exercises: practicalExercises.slice(2, 4),
                    color: 'yellow'
                  },
                  { 
                    phase: 'Phase 3 - Maîtrise', 
                    duration: '30 min', 
                    exercises: practicalExercises.slice(4),
                    color: 'green'
                  }
                ].map((phase, index) => (
                  <div key={index} className={`border-l-4 pl-4 py-2 ${
                    phase.color === 'blue' ? 'border-blue-400 bg-blue-50' :
                    phase.color === 'yellow' ? 'border-yellow-400 bg-yellow-50' :
                    'border-green-400 bg-green-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{phase.phase}</h4>
                      <span className="text-sm text-gray-600">{phase.duration}</span>
                    </div>
                    <div className="text-sm text-gray-700 mt-1">
                      {phase.exercises.length} exercices • 
                      {phase.exercises.filter(ex => ex.completed).length} terminés
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Onglet Contenu */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Objectifs pédagogiques */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <BookOpen size={20} style={{ color: primaryColor }} />
                <span>Objectifs d'apprentissage</span>
              </h3>
              
              <div className="space-y-3">
                {formation.learning_objectives?.map((objective, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {index + 1}
                      </div>
                      {completedExercises.has(index + 1) && (
                        <Star size={16} className="text-yellow-500" />
                      )}
                    </div>
                    <span className="text-gray-700 flex-1">{objective}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contenu du module actuel */}
            {module && (
              <ModuleCard
                module={module}
                formation={formation}
                isActive={true}
                onComplete={onModuleComplete}
              />
            )}

            {/* Ressources complémentaires */}
            {formation.resources && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Ressources complémentaires
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formation.resources.links?.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <BookOpen size={16} className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{link.title}</div>
                        {link.description && (
                          <div className="text-sm text-gray-600">{link.description}</div>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Onglet Évaluation */}
        {activeTab === 'evaluation' && (
          <div className="space-y-6">
            {/* Prérequis pour l'évaluation */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center space-x-2">
                <Award size={20} />
                <span>Conditions d'accès à l'évaluation</span>
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    completedExercises.size >= practicalExercises.length * 0.8 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {completedExercises.size >= practicalExercises.length * 0.8 ? '✓' : '○'}
                  </div>
                  <span className="text-amber-800">
                    Compléter au moins 80% des exercices ({Math.ceil(practicalExercises.length * 0.8)} sur {practicalExercises.length})
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    overallMastery >= 70 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {overallMastery >= 70 ? '✓' : '○'}
                  </div>
                  <span className="text-amber-800">
                    Atteindre un niveau de maîtrise d'au moins 70%
                  </span>
                </div>
              </div>
            </div>

            {/* Évaluation */}
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
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Formation terminée avec succès !
                  </h3>
                  <p className="text-green-700">
                    Vous avez complété tous les exercices et atteint le niveau de maîtrise requis.
                  </p>
                </div>
              )
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <Target size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Évaluation non disponible
                </h3>
                <p className="text-gray-600">
                  Complétez d'abord les exercices requis pour accéder à l'évaluation finale.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsTemplate;