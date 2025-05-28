import React, { useState } from 'react';
import { Settings, Shield, Wrench, AlertTriangle, CheckSquare, ExternalLink, Download, Camera } from 'lucide-react';
import ModuleCard from '../components/ModuleCard';
import VideoPlayer from '../components/VideoPlayer';
import QuizSection from '../components/QuizSection';

const EquipmentTemplate = ({ formation, currentModule, onModuleComplete }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [checkedItems, setCheckedItems] = useState(new Set());

  const primaryColor = formation.primary_color || '#1e40af';
  const accentColor = formation.accent_color || '#f59e0b';

  // Obtenir le module actuel
  const getCurrentModule = () => {
    return formation.modules?.find(m => m.id === currentModule) || formation.modules?.[0];
  };

  // Gérer la checklist de maintenance
  const toggleChecklistItem = (itemId) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Checklist de sécurité basée sur les données de la formation
  const safetyChecklist = [
    { id: 1, text: "Vérification de l'arrêt d'urgence", critical: true },
    { id: 2, text: "Inspection visuelle de l'équipement", critical: true },
    { id: 3, text: "Contrôle des systèmes de sécurité", critical: true },
    { id: 4, text: "Vérification de la zone de travail", critical: false },
    { id: 5, text: "Test des fonctions de base", critical: false },
    { id: 6, text: "Validation des paramètres", critical: false }
  ];

  const module = getCurrentModule();

  return (
    <div className="max-w-6xl mx-auto">
      {/* En-tête spécialisé équipement */}
      <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <Settings size={32} />
                <div>
                  <h1 className="text-2xl font-bold">{formation.equipment?.name}</h1>
                  <p className="text-blue-100">
                    {formation.equipment?.manufacturer} • {formation.equipment?.model}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {formation.equipment?.specs && Object.entries(formation.equipment.specs).map(([key, value]) => (
                  <div key={key} className="bg-white/10 rounded-lg p-3">
                    <div className="font-medium capitalize">{key.replace('_', ' ')}</div>
                    <div className="text-blue-100">{value}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {formation.equipment?.image && (
              <div className="ml-6 flex-shrink-0">
                <img
                  src={formation.equipment.image}
                  alt={formation.equipment.name}
                  className="w-48 h-32 object-cover rounded-lg shadow-lg"
                />
              </div>
            )}
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: Settings },
              { id: 'safety', label: 'Sécurité', icon: Shield },
              { id: 'maintenance', label: 'Maintenance', icon: Wrench },
              { id: 'evaluation', label: 'Évaluation', icon: CheckSquare }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
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
        {/* Onglet Vue d'ensemble */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Objectifs pédagogiques */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <CheckSquare size={20} style={{ color: primaryColor }} />
                <span>Objectifs de la formation</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {formation.learning_objectives?.map((objective, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {index + 1}
                    </div>
                    <span className="text-gray-700">{objective}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prérequis */}
            {formation.prerequisites && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <AlertTriangle size={20} className="text-amber-500" />
                  <span>Prérequis</span>
                </h3>
                
                <ul className="space-y-2">
                  {formation.prerequisites.map((prereq, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span className="text-gray-700">{prereq}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Contenu du module actuel */}
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

        {/* Onglet Sécurité */}
        {activeTab === 'safety' && (
          <div className="space-y-6">
            {/* Checklist de sécurité interactive */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Shield size={20} className="text-red-500" />
                <span>Checklist de sécurité</span>
              </h3>
              
              <div className="space-y-3">
                {safetyChecklist.map(item => (
                  <label
                    key={item.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      checkedItems.has(item.id) ? 'bg-green-50 border border-green-200' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checkedItems.has(item.id)}
                      onChange={() => toggleChecklistItem(item.id)}
                      className="sr-only"
                    />
                    
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      checkedItems.has(item.id) 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-300'
                    }`}>
                      {checkedItems.has(item.id) && (
                        <CheckSquare size={12} className="text-white" />
                      )}
                    </div>
                    
                    <span className={`flex-1 ${item.critical ? 'font-medium' : ''}`}>
                      {item.text}
                      {item.critical && (
                        <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                          Critique
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-800">
                  <AlertTriangle size={16} />
                  <span className="font-medium">
                    Progression: {checkedItems.size}/{safetyChecklist.length} éléments vérifiés
                  </span>
                </div>
                
                {checkedItems.size === safetyChecklist.length && (
                  <div className="mt-2 text-green-700 font-medium">
                    ✅ Tous les contrôles de sécurité sont terminés
                  </div>
                )}
              </div>
            </div>

            {/* Procédures d'urgence */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center space-x-2">
                <AlertTriangle size={20} />
                <span>Procédures d'urgence</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">En cas d'urgence</h4>
                  <ol className="text-sm text-red-700 space-y-1">
                    <li>1. Appuyer sur l'arrêt d'urgence</li>
                    <li>2. Sécuriser la zone</li>
                    <li>3. Alerter les responsables</li>
                    <li>4. Prodiguer les premiers secours si nécessaire</li>
                  </ol>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">Contacts d'urgence</h4>
                  <div className="text-sm text-red-700 space-y-1">
                    <div>Sécurité: ext. 911</div>
                    <div>Maintenance: ext. 2350</div>
                    <div>Responsable: {formation.instructor}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vidéos de sécurité */}
            {formation.resources?.videos?.filter(v => v.title.toLowerCase().includes('sécurité')).map((video, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {video.title}
                </h3>
                <VideoPlayer
                  src={`/assets/videos/${video.file}`}
                  title={video.title}
                  primaryColor={primaryColor}
                />
              </div>
            ))}
          </div>
        )}

        {/* Onglet Maintenance */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            {/* Planning de maintenance */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Wrench size={20} style={{ color: primaryColor }} />
                <span>Planning de maintenance</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">Quotidienne (5 min)</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Inspection visuelle</li>
                    <li>• Nettoyage de surface</li>
                    <li>• Vérification des alertes</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">Hebdomadaire (15 min)</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Calibrage des axes</li>
                    <li>• Test des sécurités</li>
                    <li>• Sauvegarde programmes</li>
                  </ul>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-medium text-orange-800 mb-2">Mensuelle (1h)</h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Maintenance préventive</li>
                    <li>• Mise à jour logicielle</li>
                    <li>• Rapport d'état</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Diagnostics et dépannage */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Guide de dépannage
              </h3>
              
              <div className="space-y-4">
                {[
                  {
                    problem: "Robot ne répond plus",
                    solutions: ["Vérifier l'alimentation", "Contrôler les connexions", "Redémarrage système"]
                  },
                  {
                    problem: "Perte de précision",
                    solutions: ["Recalibrage des axes", "Vérifier les fixations", "Contrôler l'usure"]
                  },
                  {
                    problem: "Arrêt d'urgence activé",
                    solutions: ["Identifier la cause", "Réinitialiser le système", "Tester les fonctions"]
                  }
                ].map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                      <AlertTriangle size={16} className="text-amber-500" />
                      <span>{item.problem}</span>
                    </h4>
                    <ol className="text-sm text-gray-700 space-y-1 ml-6">
                      {item.solutions.map((solution, idx) => (
                        <li key={idx}>{idx + 1}. {solution}</li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents de maintenance */}
            {formation.resources?.documents && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Documentation technique
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {formation.resources.documents.map((doc, index) => (
                    <a
                      key={index}
                      href={`/assets/documents/${doc.file}`}
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download size={16} className="text-blue-600" />
                      <span className="flex-1 text-gray-900">{doc.title}</span>
                      <ExternalLink size={14} className="text-gray-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Onglet Évaluation */}
        {activeTab === 'evaluation' && formation.assessment && (
          <div className="space-y-6">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentTemplate;