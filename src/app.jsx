import React, { useState, useEffect } from 'react';
import { BookOpen, Settings, Users, Award } from 'lucide-react';
import FormationLayout from "./component/FormationLayout.jsx";

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
      
      // Charger une formation de démonstration si pas de formations générées
      loadDemoFormation();
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

  // Formation de démonstration
  const loadDemoFormation = () => {
    const demoFormation = {
      title: "Formation de Démonstration",
      company: "Formation Generator",
      instructor: "Assistant IA",
      duration: 60,
      type: "demo",
      moduleCount: 3,
      modules: [
        {
          id: "introduction",
          title: "Introduction",
          htmlContent: `
            <h2>Bienvenue dans Formation Generator!</h2>
            <p>Cette formation de démonstration vous montre les fonctionnalités de base du système.</p>
            <h3>Fonctionnalités disponibles :</h3>
            <ul>
              <li>Navigation intuitive entre modules</li>
              <li>Interface responsive</li>
              <li>Support des formations personnalisées</li>
              <li>Génération automatique depuis Markdown</li>
            </ul>
            <div style="background: #f0f9ff; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
              <strong>💡 Astuce :</strong> Pour utiliser vos propres formations, créez vos fichiers .md dans le dossier formations/ puis exécutez <code>npm run generate</code>
            </div>
          `
        },
        {
          id: "utilisation",
          title: "Guide d'utilisation",
          htmlContent: `
            <h2>Comment utiliser Formation Generator</h2>
            <h3>Étape 1 : Créer vos formations</h3>
            <p>Créez vos fichiers de formation en Markdown dans le dossier <code>formations/</code></p>
            
            <h3>Étape 2 : Valider le contenu</h3>
            <pre><code>npm run validate</code></pre>
            
            <h3>Étape 3 : Générer les pages</h3>
            <pre><code>npm run generate</code></pre>
            
            <h3>Étape 4 : Lancer l'application</h3>
            <pre><code>npm run dev</code></pre>
            
            <div style="background: #f0fdf4; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
              <strong>✅ Succès :</strong> Votre application Formation Generator fonctionne correctement !
            </div>
          `
        },
        {
          id: "prochaines-etapes",
          title: "Prochaines étapes",
          htmlContent: `
            <h2>Développer votre système de formation</h2>
            
            <h3>Templates disponibles :</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 1rem 0;">
              <div style="padding: 1rem; background: #f0f9ff; border-radius: 8px; border: 2px solid #bfdbfe;">
                <h4 style="color: #1e40af; margin-top: 0;">🔧 Équipements</h4>
                <p style="margin-bottom: 0;">Formations sur robots, machines, automates</p>
              </div>
              
              <div style="padding: 1rem; background: #f0fdf4; border-radius: 8px; border: 2px solid #bbf7d0;">
                <h4 style="color: #059669; margin-top: 0;">📈 Compétences</h4>
                <p style="margin-bottom: 0;">Mise à niveau des connaissances techniques</p>
              </div>
              
              <div style="padding: 1rem; background: #fef2f2; border-radius: 8px; border: 2px solid #fecaca;">
                <h4 style="color: #dc2626; margin-top: 0;">🛡️ Sécurité</h4>
                <p style="margin-bottom: 0;">Formations sécurité avec certification</p>
              </div>
            </div>
            
            <h3>Fonctionnalités avancées :</h3>
            <ul>
              <li>Suivi de progression automatique</li>
              <li>Évaluations interactives</li>
              <li>Lecteur vidéo intégré</li>
              <li>Export de certificats</li>
              <li>Support multi-entreprise</li>
            </ul>
          `
        }
      ]
    };
    
    setCurrentFormation(demoFormation);
    setCurrentModule(demoFormation.modules[0].id);
  };

  const handleModuleChange = (moduleId) => {
    setCurrentModule(moduleId);
  };

  const handleModuleComplete = (moduleId, data) => {
    console.log(`Module ${moduleId} terminé:`, data);
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

  // Application principale
  return (
    <div className="App">
      <FormationLayout
        formation={currentFormation}
        currentModule={currentModule}
        onModuleChange={handleModuleChange}
      >
        {/* Le contenu est géré par FormationLayout */}
      </FormationLayout>
    </div>
  );
}

export default App;