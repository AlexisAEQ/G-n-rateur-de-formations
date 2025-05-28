import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Phone, FileText, Users, Clock, Award } from 'lucide-react';
import ModuleCard from '../components/ModuleCard';
import QuizSection from '../components/QuizSection';

const SafetyTemplate = ({ formation, currentModule, onModuleComplete }) => {
  const [activeTab, setActiveTab] = useState('procedures');
  const [acknowledgedRisks, setAcknowledgedRisks] = useState(new Set());
  const [completedChecklist, setCompletedChecklist] = useState(new Set());
  const [emergencyContacts, setEmergencyContacts] = useState([]);

  const primaryColor = formation.primary_color || '#dc2626';
  const accentColor = formation.accent_color || '#f59e0b';

  // Risques de sécurité identifiés
  const safetyRisks = [
    {
      id: 1,
      level: 'critique',
      category: 'Électrique',
      description: 'Risque d\'électrocution lors de la maintenance',
      prevention: 'Toujours couper l\'alimentation avant intervention',
      consequences: 'Blessures graves, décès'
    },
    {
      id: 2,
      level: 'élevé',
      category: 'Mécanique',
      description: 'Écrasement par pièces mobiles',
      prevention: 'Utiliser les dispositifs de verrouillage',
      consequences: 'Fractures, blessures graves'
    },
    {
      id: 3,
      level: 'modéré',
      category: 'Chimique',
      description: 'Exposition aux vapeurs de solvants',
      prevention: 'Port d\'équipements de protection respiratoire',
      consequences: 'Irritations, troubles respiratoires'
    },
    {
      id: 4,
      level: 'modéré',
      category: 'Ergonomique',
      description: 'Troubles musculosquelettiques',
      prevention: 'Respecter les postures de travail',
      consequences: 'Douleurs, TMS'
    }
  ];

  // Checklist de sécurité obligatoire
  const safetyChecklist = [
    { id: 1, text: "J'ai lu et compris toutes les consignes de sécurité", mandatory: true },
    { id: 2, text: "Je connais l'emplacement des équipements d'urgence", mandatory: true },
    { id: 3, text: "Je sais comment réagir en cas d'accident", mandatory: true },
    { id: 4, text: "J'ai vérifié que mon équipement de protection est en bon état", mandatory: true },
    { id: 5, text: "Je connais les numéros d'urgence", mandatory: true },
    { id: 6, text: "J'ai signalé tout danger potentiel observé", mandatory: false }
  ];

  // Contacts d'urgence
  useEffect(() => {
    setEmergencyContacts([
      { name: 'Sécurité interne', number: 'ext. 911', type: 'urgence' },
      { name: 'Infirmerie', number: 'ext. 1234', type: 'médical' },
      { name: 'Maintenance', number: 'ext. 2350', type: 'technique' },
      { name: 'Responsable sécurité', number: formation.instructor, type: 'responsable' },
      { name: 'Pompiers', number: '18', type: 'externe' },
      { name: 'SAMU', number: '15', type: 'externe' }
    ]);
  }, [formation.instructor]);

  // Charger les données sauvegardées
  useEffect(() => {
    const savedData = localStorage.getItem('safety-progress');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setAcknowledgedRisks(new Set(data.acknowledgedRisks || []));
        setCompletedChecklist(new Set(data.completedChecklist || []));
      } catch (error) {
        console.error('Erreur lors du chargement des données de sécurité:', error);
      }
    }
  }, []);

  // Sauvegarder les données
  useEffect(() => {
    const data = {
      acknowledgedRisks: Array.from(acknowledgedRisks),
      completedChecklist: Array.from(completedChecklist),
      lastUpdate: new Date().toISOString()
    };
    localStorage.setItem('safety-progress', JSON.stringify(data));
  }, [acknowledgedRisks, completedChecklist]);

  // Reconnaître un risque
  const acknowledgeRisk = (riskId) => {
    setAcknowledgedRisks(prev => new Set([...prev, riskId]));
  };

  // Compléter un élément de checklist
  const toggleChecklistItem = (itemId) => {
    setCompletedChecklist(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Vérifier si toutes les conditions sont remplies pour l'évaluation
  const canTakeAssessment = () => {
    const mandatoryItems = safetyChecklist.filter(item => item.mandatory);
    const completedMandatory = mandatoryItems.filter(item => completedChecklist.has(item.id));
    const acknowledgedCriticalRisks = safetyRisks.filter(risk => 
      risk.level === 'critique' && acknowledgedRisks.has(risk.id)
    );
    
    return completedMandatory.length === mandatoryItems.length && 
           acknowledgedCriticalRisks.length === safetyRisks.filter(r => r.level === 'critique').length;
  };

  // Obtenir le module actuel
  const getCurrentModule = () => {
    return formation.modules?.find(m => m.id === currentModule) || formation.modules?.[0];
  };

  const module = getCurrentModule();

  return (
    <div className="max-w-6xl mx-auto">
      {/* En-tête critique sécurité */}
      <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <Shield size={32} />
                <div>
                  <h1 className="text-2xl font-bold">{formation.title}</h1>
                  <p className="text-red-100">Formation sécurité obligatoire</p>
                </div>
              </div>
              
              <div className="bg-red-800/30 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle size={16} />
                  <span className="font-medium">ATTENTION</span>
                </div>
                <p className="text-sm text-red-100">
                  Cette formation est obligatoire et doit être complétée avec succès avant 
                  toute intervention sur l'équipement. Un certificat de réussite sera délivré.
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="font-medium">Risques identifiés</div>
                  <div className="text-red-100">{safetyRisks.length}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="font-medium">Note requise</div>
                  <div className="text-red-100">{formation.assessment?.passing_grade || 100}%</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="font-medium">Validité</div>
                  <div className="text-red-100">12 mois</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="font-medium">Durée</div>
                  <div className="text-red-100">{formation.duration}min</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'procedures', label: 'Procédures', icon: FileText },
              { id: 'risks', label: 'Analyse des risques', icon: AlertTriangle },
              { id: 'emergency', label: 'Urgences', icon: Phone },
              { id: 'certification', label: 'Certification', icon: Award }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
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
        {/* Onglet Procédures */}
        {activeTab === 'procedures' && (
          <div className="space-y-6">
            {/* Checklist de sécurité obligatoire */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <CheckCircle size={20} style={{ color: primaryColor }} />
                <span>Checklist de sécurité obligatoire</span>
              </h3>
              
              <div className="space-y-3">
                {safetyChecklist.map(item => (
                  <label
                    key={item.id}
                    className={`flex items-center space-x-3 p-4 rounded-lg cursor-pointer transition-colors ${
                      completedChecklist.has(item.id) 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={completedChecklist.has(item.id)}
                      onChange={() => toggleChecklistItem(item.id)}
                      className="sr-only"
                    />
                    
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      completedChecklist.has(item.id) 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-gray-300'
                    }`}>
                      {completedChecklist.has(item.id) && (
                        <CheckCircle size={12} />
                      )}
                    </div>
                    
                    <span className={`flex-1 ${item.mandatory ? 'font-medium' : ''}`}>
                      {item.text}
                      {item.mandatory && (
                        <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                          Obligatoire
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-800">
                  <Users size={16} />
                  <span className="font-medium">
                    Progression: {completedChecklist.size}/{safetyChecklist.length} éléments complétés
                  </span>
                </div>
                
                {canTakeAssessment() && (
                  <div className="mt-2 text-green-700 font-medium">
                    ✅ Vous pouvez maintenant passer la certification
                  </div>
                )}
              </div>
            </div>

            {/* Contenu du module */}
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

        {/* Onglet Analyse des risques */}
        {activeTab === 'risks' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <AlertTriangle size={20} className="text-amber-500" />
                <span>Analyse des risques</span>
              </h3>
              
              <div className="space-y-4">
                {safetyRisks.map(risk => (
                  <div
                    key={risk.id}
                    className={`border-2 rounded-lg p-4 ${
                      risk.level === 'critique' ? 'border-red-300 bg-red-50' :
                      risk.level === 'élevé' ? 'border-orange-300 bg-orange-50' :
                      'border-yellow-300 bg-yellow-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          risk.level === 'critique' ? 'bg-red-100 text-red-800' :
                          risk.level === 'élevé' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {risk.level.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{risk.category}</span>
                      </div>
                      
                      <button
                        onClick={() => acknowledgeRisk(risk.id)}
                        disabled={acknowledgedRisks.has(risk.id)}
                        className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                          acknowledgedRisks.has(risk.id)
                            ? 'bg-green-100 text-green-800 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {acknowledgedRisks.has(risk.id) ? 'Pris en compte' : 'Prendre en compte'}
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Description du risque</h4>
                        <p className="text-gray-700 text-sm">{risk.description}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Mesures de prévention</h4>
                        <p className="text-gray-700 text-sm">{risk.prevention}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Conséquences potentielles</h4>
                        <p className="text-gray-700 text-sm">{risk.consequences}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-700">
                  <strong>Risques pris en compte:</strong> {acknowledgedRisks.size}/{safetyRisks.length}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Vous devez prendre en compte tous les risques critiques avant de pouvoir passer la certification.
                </div>
              </div>
            </div>

            {/* Équipements de protection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Équipements de protection individuelle (EPI)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Casque de sécurité', mandatory: true, description: 'Protection contre les chocs' },
                  { name: 'Lunettes de protection', mandatory: true, description: 'Protection oculaire' },
                  { name: 'Gants de sécurité', mandatory: true, description: 'Protection des mains' },
                  { name: 'Chaussures de sécurité', mandatory: true, description: 'Protection des pieds' },
                  { name: 'Vêtement haute visibilité', mandatory: false, description: 'Signalisation visuelle' },
                  { name: 'Protection respiratoire', mandatory: false, description: 'Selon exposition' }
                ].map((epi, index) => (
                  <div key={index} className={`p-4 rounded-lg border-2 ${
                    epi.mandatory ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield size={16} className={epi.mandatory ? 'text-red-600' : 'text-gray-600'} />
                      <span className="font-medium text-gray-900">{epi.name}</span>
                      {epi.mandatory && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                          Obligatoire
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{epi.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Onglet Urgences */}
        {activeTab === 'emergency' && (
          <div className="space-y-6">
            {/* Contacts d'urgence */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Phone size={20} style={{ color: primaryColor }} />
                <span>Contacts d'urgence</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className={`p-4 rounded-lg border-2 ${
                    contact.type === 'urgence' || contact.type === 'externe' 
                      ? 'border-red-200 bg-red-50' 
                      : 'border-blue-200 bg-blue-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{contact.name}</h4>
                        <div className="text-2xl font-bold mt-1" style={{ 
                          color: contact.type === 'urgence' || contact.type === 'externe' ? '#dc2626' : '#2563eb' 
                        }}>
                          {contact.number}
                        </div>
                      </div>
                      <Phone size={24} className={
                        contact.type === 'urgence' || contact.type === 'externe' ? 'text-red-600' : 'text-blue-600'
                      } />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Procédures d'urgence */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Procédures d'urgence
              </h3>
              
              <div className="space-y-6">
                {[
                  {
                    title: "En cas d'accident corporel",
                    steps: [
                      "Sécuriser immédiatement la zone",
                      "Ne pas déplacer la victime sauf danger immédiat",
                      "Appeler les secours (15 ou infirmerie ext. 1234)",
                      "Prodiguer les premiers secours si formé",
                      "Alerter le responsable sécurité",
                      "Rédiger un rapport d'accident"
                    ],
                    color: 'red'
                  },
                  {
                    title: "En cas d'incendie",
                    steps: [
                      "Donner l'alarme",
                      "Évacuer si possible",
                      "Fermer les portes",
                      "Appeler les pompiers (18)",
                      "Se rendre au point de rassemblement",
                      "Attendre les consignes"
                    ],
                    color: 'orange'
                  },
                  {
                    title: "En cas de panne technique",
                    steps: [
                      "Arrêter l'équipement en sécurité",
                      "Signaler le dysfonctionnement",
                      "Appeler la maintenance (ext. 2350)",
                      "Baliser la zone si nécessaire",
                      "Attendre l'intervention",
                      "Consigner dans le registre"
                    ],
                    color: 'blue'
                  }
                ].map((procedure, index) => (
                  <div key={index} className={`border-l-4 pl-6 py-4 ${
                    procedure.color === 'red' ? 'border-red-400 bg-red-50' :
                    procedure.color === 'orange' ? 'border-orange-400 bg-orange-50' :
                    'border-blue-400 bg-blue-50'
                  }`}>
                    <h4 className="font-semibold text-gray-900 mb-3">{procedure.title}</h4>
                    <ol className="space-y-2">
                      {procedure.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start space-x-3">
                          <span className={`flex-shrink-0 w-6 h-6 rounded-full text-white text-sm font-medium flex items-center justify-center ${
                            procedure.color === 'red' ? 'bg-red-500' :
                            procedure.color === 'orange' ? 'bg-orange-500' :
                            'bg-blue-500'
                          }`}>
                            {stepIndex + 1}
                          </span>
                          <span className="text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>

            {/* Localisation des équipements d'urgence */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Équipements d'urgence - Localisation
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { equipment: 'Extincteurs', location: 'Près de chaque sortie', icon: '🧯' },
                  { equipment: 'Trousse de premiers secours', location: 'Bureau du superviseur', icon: '🏥' },
                  { equipment: 'Douche de sécurité', location: 'Zone de stockage chimique', icon: '🚿' },
                  { equipment: 'Alarme incendie', location: 'Entrée principale', icon: '🚨' },
                  { equipment: 'Téléphone d\'urgence', location: 'Poste de garde', icon: '📞' },
                  { equipment: 'Point de rassemblement', location: 'Parking visiteurs', icon: '🚩' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{item.equipment}</div>
                      <div className="text-sm text-gray-600">{item.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Onglet Certification */}
        {activeTab === 'certification' && (
          <div className="space-y-6">
            {/* Prérequis pour la certification */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Award size={20} style={{ color: primaryColor }} />
                <span>Conditions de certification</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    completedChecklist.size === safetyChecklist.length 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {completedChecklist.size === safetyChecklist.length ? '✓' : '○'}
                  </div>
                  <span className="text-gray-800">
                    Compléter toute la checklist de sécurité ({completedChecklist.size}/{safetyChecklist.length})
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    acknowledgedRisks.size === safetyRisks.length 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {acknowledgedRisks.size === safetyRisks.length ? '✓' : '○'}
                  </div>
                  <span className="text-gray-800">
                    Prendre en compte tous les risques identifiés ({acknowledgedRisks.size}/{safetyRisks.length})
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-300 text-gray-600">
                    ○
                  </div>
                  <span className="text-gray-800">
                    Obtenir une note minimale de {formation.assessment?.passing_grade || 100}% à l'évaluation
                  </span>
                </div>
              </div>
            </div>

            {/* Évaluation de certification */}
            {canTakeAssessment() ? (
              formation.assessment ? (
                <QuizSection
                  assessment={formation.assessment}
                  primaryColor={primaryColor}
                  passingGrade={formation.assessment.passing_grade || 100}
                  onComplete={(results) => {
                    console.log('Certification terminée:', results);
                    if (onModuleComplete) {
                      onModuleComplete('certification', results);
                    }
                  }}
                />
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <Award size={48} className="mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Certification de sécurité obtenue !
                  </h3>
                  <p className="text-green-700 mb-4">
                    Vous avez complété avec succès tous les prérequis de sécurité.
                  </p>
                  <div className="bg-white rounded-lg p-4 inline-block shadow-sm">
                    <div className="text-center">
                      <div className="font-bold text-gray-900">{formation.company}</div>
                      <div className="text-sm text-gray-600 mt-1">Certificat de formation sécurité</div>
                      <div className="font-medium text-gray-800 mt-2">{formation.title}</div>
                      <div className="text-xs text-gray-500 mt-2">
                        Délivré le {new Date().toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                <Clock size={48} className="mx-auto text-amber-500 mb-4" />
                <h3 className="text-lg font-semibold text-amber-800 mb-2">
                  Certification non disponible
                </h3>
                <p className="text-amber-700">
                  Complétez d'abord tous les prérequis de sécurité pour accéder à l'évaluation de certification.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SafetyTemplate;