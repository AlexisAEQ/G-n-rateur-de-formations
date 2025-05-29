import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';
import { marked } from 'marked';

console.log('🚀 GÉNÉRATION AVANCÉE AVEC TOUS LES OUTILS (VERSION CORRIGÉE)');

// ==========================================
// CONFIGURATION DES OUTILS DISPONIBLES
// ==========================================

// Configuration Marked avec renderer personnalisé
const renderer = new marked.Renderer();

// Personnaliser les titres avec IDs pour la navigation
renderer.heading = function(text, level) {
  const cleanText = String(text || '').trim();
  const id = cleanText.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
  
  return `<h${level} id="${id}" class="heading-${level} text-${level === 1 ? '3xl' : level === 2 ? '2xl' : 'xl'} font-bold mb-4">${cleanText}</h${level}>`;
};

// Personnaliser les liens avec classes Tailwind
renderer.link = function(href, title, text) {
  const titleAttr = title ? ` title="${title}"` : '';
  const isExternal = String(href || '').startsWith('http');
  
  if (isExternal) {
    return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline external-link">${text}</a>`;
  }
  
  return `<a href="${href}"${titleAttr} class="text-blue-600 hover:text-blue-800 underline internal-link">${text}</a>`;
};

// Personnaliser les blockquotes pour les callouts avec classes Tailwind
renderer.blockquote = function(quote) {
  const quoteStr = String(quote || '');
  if (quoteStr.includes('📹')) {
    return `<div class="callout callout-video bg-purple-50 border-l-4 border-purple-400 p-4 my-4 rounded-r-lg">${quote}</div>`;
  } else if (quoteStr.includes('⚠️')) {
    return `<div class="callout callout-warning bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4 rounded-r-lg">${quote}</div>`;
  } else if (quoteStr.includes('💡')) {
    return `<div class="callout callout-tip bg-blue-50 border-l-4 border-blue-400 p-4 my-4 rounded-r-lg">${quote}</div>`;
  } else if (quoteStr.includes('🔐')) {
    return `<div class="callout callout-safety bg-red-50 border-l-4 border-red-400 p-4 my-4 rounded-r-lg">${quote}</div>`;
  }
  
  return `<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">${quote}</blockquote>`;
};

// Configuration Marked avec toutes les options
marked.setOptions({
  renderer: renderer,
  pedantic: false,
  gfm: true,
  breaks: false,
  sanitize: false,
  smartypants: true,
  xhtml: false
});

// ==========================================
// TEMPLATES ET COMPOSANTS DISPONIBLES
// ==========================================

const TEMPLATES = {
  equipment: {
    name: 'EquipmentTemplate',
    features: ['specs', 'safety', 'maintenance', 'troubleshooting'],
    requiredFields: ['equipment.name', 'equipment.manufacturer'],
    defaultSections: ['overview', 'safety', 'operation', 'maintenance', 'evaluation']
  },
  skills: {
    name: 'SkillsTemplate',
    features: ['progression', 'exercises', 'assessment', 'certification'],
    requiredFields: ['difficulty', 'learning_objectives'],
    defaultSections: ['introduction', 'content', 'practice', 'evaluation']
  },
  safety: {
    name: 'SafetyTemplate',
    features: ['procedures', 'risks', 'emergency', 'certification'],
    requiredFields: ['assessment'],
    defaultSections: ['risks', 'procedures', 'emergency', 'certification']
  },
  general: {
    name: 'GeneralTemplate',
    features: ['content', 'resources', 'evaluation'],
    requiredFields: [],
    defaultSections: ['introduction', 'content', 'conclusion']
  }
};

// ==========================================
// FONCTIONS UTILITAIRES SÉCURISÉES
// ==========================================

// FONCTION AJOUTÉE POUR NETTOYER LES [object Object]
function cleanObject(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(cleanObject);
  }
  
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      // Si c'est un objet, le nettoyer récursivement
      cleaned[key] = cleanObject(value);
    } else if (typeof value === 'function') {
      // Ignorer les fonctions
      continue;
    } else if (value === undefined) {
      // Ignorer les valeurs undefined
      continue;
    } else {
      // Garder les valeurs primitives
      cleaned[key] = value;
    }
  }
  
  return cleaned;
}

function safeMarkdown(content) {
  try {
    const contentStr = String(content || '').trim();
    if (!contentStr) return '';
    
    // AJOUT: Nettoyer les [object Object] avant conversion
    const cleanedContent = contentStr.replace(/\[object Object\]/g, '');
    
    return marked(cleanedContent);
  } catch (error) {
    console.log(`   ⚠️  Erreur markdown ignorée: ${error.message}`);
    return `<p>${String(content || '')}</p>`;
  }
}

function detectFormationType(frontMatter, content) {
  // Sécuriser les paramètres
  const fm = frontMatter || {};
  const contentStr = String(content || '').toLowerCase();
  
  if (fm.type) return fm.type;
  
  if (fm.equipment || contentStr.includes('équipement') || contentStr.includes('robot')) {
    return 'equipment';
  }
  
  if (contentStr.includes('sécurité') || contentStr.includes('danger') || contentStr.includes('risque')) {
    return 'safety';
  }
  
  if (fm.difficulty || contentStr.includes('compétence') || contentStr.includes('apprentissage')) {
    return 'skills';
  }
  
  return 'general';
}

function extractAdvancedModules(content) {
  const modules = [];
  const contentStr = String(content || '');
  const lines = contentStr.split('\n');
  let currentModule = null;
  let currentContent = [];

  for (let i = 0; i < lines.length; i++) {
    const line = String(lines[i] || '');
    
    if (line.startsWith('# ') && !line.includes('===')) {
      // Sauvegarder le module précédent
      if (currentModule) {
        const processedContent = currentContent.join('\n').trim();
        currentModule.content = processedContent;
        currentModule.htmlContent = safeMarkdown(processedContent);
        currentModule.components = extractModuleComponents(processedContent);
        currentModule.estimatedDuration = calculateDuration(processedContent);
        modules.push(currentModule);
      }
      
      // Nouveau module
      const titleWithEmoji = line.replace('# ', '').trim();
      const title = titleWithEmoji.replace(/^[🤖⚙️🎯🛡️📚🔧🔍📝📊✅🚨]+\s*/, '').trim();
      const emoji = titleWithEmoji.match(/^[🤖⚙️🎯🛡️📚🔧🔍📝📊✅🚨]+/)?.[0] || '📄';
      
      const id = title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim() || `module-${modules.length + 1}`;
      
      currentModule = {
        id: id,
        title: title || 'Module sans titre',
        titleWithEmoji: titleWithEmoji,
        emoji: emoji,
        order: modules.length + 1,
        content: '',
        htmlContent: '',
        components: [],
        estimatedDuration: 0,
        type: detectModuleType(titleWithEmoji)
      };
      
      currentContent = [];
    } else if (currentModule) {
      currentContent.push(line);
    }
  }
  
  // Ajouter le dernier module
  if (currentModule) {
    const processedContent = currentContent.join('\n').trim();
    currentModule.content = processedContent;
    currentModule.htmlContent = safeMarkdown(processedContent);
    currentModule.components = extractModuleComponents(processedContent);
    currentModule.estimatedDuration = calculateDuration(processedContent);
    modules.push(currentModule);
  }
  
  return modules;
}

function detectModuleType(title) {
  const titleLower = String(title || '').toLowerCase();
  
  if (titleLower.includes('sécurité') || titleLower.includes('safety') || title.includes('🛡️')) {
    return 'safety';
  }
  if (titleLower.includes('évaluation') || titleLower.includes('test') || title.includes('📝')) {
    return 'assessment';
  }
  if (titleLower.includes('pratique') || titleLower.includes('exercice') || title.includes('🎯')) {
    return 'practice';
  }
  if (titleLower.includes('introduction') || titleLower.includes('présentation')) {
    return 'introduction';
  }
  
  return 'content';
}

function extractModuleComponents(content) {
  const components = [];
  const contentStr = String(content || '');
  
  // Détecter les vidéos
  if (contentStr.includes('📹') || contentStr.includes('Vidéo')) {
    components.push({ type: 'VideoPlayer', detected: true });
  }
  
  // Détecter les exercices
  if (contentStr.includes('Exercice Pratique') || contentStr.includes('Instructions')) {
    components.push({ type: 'ExerciseBlock', detected: true });
  }
  
  // Détecter les checklists
  if (contentStr.match(/- \[[ x]\]/)) {
    components.push({ type: 'SafetyChecklist', detected: true });
  }
  
  // Détecter les callouts
  if (contentStr.includes('⚠️') || contentStr.includes('💡') || contentStr.includes('🔐')) {
    components.push({ type: 'CalloutBox', detected: true });
  }
  
  return components;
}

