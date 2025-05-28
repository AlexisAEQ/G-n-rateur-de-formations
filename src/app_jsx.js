import React, { useState, useEffect } from 'react';
import { BookOpen, Settings, Users, Award } from 'lucide-react';
import FormationLayout from './components/FormationLayout';

function App() {
  const [formations, setFormations] = useState([]);
  const [currentFormation, setCurrentFormation] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les formations générées
  useEffect(() => {
    loadFormations();
  }, []);

  const loadFormations = async () => {
    try {
      // Tenter de charger l'index des formations
      const response = await fetch('/generated/index.json');
      
      if (!response.ok) {
        throw new Error('Aucune formation générée trouvée');
      }
      
      const index = await response.json();
      setFormations(index.formations || []);
      
      // Charger la première formation par défaut
      if (index.formations && index.formations.length > 0) {
        await loadFormation(index.formations[0].slug);
      }
      
    } catch (err) {
      console.error('Erreur lors du chargement des formations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFormation = async (slug) => {
    try {
      const response = await fetch(`/generated/${slug}.json`);
      
      if (!response.ok) {
        throw new Error(`Formation ${slug} non trouvée`);
      }
      
      const formation = await response.json();
      setCurrentFormation(formation);
      setCurrentModule(formation.modules?.[0]?.id || null);
      
    } catch (err) {
      console.error('Erreur lors du chargement de la formation:', err);
      setError(err.message);
    }
  };

  const handleModuleChange = (moduleId) => {
    setCurrentModule(moduleId);
  };

  const handleModuleComplete = (moduleId, data) => {
    console.log(`Module ${moduleId} terminé:`, data);
    // Ici vous pourriez sauvegarder la progression
  };

  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des formations...</p>
        </div>
      </div>
    );
  }

  // État d'erreur - Aucune formation générée
  if (error || !formations.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Formation Generator
          </h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">
              Aucune formation disponible
            </h2>
            <p className="text-yellow-700 text-sm mb-3">
              Vous devez d'abord générer vos formations à partir des fichiers Markdown.
            </p>
            <div className="text-left bg-yellow-100 rounded p-3 text-sm font-mono">
              <div className="mb-1"># 1. Créer vos formations .md dans /formations/</div>
              <div className="mb-1"># 2. Valider le contenu</div>
              <div className="text-blue-600">npm run validate</div>
              <div className="mb-1"># 3. Générer les données</div>
              <div className="text-blue-600">npm run generate</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <Settings size={24} className="mx-auto text-blue-600 mb-2" />
              <div className="text-sm font-medium text-gray-900">Étape 1</div>
              <div className="text-xs text-gray-600">Créer formations .md</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <Users size={24} className="mx-auto text-green-600 mb-2" />
              <div className="text-sm font-medium text-gray-900">Étape 2</div>
              <div className="text-xs text-gray-600">Générer et publier</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Application principale avec formations
  return (
    <div className="App">
      {currentFormation ? (
        <FormationLayout
          formation={currentFormation}
          currentModule={currentModule}
          onModuleChange={handleModuleChange}
        >
          {/* Contenu du module sera rendu par FormationLayout */}
        </FormationLayout>
      ) : (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Award size={64} className="mx-auto text-blue-600 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Sélectionnez une formation
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {formations.map((formation) => (
                <button
                  key={formation.slug}
                  onClick={() => loadFormation(formation.slug)}
                  className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow text-left"
                >
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {formation.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {formation.company}
                  </p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{formation.duration} min</span>
                    <span className="capitalize">{formation.type}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;