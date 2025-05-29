import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, BookOpen, Target, CheckCircle, Star, BarChart3, Users, 
         Zap, Trophy, Clock, PlayCircle, PauseCircle, RotateCcw, Brain, 
         ArrowRight, Lightbulb, Medal, Flame, ChevronUp, ChevronDown, 
         Eye, TrendingDown, Activity, Gauge } from 'lucide-react';
import ModuleCard from '../components/ModuleCard';
import ProgressTracker from '../components/ProgressTracker';
import QuizSection from '../components/QuizSection';
import VideoPlayer from '../components/VideoPlayer';

const SkillsTemplate = ({ formation, currentModule, onModuleComplete }) => {
  // États principaux
  const [skillLevels, setSkillLevels] = useState({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [completedExercises, setCompletedExercises] = useState(new Set());
  const [studyStreak, setStudyStreak] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [currentSessionTime, setCurrentSessionTime] = useState(0);
  const [sessionActive, setSessionActive] = useState(false);
  const [achievements, setAchievements] = useState(new Set());
  const [showCelebration, setShowCelebration] = useState(false);
  const [skillAnimations, setSkillAnimations] = useState({});
  const [selectedSkillDetail, setSelectedSkillDetail] = useState(null);
  const [studyGoal, setStudyGoal] = useState({ daily: 30, weekly: 210 }); // en minutes
  const [weakestSkills, setWeakestSkills] = useState([]);
  const [strongestSkills, setStrongestSkills] = useState([]);

  const primaryColor = formation.primary_color || '#10b981';
  const accentColor = formation.accent_color || '#f59e0b';

  // Configuration des niveaux de compétence avec couleurs et seuils
  const skillGrades = [
    { name: 'débutant', color: '#ef4444', min: 0, max: 25, icon: '🌱' },
    { name: 'intermédiaire', color: '#f59e0b', min: 25, max: 60, icon: '🌿' },
    { name: 'avancé', color: '#10b981', min: 60, max: 85, icon: '🌳' },
    { name: 'expert', color: '#8b5cf6', min: 85, max: 100, icon: '🏆' }
  ];

  const currentSkillLevel = formation.difficulty || 'intermédiaire';
  const targetSkillLevel = skillGrades[Math.min(skillGrades.findIndex(g => g.name === currentSkillLevel) + 1, skillGrades.length - 1)];

  // Générer des exercices pratiques plus détaillés
  const practicalExercises = formation.learning_objectives?.map((objective, index) => ({
    id: index + 1,
    title: `Défi ${index + 1}`,
    description: objective,
    difficulty: currentSkillLevel,
    estimatedTime: 15 + (index * 5),
    completed: completedExercises.has(index + 1),
    points: (index + 1) * 10,
    category: index < 2 ? 'fundamentals' : index < 4 ? 'practice' : 'mastery',
    skills: [`skill_${index + 1}`],
    prerequisites: index > 0 ? [index] : [],
    bonus: index === formation.learning_objectives.length - 1
  })) || [];

  // Liste des achievements possibles
  const possibleAchievements = [
    { id: 'first_exercise', name: 'Premier pas', description: 'Terminé votre premier exercice', icon: '🎯', points: 10 },
    { id: 'streak_3', name: 'Régularité', description: '3 jours consécutifs d\'étude', icon: '🔥', points: 25 },
    { id: 'streak_7', name: 'Dédication', description: '7 jours consécutifs d\'étude', icon: '⚡', points: 50 },
    { id: 'half_complete', name: 'À mi-chemin', description: '50% des exercices terminés', icon: '🎖️', points: 30 },
    { id: 'all_complete', name: 'Perfectionniste', description: 'Tous les exercices terminés', icon: '👑', points: 100 },
    { id: 'speed_demon', name: 'Éclair', description: 'Exercice terminé en moins de 10 min', icon: '⚡', points: 20 },
    { id: 'study_hour', name: 'Studieux', description: '1 heure d\'étude cumulative', icon: '📚', points: 15 },
    { id: 'expert_reached', name: 'Expertise', description: 'Niveau expert atteint', icon: '🧠', points: 75 }
  ];

  // Timer pour la session d'étude
  useEffect(() => {
    let interval;
    if (sessionActive) {
      interval = setInterval(() => {
        setCurrentSessionTime(prev => prev + 1);
        setTotalStudyTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionActive]);

  // Charger les données sauvegardées avec plus de détails
  useEffect(() => {
    const savedSkills = localStorage.getItem('skills-progress-enhanced');
    if (savedSkills) {
      try {
        const data = JSON.parse(savedSkills);
        setSkillLevels(data.skillLevels || {});
        setCompletedExercises(new Set(data.completedExercises || []));
        setStudyStreak(data.studyStreak || 0);
        setTotalStudyTime(data.totalStudyTime || 0);
        setAchievements(new Set(data.achievements || []));
        setStudyGoal(data.studyGoal || { daily: 30, weekly: 210 });
      } catch (error) {
        console.error('Erreur lors du chargement des compétences:', error);
      }
    }
  }, []);

  // Sauvegarder la progression avec plus de données
  useEffect(() => {
    const progressData = {
      skillLevels,
      completedExercises: Array.from(completedExercises),
      studyStreak,
      totalStudyTime,
      achievements: Array.from(achievements),
      studyGoal,
      lastUpdate: new Date().toISOString(),
      lastStudyDate: new Date().toDateString()
    };
    localStorage.setItem('skills-progress-enhanced', JSON.stringify(progressData));
  }, [skillLevels, completedExercises, studyStreak, totalStudyTime, achievements, studyGoal]);

  // Analyser les compétences faibles/fortes
  useEffect(() => {
    const skillEntries = Object.entries(skillLevels);
    if (skillEntries.length > 0) {
      const sorted = skillEntries.sort(([,a], [,b]) => b - a);
      setStrongestSkills(sorted.slice(0, 2));
      setWeakestSkills(sorted.slice(-2).reverse());
    }
  }, [skillLevels]);

  // Fonction pour marquer un exercice comme terminé avec animations et récompenses
  const completeExercise = (exerciseId) => {
    const exercise = practicalExercises.find(ex => ex.id === exerciseId);
    if (!exercise || completedExercises.has(exerciseId)) return;

    setCompletedExercises(prev => new Set([...prev, exerciseId]));
    
    // Animation du skill level
    const skillName = `skill_${exerciseId}`;
    setSkillAnimations(prev => ({ ...prev, [skillName]: true }));
    setTimeout(() => setSkillAnimations(prev => ({ ...prev, [skillName]: false })), 1000);
    
    // Mettre à jour le niveau de compétence avec bonus
    const baseIncrease = 100 / practicalExercises.length;
    const bonus = exercise.bonus ? 10 : 0;
    const timeBonus = currentSessionTime < 600 ? 5 : 0; // Bonus si moins de 10 min
    
    const currentLevel = skillLevels[skillName] || 0;
    const newLevel = Math.min(currentLevel + baseIncrease + bonus + timeBonus, 100);
    
    setSkillLevels(prev => ({
      ...prev,
      [skillName]: newLevel
    }));

    // Vérifier les achievements
    checkAchievements(exerciseId);
    
    // Célébration
    triggerCelebration();
    
    // Reset du timer de session pour l'exercice suivant
    setCurrentSessionTime(0);
  };

  // Vérifier et débloquer les achievements
  const checkAchievements = (completedExerciseId) => {
    const newAchievements = new Set(achievements);
    
    // Premier exercice
    if (completedExercises.size === 0) {
      newAchievements.add('first_exercise');
    }
    
    // Exercices à mi-chemin
    if (completedExercises.size + 1 >= practicalExercises.length / 2) {
      newAchievements.add('half_complete');
    }
    
    // Tous les exercices
    if (completedExercises.size + 1 === practicalExercises.length) {
      newAchievements.add('all_complete');
    }
    
    // Exercice rapide
    if (currentSessionTime < 600) { // moins de 10 minutes
      newAchievements.add('speed_demon');
    }
    
    // Temps d'étude
    if (totalStudyTime >= 3600) { // 1 heure
      newAchievements.add('study_hour');
    }
    
    // Niveau expert
    const maxSkillLevel = Math.max(...Object.values(skillLevels), 0);
    if (maxSkillLevel >= 85) {
      newAchievements.add('expert_reached');
    }
    
    setAchievements(newAchievements);
  };

  // Animation de célébration
  const triggerCelebration = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
  };

  // Contrôles de session d'étude
  const toggleStudySession = () => {
    setSessionActive(!sessionActive);
    if (!sessionActive) {
      setCurrentSessionTime(0);
    }
  };

  const resetSession = () => {
    setSessionActive(false);
    setCurrentSessionTime(0);
  };

  // Calculer le niveau de maîtrise global avec pondération
  const overallMastery = practicalExercises.length > 0 
    ? (completedExercises.size / practicalExercises.length) * 100
    : 0;

  // Calculer les points totaux
  const totalPoints = Array.from(completedExercises).reduce((total, exerciseId) => {
    const exercise = practicalExercises.find(ex => ex.id === exerciseId);
    return total + (exercise?.points || 0);
  }, 0) + Array.from(achievements).reduce((total, achievementId) => {
    const achievement = possibleAchievements.find(a => a.id === achievementId);
    return total + (achievement?.points || 0);
  }, 0);

  // Obtenir le module actuel
  const getCurrentModule = () => {
    return formation.modules?.find(m => m.id === currentModule) || formation.modules?.[0];
  };

  // Formater le temps
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  // Obtenir la couleur du niveau de compétence
  const getSkillColor = (level) => {
    const grade = skillGrades.find(g => level >= g.min && level < g.max) || skillGrades[0];
    return grade.color;
  };

  const module = getCurrentModule();

  return (
    <div className="max-w-7xl mx-auto relative">
      {/* Animation de célébration */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="text-6xl animate-bounce">🎉</div>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 animate-pulse"></div>
        </div>
      )}

      {/* En-tête enhanced avec gamification */}
      <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 px-6 py-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative">
                    <TrendingUp size={40} />
                    {sessionActive && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">{formation.title}</h1>
                    <p className="text-green-100 text-lg">Formation interactive de développement des compétences</p>
                  </div>
                </div>
                
                {/* Statistiques en temps réel */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="font-bold text-lg">{Math.round(overallMastery)}%</div>
                    <div className="text-green-100">Progression</div>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="font-bold text-lg">{totalPoints}</div>
                    <div className="text-green-100">Points XP</div>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="font-bold text-lg">{studyStreak}</div>
                    <div className="text-green-100">Série</div>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="font-bold text-lg">{achievements.size}</div>
                    <div className="text-green-100">Badges</div>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="font-bold text-lg">{formatTime(totalStudyTime)}</div>
                    <div className="text-green-100">Temps total</div>
                  </div>
                </div>
              </div>
              
              {/* Timer de session et contrôles */}
              <div className="ml-6 flex-shrink-0 text-center">
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-mono font-bold mb-2">
                    {formatTime(currentSessionTime)}
                  </div>
                  <div className="text-green-100 text-sm mb-3">Session actuelle</div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={toggleStudySession}
                      className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                      title={sessionActive ? "Pause" : "Démarrer"}
                    >
                      {sessionActive ? <PauseCircle size={20} /> : <PlayCircle size={20} />}
                    </button>
                    <button
                      onClick={resetSession}
                      className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                      title="Reset"
                    >
                      <RotateCcw size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation par onglets améliorée */}
        <div className="border-b border-gray-200 bg-gray-50">
          <nav className="flex space-x-0 px-6">
            {[
              { id: 'dashboard', label: 'Tableau de bord', icon: Gauge, color: 'blue' },
              { id: 'exercises', label: 'Défis', icon: Target, color: 'orange', badge: practicalExercises.length - completedExercises.size },
              { id: 'progress', label: 'Progression', icon: BarChart3, color: 'green' },
              { id: 'content', label: 'Contenu', icon: BookOpen, color: 'purple' },
              { id: 'achievements', label: 'Succès', icon: Trophy, color: 'yellow', badge: achievements.size },
              { id: 'evaluation', label: 'Évaluation', icon: Award, color: 'red' }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center space-x-2 py-4 px-4 font-medium text-sm transition-all duration-200 border-b-3 ${
                    isActive
                      ? `border-${tab.color}-500 text-${tab.color}-600 bg-white shadow-sm`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className={`absolute -top-1 -right-1 bg-${tab.color}-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="space-y-6">
        {/* Onglet Tableau de bord */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Vue d'ensemble interactive */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Carte principale de progression */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                  <Activity size={24} style={{ color: primaryColor }} />
                  <span>Progression en temps réel</span>
                </h3>
                
                {/* Gauge circulaire de progression */}
                <div className="relative flex items-center justify-center mb-6">
                  <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke={primaryColor}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${overallMastery * 2.51} 251`}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl font-bold" style={{ color: primaryColor }}>
                          {Math.round(overallMastery)}%
                        </div>
                        <div className="text-gray-600 text-sm">Maîtrise globale</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Métriques détaillées */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <Brain size={24} className="text-blue-600" />
                      <div>
                        <div className="text-2xl font-bold text-blue-700">{completedExercises.size}</div>
                        <div className="text-blue-600 text-sm">Défis relevés</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center space-x-3">
                      <Flame size={24} className="text-purple-600" />
                      <div>
                        <div className="text-2xl font-bold text-purple-700">{studyStreak}</div>
                        <div className="text-purple-600 text-sm">Jours consécutifs</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar des achievements récents */}
              <div className="space-y-6">
                {/* Achievements récents */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <Medal size={20} className="text-yellow-500" />
                    <span>Derniers succès</span>
                  </h4>
                  
                  <div className="space-y-3">
                    {Array.from(achievements).slice(-3).map(achievementId => {
                      const achievement = possibleAchievements.find(a => a.id === achievementId);
                      if (!achievement) return null;
                      
                      return (
                        <div key={achievementId} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <span className="text-2xl">{achievement.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{achievement.name}</div>
                            <div className="text-sm text-gray-600">{achievement.description}</div>
                          </div>
                          <div className="text-yellow-600 font-bold">+{achievement.points}</div>
                        </div>
                      );
                    })}
                    
                    {achievements.size === 0 && (
                      <div className="text-center text-gray-500 py-4">
                        <Trophy size={32} className="mx-auto mb-2 text-gray-300" />
                        <p>Complétez des exercices pour débloquer des succès !</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Objectif quotidien */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <Target size={20} className="text-green-500" />
                    <span>Objectif quotidien</span>
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Temps d'étude</span>
                        <span>{Math.floor(currentSessionTime / 60)}/{studyGoal.daily} min</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((currentSessionTime / 60) / studyGoal.daily * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    
                    {currentSessionTime / 60 >= studyGoal.daily && (
                      <div className="text-green-600 text-sm font-medium flex items-center space-x-1">
                        <CheckCircle size={16} />
                        <span>Objectif atteint ! 🎉</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Analyse des compétences */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <BarChart3 size={24} style={{ color: primaryColor }} />
                <span>Analyse des compétences</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Compétences à améliorer */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                    <TrendingDown size={16} className="text-orange-500" />
                    <span>À améliorer</span>
                  </h4>
                  <div className="space-y-2">
                    {weakestSkills.length > 0 ? weakestSkills.map(([skill, level]) => (
                      <div key={skill} className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                          <Eye size={16} className="text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Compétence {skill.split('_')[1]}</div>
                          <div className="text-sm text-gray-600">{Math.round(level)}% maîtrisé</div>
                        </div>
                        <button
                          onClick={() => setActiveTab('exercises')}
                          className="text-orange-600 hover:text-orange-700 p-1"
                        >
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    )) : (
                      <div className="text-gray-500 text-center py-4">
                        Aucune donnée disponible
                      </div>
                    )}
                  </div>
                </div>

                {/* Points forts */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                    <TrendingUp size={16} className="text-green-500" />
                    <span>Points forts</span>
                  </h4>
                  <div className="space-y-2">
                    {strongestSkills.length > 0 ? strongestSkills.map(([skill, level]) => (
                      <div key={skill} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <Star size={16} className="text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Compétence {skill.split('_')[1]}</div>
                          <div className="text-sm text-gray-600">{Math.round(level)}% maîtrisé</div>
                        </div>
                        <div className="text-green-600">
                          <Trophy size={16} />
                        </div>
                      </div>
                    )) : (
                      <div className="text-gray-500 text-center py-4">
                        Complétez des exercices pour voir vos points forts
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Défis/Exercices - Version gamifiée */}
        {activeTab === 'exercises' && (
          <div className="space-y-6">
            {/* Sélecteur de catégorie avec filtres */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <Target size={24} style={{ color: primaryColor }} />
                  <span>Défis et Exercices</span>
                </h3>
                
                <div className="flex space-x-2">
                  {['all', 'fundamentals', 'practice', 'mastery'].map(category => (
                    <button
                      key={category}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        category === 'all' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {category === 'all' ? 'Tous' : 
                       category === 'fundamentals' ? 'Fondamentaux' :
                       category === 'practice' ? 'Pratique' : 'Maîtrise'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grille des exercices interactive */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {practicalExercises.map(exercise => {
                  const isLocked = exercise.prerequisites.some(prereq => !completedExercises.has(prereq));
                  const canStart = !isLocked && !exercise.completed;
                  const skillName = `skill_${exercise.id}`;
                  const isAnimating = skillAnimations[skillName];
                  
                  return (
                    <div
                      key={exercise.id}
                      className={`relative border-2 rounded-xl p-6 transition-all duration-300 transform hover:scale-105 ${
                        exercise.completed 
                          ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg' 
                          : isLocked
                            ? 'border-gray-200 bg-gray-50 opacity-60'
                            : 'border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 hover:border-blue-300 hover:shadow-lg cursor-pointer'
                      } ${isAnimating ? 'animate-pulse ring-4 ring-yellow-300' : ''}`}
                    >
                      {/* Badge de difficulté et points */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          exercise.category === 'fundamentals' ? 'bg-blue-100 text-blue-700' :
                          exercise.category === 'practice' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {exercise.category === 'fundamentals' ? 'Base' :
                           exercise.category === 'practice' ? 'Pratique' : 'Expert'}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {exercise.bonus && (
                            <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                              <Star size={12} className="text-white" />
                            </div>
                          )}
                          <div className="text-sm font-bold text-gray-600">
                            +{exercise.points} XP
                          </div>
                        </div>
                      </div>

                      {/* Icône et statut */}
                      <div className="text-center mb-4">
                        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl font-bold ${
                          exercise.completed 
                            ? 'bg-green-500 text-white' 
                            : isLocked
                              ? 'bg-gray-300 text-gray-500'
                              : 'bg-blue-500 text-white'
                        }`}>
                          {exercise.completed ? (
                            <CheckCircle size={24} />
                          ) : isLocked ? (
                            '🔒'
                          ) : (
                            exercise.id
                          )}
                        </div>
                      </div>

                      {/* Titre et description */}
                      <div className="text-center mb-4">
                        <h4 className="font-bold text-gray-900 mb-2 flex items-center justify-center space-x-2">
                          <span>{exercise.title}</span>
                          {exercise.bonus && <Zap size={16} className="text-yellow-500" />}
                        </h4>
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {exercise.description}
                        </p>
                      </div>

                      {/* Métadonnées */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span className="flex items-center space-x-1">
                          <Clock size={12} />
                          <span>~{exercise.estimatedTime} min</span>
                        </span>
                        <span className="capitalize">{exercise.difficulty}</span>
                      </div>

                      {/* Action button */}
                      <div className="text-center">
                        {exercise.completed ? (
                          <div className="flex items-center justify-center space-x-2 text-green-600 font-medium">
                            <CheckCircle size={16} />
                            <span>Terminé</span>
                          </div>
                        ) : isLocked ? (
                          <div className="text-gray-500 text-sm">
                            Terminez les exercices précédents
                          </div>
                        ) : (
                          <button
                            onClick={() => completeExercise(exercise.id)}
                            className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium flex items-center justify-center space-x-2 transform hover:scale-105 active:scale-95"
                          >
                            <PlayCircle size={16} />
                            <span>Commencer le défi</span>
                          </button>
                        )}
                      </div>

                      {/* Indicateur de session active */}
                      {sessionActive && canStart && (
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommandations personnalisées */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center space-x-2">
                <Lightbulb size={20} />
                <span>Recommandations IA</span>
              </h3>
              
              <div className="space-y-3">
                {completedExercises.size === 0 && (
                  <div className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-purple-200">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Target size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-purple-900">Commencez par les fondamentaux</div>
                      <div className="text-purple-700 text-sm">Les exercices de base vous donneront une solide foundation pour la suite.</div>
                    </div>
                  </div>
                )}
                
                {completedExercises.size > 0 && completedExercises.size < practicalExercises.length / 2 && (
                  <div className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-purple-200">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <TrendingUp size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-purple-900">Excellent rythme !</div>
                      <div className="text-purple-700 text-sm">Continuez sur cette lancée. Votre prochaine session pourrait inclure les exercices de pratique.</div>
                    </div>
                  </div>
                )}
                
                {completedExercises.size >= practicalExercises.length / 2 && completedExercises.size < practicalExercises.length && (
                  <div className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-purple-200">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Trophy size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-purple-900">Vous êtes sur la bonne voie vers l'expertise !</div>
                      <div className="text-purple-700 text-sm">Les derniers défis vous permettront d'atteindre la maîtrise totale.</div>
                    </div>
                  </div>
                )}
                
                {completedExercises.size === practicalExercises.length && (
                  <div className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-purple-200">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Medal size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-purple-900">Maîtrise complète atteinte ! 🎉</div>
                      <div className="text-purple-700 text-sm">Passez à l'évaluation finale pour obtenir votre certification.</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Onglet Progression - Visualisation avancée */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            {/* Graphique de progression dans le temps */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <BarChart3 size={24} style={{ color: primaryColor }} />
                <span>Évolution des compétences</span>
              </h3>
              
              <div className="space-y-6">
                {formation.learning_objectives?.map((objective, index) => {
                  const skillName = `skill_${index + 1}`;
                  const level = skillLevels[skillName] || 0;
                  const isCompleted = completedExercises.has(index + 1);
                  const skillGrade = skillGrades.find(g => level >= g.min && level < g.max) || skillGrades[0];
                  
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                            isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {skillGrade.icon}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Compétence {index + 1}</div>
                            <div className="text-sm text-gray-600 line-clamp-1">{objective}</div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold" style={{ color: skillGrade.color }}>
                            {Math.round(level)}%
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {skillGrade.name}
                          </div>
                        </div>
                      </div>
                      
                      {/* Barre de progression avec segments */}
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-3 rounded-full transition-all duration-1000 ease-out relative"
                            style={{ 
                              width: `${level}%`,
                              backgroundColor: skillGrade.color
                            }}
                          >
                            {/* Effet de brillance */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                          </div>
                        </div>
                        
                        {/* Marqueurs de niveaux */}
                        <div className="absolute inset-0 flex justify-between items-center px-1">
                          {skillGrades.slice(0, -1).map((grade, idx) => (
                            <div
                              key={idx}
                              className="w-1 h-3 bg-white border border-gray-300 rounded-full"
                              style={{ marginLeft: `${grade.max}%` }}
                              title={`${grade.max}% - ${grade.name}`}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {/* Actions rapides */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          {isCompleted && (
                            <span className="flex items-center space-x-1 text-green-600">
                              <CheckCircle size={12} />
                              <span>Exercice terminé</span>
                            </span>
                          )}
                          {!isCompleted && (
                            <span>En attente</span>
                          )}
                        </div>
                        
                        <button
                          onClick={() => {
                            setSelectedSkillDetail(index + 1);
                            // Scroll vers les détails ou modal
                          }}
                          className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center space-x-1"
                        >
                          <Eye size={12} />
                          <span>Détails</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Statistiques détaillées */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Temps d'apprentissage */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Clock size={20} className="text-blue-500" />
                  <span>Temps d'apprentissage</span>
                </h4>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700">Temps total</span>
                    <span className="font-bold text-blue-600">{formatTime(totalStudyTime)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700">Session actuelle</span>
                    <span className="font-bold text-green-600">{formatTime(currentSessionTime)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-gray-700">Temps moyen/exercice</span>
                    <span className="font-bold text-purple-600">
                      {completedExercises.size > 0 ? formatTime(Math.floor(totalStudyTime / completedExercises.size)) : '0m 0s'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Points et récompenses */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Trophy size={20} className="text-yellow-500" />
                  <span>Points et récompenses</span>
                </h4>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="text-gray-700">Points XP totaux</span>
                    <span className="font-bold text-yellow-600">{totalPoints}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-gray-700">Série de jours</span>
                    <span className="font-bold text-orange-600">{studyStreak} jours</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-gray-700">Badges débloqués</span>
                    <span className="font-bold text-red-600">{achievements.size}/{possibleAchievements.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Contenu */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Objectifs pédagogiques interactifs */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <BookOpen size={24} style={{ color: primaryColor }} />
                <span>Objectifs d'apprentissage</span>
              </h3>
              
              <div className="space-y-4">
                {formation.learning_objectives?.map((objective, index) => {
                  const isCompleted = completedExercises.has(index + 1);
                  const skillLevel = skillLevels[`skill_${index + 1}`] || 0;
                  
                  return (
                    <div key={index} className={`border-2 rounded-lg p-4 transition-all ${
                      isCompleted ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex items-start space-x-4">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                            style={{ backgroundColor: isCompleted ? '#10b981' : primaryColor }}
                          >
                            {isCompleted ? <CheckCircle size={16} /> : index + 1}
                          </div>
                          {isCompleted && <Star size={16} className="text-yellow-500" />}
                        </div>
                        
                        <div className="flex-1">
                          <p className="text-gray-700 mb-2">{objective}</p>
                          
                          {/* Mini barre de progression */}
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${skillLevel}%`,
                                  backgroundColor: isCompleted ? '#10b981' : primaryColor
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-600">
                              {Math.round(skillLevel)}%
                            </span>
                          </div>
                        </div>
                        
                        {!isCompleted && (
                          <button
                            onClick={() => setActiveTab('exercises')}
                            className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Aller aux exercices"
                          >
                            <ArrowRight size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
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

            {/* Ressources complémentaires avec prévisualisation */}
            {formation.resources && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Ressources complémentaires
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Vidéos */}
                  {formation.resources.videos && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                        <PlayCircle size={16} className="text-purple-500" />
                        <span>Vidéos</span>
                      </h4>
                      <div className="space-y-3">
                        {formation.resources.videos.map((video, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <VideoPlayer
                              src={`/assets/videos/${video.file}`}
                              title={video.title}
                              primaryColor={primaryColor}
                              showControls={true}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Liens et documents */}
                  <div className="space-y-6">
                    {formation.resources.documents && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                          <BookOpen size={16} className="text-blue-500" />
                          <span>Documents</span>
                        </h4>
                        <div className="space-y-2">
                          {formation.resources.documents.map((doc, index) => (
                            <a
                              key={index}
                              href={`/assets/documents/${doc.file}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                <BookOpen size={16} className="text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {doc.title}
                                </div>
                                <div className="text-sm text-gray-500">PDF</div>
                              </div>
                              <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {formation.resources.links && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                          <Activity size={16} className="text-green-500" />
                          <span>Liens utiles</span>
                        </h4>
                        <div className="space-y-2">
                          {formation.resources.links.map((link, index) => (
                            <a
                              key={index}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                <Activity size={16} className="text-green-600" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                                  {link.title}
                                </div>
                                {link.description && (
                                  <div className="text-sm text-gray-500">{link.description}</div>
                                )}
                              </div>
                              <ArrowRight size={16} className="text-gray-400 group-hover:text-green-600 transition-colors" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Onglet Succès/Achievements */}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            {/* Galerie des achievements */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Trophy size={24} className="text-yellow-500" />
                <span>Galerie des succès</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {possibleAchievements.map(achievement => {
                  const isUnlocked = achievements.has(achievement.id);
                  
                  return (
                    <div
                      key={achievement.id}
                      className={`border-2 rounded-xl p-6 text-center transition-all transform hover:scale-105 ${
                        isUnlocked
                          ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg'
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="text-4xl mb-3">
                        {isUnlocked ? achievement.icon : '🔒'}
                      </div>
                      
                      <h4 className={`font-bold mb-2 ${
                        isUnlocked ? 'text-yellow-800' : 'text-gray-500'
                      }`}>
                        {achievement.name}
                      </h4>
                      
                      <p className={`text-sm mb-3 ${
                        isUnlocked ? 'text-yellow-700' : 'text-gray-500'
                      }`}>
                        {achievement.description}
                      </p>
                      
                      <div className={`text-xs font-bold ${
                        isUnlocked ? 'text-yellow-600' : 'text-gray-400'
                      }`}>
                        +{achievement.points} XP
                      </div>
                      
                      {isUnlocked && (
                        <div className="mt-3 text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full inline-block">
                          Débloqué !
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Statistiques des achievements */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {achievements.size} / {possibleAchievements.length}
                  </div>
                  <div className="text-gray-600 mb-2">Succès débloqués</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(achievements.size / possibleAchievements.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Défis spéciaux et objectifs à long terme */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center space-x-2">
                <Medal size={20} />
                <span>Défis spéciaux</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-indigo-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Flame size={20} className="text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-indigo-900">Série parfaite</h4>
                      <p className="text-sm text-indigo-700">14 jours consécutifs</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-indigo-600 font-bold">+200 XP</div>
                    <div className="text-xs text-indigo-500">Défi en cours</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-indigo-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Brain size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-purple-900">Maître expert</h4>
                      <p className="text-sm text-purple-700">100% sur tous les modules</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-purple-600 font-bold">+500 XP</div>
                    <div className="text-xs text-purple-500">Ultime défi</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Évaluation */}
        {activeTab === 'evaluation' && (
          <div className="space-y-6">
            {/* Prérequis pour l'évaluation avec progression visuelle */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-amber-800 mb-6 flex items-center space-x-2">
                <Award size={24} />
                <span>Conditions d'accès à l'évaluation</span>
              </h3>
              
              <div className="space-y-4">
                {/* Condition 1: Exercices complétés */}
                <div className="bg-white rounded-lg p-4 border border-amber-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        completedExercises.size >= practicalExercises.length * 0.8 
                          ? 'bg-green-500 text-white' 
                          : 'bg-amber-100 text-amber-600'
                      }`}>
                        {completedExercises.size >= practicalExercises.length * 0.8 ? 
                          <CheckCircle size={16} /> : <Target size={16} />}
                      </div>
                      <div>
                        <div className="font-medium text-amber-900">Compléter 80% des exercices</div>
                        <div className="text-sm text-amber-700">
                          {completedExercises.size} / {Math.ceil(practicalExercises.length * 0.8)} requis
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-amber-800">
                        {Math.round((completedExercises.size / (practicalExercises.length * 0.8)) * 100)}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-amber-200 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((completedExercises.size / (practicalExercises.length * 0.8)) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Condition 2: Niveau de maîtrise */}
                <div className="bg-white rounded-lg p-4 border border-amber-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        overallMastery >= 70 
                          ? 'bg-green-500 text-white' 
                          : 'bg-amber-100 text-amber-600'
                      }`}>
                        {overallMastery >= 70 ? 
                          <CheckCircle size={16} /> : <BarChart3 size={16} />}
                      </div>
                      <div>
                        <div className="font-medium text-amber-900">Atteindre 70% de maîtrise globale</div>
                        <div className="text-sm text-amber-700">
                          Progression actuelle: {Math.round(overallMastery)}%
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-amber-800">
                        {Math.round(overallMastery)}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-amber-200 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((overallMastery / 70) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Condition 3: Temps d'étude minimum */}
                <div className="bg-white rounded-lg p-4 border border-amber-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        totalStudyTime >= 1800 // 30 minutes minimum
                          ? 'bg-green-500 text-white' 
                          : 'bg-amber-100 text-amber-600'
                      }`}>
                        {totalStudyTime >= 1800 ? 
                          <CheckCircle size={16} /> : <Clock size={16} />}
                      </div>
                      <div>
                        <div className="font-medium text-amber-900">Temps d'étude minimum (30 min)</div>
                        <div className="text-sm text-amber-700">
                          Temps actuel: {formatTime(totalStudyTime)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-amber-800">
                        {Math.round((totalStudyTime / 1800) * 100)}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-amber-200 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((totalStudyTime / 1800) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Statut global */}
              <div className="mt-6 p-4 bg-white rounded-lg border border-amber-200 text-center">
                {(completedExercises.size >= practicalExercises.length * 0.8 && 
                  overallMastery >= 70 && 
                  totalStudyTime >= 1800) ? (
                  <div className="text-green-600">
                    <CheckCircle size={32} className="mx-auto mb-2" />
                    <div className="font-bold text-lg">Prêt pour l'évaluation !</div>
                    <div className="text-sm">Toutes les conditions sont remplies</div>
                  </div>
                ) : (
                  <div className="text-amber-600">
                    <Clock size={32} className="mx-auto mb-2" />
                    <div className="font-bold text-lg">En préparation</div>
                    <div className="text-sm">Continuez vos exercices pour débloquer l'évaluation</div>
                  </div>
                )}
              </div>
            </div>

            {/* Section d'évaluation */}
            {(completedExercises.size >= practicalExercises.length * 0.8 && 
              overallMastery >= 70 && 
              totalStudyTime >= 1800) ? (
              formation.assessment ? (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
                    <h3 className="text-xl font-bold flex items-center space-x-2">
                      <Award size={24} />
                      <span>Évaluation finale</span>
                    </h3>
                    <p className="text-blue-100 mt-1">
                      Validez vos compétences acquises
                    </p>
                  </div>
                  
                  <div className="p-6">
                    <QuizSection
                      assessment={formation.assessment}
                      primaryColor={primaryColor}
                      passingGrade={formation.assessment.passing_grade || 80}
                      onComplete={(results) => {
                        console.log('Évaluation terminée:', results);
                        if (results.passed) {
                          // Débloquer achievement de réussite
                          setAchievements(prev => new Set([...prev, 'evaluation_passed']));
                          triggerCelebration();
                        }
                        if (onModuleComplete) {
                          onModuleComplete('evaluation', results);
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                  <Trophy size={64} className="mx-auto text-green-500 mb-4" />
                  <h3 className="text-2xl font-bold text-green-800 mb-2">
                    Formation terminée avec succès ! 🎉
                  </h3>
                  <p className="text-green-700 mb-6">
                    Vous avez complété tous les exercices et atteint le niveau de maîtrise requis.
                  </p>
                  
                  {/* Certificat virtuel */}
                  <div className="bg-white rounded-lg p-6 inline-block shadow-lg border-2 border-green-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-2">{formation.company}</div>
                      <div className="text-lg text-gray-600 mb-4">Certificat de compétence</div>
                      <div className="text-xl font-bold text-green-600 mb-2">{formation.title}</div>
                      <div className="text-sm text-gray-500 mb-4">
                        Score final: {Math.round(overallMastery)}% • {completedExercises.size} exercices réussis
                      </div>
                      <div className="text-xs text-gray-400">
                        Délivré le {new Date().toLocaleDateString('fr-FR')}
                      </div>
                      <div className="mt-4 flex justify-center space-x-4 text-2xl">
                        {Array.from(achievements).slice(0, 3).map(achievementId => {
                          const achievement = possibleAchievements.find(a => a.id === achievementId);
                          return achievement ? <span key={achievementId}>{achievement.icon}</span> : null;
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      onClick={() => {
                        // Exporter le certificat ou partager
                        console.log('Partage du certificat');
                      }}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Partager votre réussite
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                <Target size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Évaluation verrouillée
                </h3>
                <p className="text-gray-600 mb-6">
                  Complétez les prérequis ci-dessus pour débloquer l'évaluation finale.
                </p>
                
                {/* Suggestions d'actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  {completedExercises.size < practicalExercises.length * 0.8 && (
                    <button
                      onClick={() => setActiveTab('exercises')}
                      className="flex items-center space-x-2 p-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Target size={16} />
                      <span>Faire des exercices</span>
                    </button>
                  )}
                  
                  {overallMastery < 70 && (
                    <button
                      onClick={() => setActiveTab('progress')}
                      className="flex items-center space-x-2 p-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <BarChart3 size={16} />
                      <span>Voir progression</span>
                    </button>
                  )}
                  
                  {totalStudyTime < 1800 && (
                    <button
                      onClick={() => {
                        setActiveTab('content');
                        toggleStudySession();
                      }}
                      className="flex items-center space-x-2 p-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                      <Clock size={16} />
                      <span>Étudier plus</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sidebar flottante avec ProgressTracker */}
      <div className="hidden xl:block fixed right-6 top-1/2 transform -translate-y-1/2 w-80 z-40">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <ProgressTracker
            modules={formation.modules}
            currentModule={currentModule}
            primaryColor={primaryColor}
          />
        </div>
      </div>

      {/* Toast notifications pour les achievements */}
      {Array.from(achievements).length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 space-y-2">
          {/* Afficher les derniers achievements */}
          {Array.from(achievements).slice(-1).map(achievementId => {
            const achievement = possibleAchievements.find(a => a.id === achievementId);
            if (!achievement) return null;
            
            return (
              <div key={achievementId} className="bg-yellow-500 text-white p-4 rounded-lg shadow-lg animate-slide-in-right">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <div className="font-bold">Nouveau succès !</div>
                    <div className="text-sm">{achievement.name}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Styles CSS personnalisés */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Glow effect pour les éléments actifs */
        .glow {
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
        }
        
        /* Animation de pulsation pour les éléments importants */
        .pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        /* Gradient text effet */
        .gradient-text {
          background: linear-gradient(45deg, #10b981, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  );
};

export default SkillsTemplate;