function calculateDuration(content) {
  const contentStr = String(content || '');
  const words = contentStr.split(/\s+/).filter(w => w.length > 0).length;
  const readingTime = Math.ceil(words / 200); // 200 mots/minute
  
  // Ajouter du temps pour les éléments interactifs
  let interactiveTime = 0;
  
  // Exercices pratiques
  const exercises = (contentStr.match(/Exercice\s+Pratique/gi) || []).length;
  interactiveTime += exercises * 10; // 10 min par exercice
  
  // Vidéos (extraire la durée si mentionnée)
  const videoMatches = contentStr.match(/(\d+)min/g) || [];
  videoMatches.forEach(match => {
    const minutes = parseInt(match.replace('min', ''));
    if (!isNaN(minutes)) {
      interactiveTime += minutes;
    }
  });
  
  // Temps pour les callouts et réflexion
  const callouts = (contentStr.match(/[📹⚠️💡🔐]/g) || []).length;
  interactiveTime += callouts * 2; // 2 min par callout
  
  return Math.max(readingTime + interactiveTime, 5); // Minimum 5 minutes
}

function generateComponentMapping(formation) {
  const type = formation.type || 'general';
  const template = TEMPLATES[type] || TEMPLATES.general;
  
  return {
    template: template.name,
    layout: 'FormationLayout',
    components: {
      navigation: 'ProgressTracker',
      modules: (formation.modules || []).map(module => ({
        component: 'ModuleCard',
        props: {
          module: module,
          type: type
        }
      })),
      resources: formation.resources ? 'ResourceList' : null,
      assessment: formation.assessment ? 'QuizSection' : null,
      equipment: (type === 'equipment' && formation.equipment) ? 'EquipmentSpecs' : null
    },
    features: template.features,
    sections: template.defaultSections
  };
}

function calculateQualityScore(modules, frontMatter) {
  let score = 0;
  const fm = frontMatter || {};
  const modulesList = modules || [];
  
  // Points pour les métadonnées complètes
  if (fm.title) score += 10;
  if (fm.learning_objectives && Array.isArray(fm.learning_objectives) && fm.learning_objectives.length > 0) score += 15;
  if (fm.prerequisites) score += 10;
  if (fm.resources) score += 15;
  if (fm.assessment) score += 15;
  
  // Points pour la structure
  if (modulesList.length >= 3) score += 10;
  if (modulesList.length <= 8) score += 5; // Pas trop de modules
  
  // Points pour l'interactivité
  const hasExercises = modulesList.some(m => (m.components || []).some(c => c.type === 'ExerciseBlock'));
  if (hasExercises) score += 10;
  
  const hasVideos = modulesList.some(m => (m.components || []).some(c => c.type === 'VideoPlayer'));
  if (hasVideos) score += 5;
  
  const hasCallouts = modulesList.some(m => (m.components || []).some(c => c.type === 'CalloutBox'));
  if (hasCallouts) score += 5;
  
  return Math.min(score, 100);
}

// ==========================================
// FONCTION PRINCIPALE SÉCURISÉE
// ==========================================

async function generateAdvancedFormations() {
  try {
    console.log('📁 Création des dossiers...');
    await fs.ensureDir('./public/generated');

    console.log('🔍 Recherche des fichiers...');
    const files = await glob('./formations/**/*.md');
    console.log(`📄 ${files.length} fichier(s) détecté(s)`);

    if (files.length === 0) {
      console.log('❌ Aucun fichier trouvé');
      return;
    }

    const formations = [];

    for (const filePath of files) {
      const filename = path.basename(filePath);
      console.log(`\n⚙️  Traitement avancé: ${filename}`);

      try {
        const content = await fs.readFile(filePath, 'utf8');
        
        // Parser avec gestion d'erreur
        let frontMatter = {};
        let markdownContent = content;
        
        try {
          const parsed = matter(content);
          frontMatter = parsed.data || {};
          markdownContent = parsed.content || '';
        } catch (parseError) {
          console.log(`   ⚠️  Erreur parsing front matter: ${parseError.message}`);
          console.log(`   ℹ️  Utilisation du contenu brut`);
        }

        // AJOUT: Nettoyer les métadonnées pour éviter [object Object]
        frontMatter = cleanObject(frontMatter);

        // Détection intelligente du type
        const detectedType = detectFormationType(frontMatter, markdownContent);
        console.log(`   🎯 Type détecté: ${detectedType}`);

        // Extraction avancée des modules
        const modules = extractAdvancedModules(markdownContent);
        console.log(`   📚 ${modules.length} module(s) avec composants`);

        // Calcul de la durée totale
        const estimatedTotalDuration = modules.reduce((total, module) => 
          total + (module.estimatedDuration || 0), 0);

        const slug = path.basename(filePath, '.md')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '') || 'formation';

        // Création de l'objet formation enrichi
        const formation = {
          // Métadonnées enrichies
          ...frontMatter,
          title: frontMatter.title || filename.replace('.md', ''),
          type: detectedType,
          company: frontMatter.company || 'Formation Professionnelle',
          duration: frontMatter.duration || estimatedTotalDuration,
          instructor: frontMatter.instructor || 'Instructeur',
          
          // Informations système
          slug: slug,
          filename: filename,
          lastProcessed: new Date().toISOString(),
          generatorVersion: '1.0.0',
          
          // Contenu structuré
          modules: modules,
          moduleCount: modules.length,
          estimatedTotalDuration: estimatedTotalDuration,
          
          // Navigation et interface
          tableOfContents: modules.map(module => ({
            id: module.id,
            title: module.title,
            emoji: module.emoji,
            order: module.order,
            duration: module.estimatedDuration,
            type: module.type,
            components: (module.components || []).map(c => c.type)
          })),
          
          // Contenu pour recherche
          searchableContent: [
            frontMatter.title,
            ...modules.map(m => m.title),
            ...(frontMatter.learning_objectives || []),
            ...(frontMatter.prerequisites || [])
          ].filter(Boolean).join(' ').toLowerCase(),
          
          // Score de qualité
          qualityScore: calculateQualityScore(modules, frontMatter),
          
          // Contenu complet
          rawContent: markdownContent,
          htmlContent: safeMarkdown(markdownContent)
        };

        // Mapping des composants (après création de l'objet formation)
        formation.componentMapping = generateComponentMapping(formation);

        formations.push(formation);

        // Sauvegarder individuellement
        await fs.writeJSON(`./public/generated/${slug}.json`, formation, { spaces: 2 });
        console.log(`   ✅ ${slug}.json (score: ${formation.qualityScore}/100)`);

      } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}`);
        console.log(`   📝 Stack: ${error.stack}`);
      }
    }

    // Index enrichi
    console.log('\n📋 Génération de l\'index enrichi...');
    const index = {
      totalFormations: formations.length,
      lastGenerated: new Date().toISOString(),
      
      formations: formations.map(f => ({
        slug: f.slug,
        title: f.title,
        type: f.type,
        company: f.company,
        duration: f.duration,
        difficulty: f.difficulty,
        moduleCount: f.moduleCount,
        estimatedDuration: f.estimatedTotalDuration,
        qualityScore: f.qualityScore,
        components: f.componentMapping ? f.componentMapping.template : 'GeneralTemplate',
        features: f.componentMapping ? f.componentMapping.features : []
      })),
      
      searchIndex: formations.map(f => ({
        slug: f.slug,
        title: f.title,
        type: f.type,
        searchText: f.searchableContent || ''
      }))
    };

    await fs.writeJSON('./public/generated/index.json', index, { spaces: 2 });

    // Configuration avancée
    console.log('⚙️  Génération de la configuration avancée...');
    const config = {
      app: {
        name: 'Formation Generator',
        version: '1.0.0',
        buildDate: new Date().toISOString()
      },
      formations: {
        basePath: '/formations',
        total: formations.length
      },
      templates: TEMPLATES
    };

    await fs.writeJSON('./public/generated/config.json', config, { spaces: 2 });

    console.log(`\n🎉 GÉNÉRATION AVANCÉE TERMINÉE !`);
    console.log(`📊 Statistiques:`);
    console.log(`   - ${formations.length} formations générées`);
    if (formations.length > 0) {
      const avgScore = Math.round(formations.reduce((sum, f) => sum + f.qualityScore, 0) / formations.length);
      const totalDuration = formations.reduce((sum, f) => sum + f.estimatedTotalDuration, 0);
      console.log(`   - ${totalDuration} minutes de contenu total`);
      console.log(`   - Score qualité moyen: ${avgScore}/100`);
    }

  } catch (error) {
    console.error('💥 Erreur critique:', error.message);
    console.error(error.stack);
  }
}

generateAdvancedFormations();