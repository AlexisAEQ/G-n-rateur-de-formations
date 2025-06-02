import React, { useState, useEffect } from 'react';
import { Target, CheckCircle, Clock, Zap, Lightbulb, Play, Trophy, Star, ArrowRight, RefreshCw } from 'lucide-react';

const ChallengeBlock = ({ challenge, onComplete, primaryColor = '#10b981' }) => {
  const [progress, setProgress] = useState({
    criteria: challenge.criteria?.map(c => ({ ...c, completed: false })) || [],
    steps: challenge.steps?.map(s => ({ ...s, completed: false })) || [],
    started: false,
    completed: false,
    showHint: false,
    timeStarted: null
  });

  const [timeElapsed, setTimeElapsed] = useState(0);

  // Timer pour le défi
  useEffect(() => {
    let interval;
    if (progress.started && !progress.completed) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - progress.timeStarted) / 1000);
        setTimeElapsed(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [progress.started, progress.completed, progress.timeStarted]);

  // Calculer la progression
  const completedCriteria = progress.criteria.filter(c => c.completed).length;
  const totalCriteria = progress.criteria.length;
  const progressPercentage = totalCriteria > 0 ? (completedCriteria / totalCriteria) * 100 : 0;

  const startChallenge = () => {
    setProgress(prev => ({
      ...prev,
      started: true,
      timeStarted: Date.now()
    }));
  };

  const toggleCriterion = (criterionId) => {
    setProgress(prev => ({
      ...prev,
      criteria: prev.criteria.map(c => 
        c.id === criterionId ? { ...c, completed: !c.completed } : c
      )
    }));
  };

  const toggleStep = (stepId) => {
    setProgress(prev => ({
      ...prev,
      steps: prev.steps.map(s => 
        s.id === stepId ? { ...s, completed: !s.completed } : s
      )
    }));
  };

  const completeChallenge = () => {
    if (progressPercentage === 100) {
      setProgress(prev => ({ ...prev, completed: true }));
      onComplete && onComplete({
        challengeId: challenge.id,
        xpEarned: challenge.xp,
        timeElapsed,
        criteria: progress.criteria,
        steps: progress.steps
      });
    }
  };

  const resetChallenge = () => {
    setProgress({
      criteria: challenge.criteria?.map(c => ({ ...c, completed: false })) || [],
      steps: challenge.steps?.map(s => ({ ...s, completed: false })) || [],
      started: false,
      completed: false,
      showHint: false,
      timeStarted: null
    });
    setTimeElapsed(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Facile': 'from-green-400 to-emerald-500',
      'Moyen': 'from-yellow-400 to-orange-500',
      'Difficile': 'from-red-400 to-pink-500',
      'Expert': 'from-purple-400 to-indigo-500'
    };
    return colors[difficulty] || colors.Moyen;
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
      {/* En-tête du défi */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className={`w-16 h-16 bg-gradient-to-r ${getDifficultyColor(challenge.difficulty)} rounded-2xl flex items-center justify-center shadow-lg`}>
            <Target size={28} className="text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{challenge.title}</h3>
            <div className="flex items-center space-x-4 text-sm">
              <span className={`px-3 py-1 bg-gradient-to-r ${getDifficultyColor(challenge.difficulty)} text-white rounded-full font-medium`}>
                {challenge.difficulty}
              </span>
              <span className="flex items-center space-x-1 text-gray-600">
                <Zap size={14} />
                <span>+{challenge.xp} XP</span>
              </span>
              <span className="flex items-center space-x-1 text-gray-600">
                <Clock size={14} />
                <span>~{challenge.estimatedTime}min</span>
              </span>
            </div>
          </div>
        </div>

        {/* Statut et actions */}
        <div className="flex flex-col items-end space-y-2">
          {progress.started && !progress.completed && (
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">{formatTime(timeElapsed)}</div>
              <div className="text-xs text-gray-500">Temps écoulé</div>
            </div>
          )}
          
          {progress.completed && (
            <div className="flex items-center space-x-2 text-green-600">
              <Trophy size={20} />
              <span className="font-medium">Terminé !</span>
            </div>
          )}
        </div>
      </div>

      {/* Mission description */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6">
        <h4 className="font-semibold text-blue-800 mb-2">🎯 Mission</h4>
        <p className="text-blue-700">{challenge.mission}</p>
      </div>

      {/* Progression visuelle */}
      {progress.started && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progression</span>
            <span className="text-sm text-gray-500">{completedCriteria}/{totalCriteria}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Étapes (si disponibles) */}
      {challenge.steps && challenge.steps.length > 0 && progress.started && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
            <ArrowRight size={16} />
            <span>Étapes à suivre</span>
          </h4>
          <div className="space-y-2">
            {progress.steps.map((step) => (
              <label
                key={step.id}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                  step.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={step.completed}
                  onChange={() => toggleStep(step.id)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  step.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                }`}>
                  {step.completed && <CheckCircle size={12} className="text-white" />}
                </div>
                <span className={`flex-1 ${step.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                  {step.text}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Critères de réussite */}
      {challenge.criteria && challenge.criteria.length > 0 && progress.started && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
            <CheckCircle size={16} />
            <span>Critères de réussite</span>
          </h4>
          <div className="space-y-2">
            {progress.criteria.map((criterion) => (
              <label
                key={criterion.id}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                  criterion.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={criterion.completed}
                  onChange={() => toggleCriterion(criterion.id)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  criterion.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                }`}>
                  {criterion.completed && <CheckCircle size={12} className="text-white" />}
                </div>
                <span className={`flex-1 ${criterion.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                  {criterion.text}
                  {criterion.required && (
                    <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                      Obligatoire
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Indice */}
      {challenge.hint && progress.started && (
        <div className="mb-6">
          <button
            onClick={() => setProgress(prev => ({ ...prev, showHint: !prev.showHint }))}
            className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 font-medium mb-2"
          >
            <Lightbulb size={16} />
            <span>{progress.showHint ? 'Masquer l\'indice' : 'Afficher un indice'}</span>
          </button>
          
          {progress.showHint && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800">{challenge.hint}</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-3">
          {!progress.started ? (
            <button
              onClick={startChallenge}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-400 hover:to-indigo-500 transition-all duration-300 font-medium shadow-lg"
            >
              <Play size={20} />
              <span>Commencer le défi</span>
            </button>
          ) : progress.completed ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-green-600 font-medium">
                <Trophy size={20} />
                <span>Défi réussi ! +{challenge.xp} XP</span>
              </div>
              <button
                onClick={resetChallenge}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                <RefreshCw size={16} />
                <span>Refaire</span>
              </button>
            </div>
          ) : (
            <button
              onClick={completeChallenge}
              disabled={progressPercentage < 100}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                progressPercentage === 100
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-400 hover:to-emerald-500 shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Trophy size={20} />
              <span>Valider le défi</span>
            </button>
          )}
        </div>

        {/* Validation automatique */}
        {challenge.validation && progress.started && (
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">Validation automatique</div>
            <div className="text-sm text-gray-700 font-medium">{challenge.validation}</div>
          </div>
        )}
      </div>

      {/* Animation de réussite */}
      {progress.completed && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="animate-bounce">
            <div className="text-6xl">🎉</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeBlock;