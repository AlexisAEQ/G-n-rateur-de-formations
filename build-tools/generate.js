import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';
import { marked } from 'marked';

console.log('🚀 GÉNÉRATION AVANCÉE AVEC TOUS LES OUTILS');

// ==========================================
// CONFIGURATION DES OUTILS DISPONIBLES
// ==========================================

// Configuration Marked avec renderer personnalisé
const renderer = new marked.Renderer();

// Personnaliser les titres avec IDs pour la navigation
renderer.heading = function(text, level) {
  const id = text.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
  
  return `<h${level} id="${id}" class="heading-${level} text-${level === 1 ? '3xl' : level === 2 ? '2xl' : 'xl'} font-bold mb-4">${text}</h${level}>`;
};

// Personnaliser les liens avec classes Tailwind
renderer.link = function(href, title, text) {
  const titleAttr = title ? ` title="${title}"` : '';
  const isExternal = href.startsWith('http');
  
  if (isExternal) {
    return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline external-link">${text}</a>`;
  }
  
  return `<a href="${href}"${titleAttr} class="text-blue-600 hover:text-blue-800 underline internal-link">${text}</a>`;
};

// Personnaliser les blockquotes pour les callouts avec classes Tailwind
renderer.blockquote = function(quote) {
  if (quote.includes('📹')) {
    return `<div class="callout callout-video bg-purple-50 border-l-4 border-purple-400 p-4 my-4 rounded-r-lg">${quote}</div>`;
  } else if (quote.includes('⚠️')) {
    return `<div class="callout callout-warning bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4 rounded-r-lg">${quote}</div>`;
  } else if (quote.includes('💡')) {
    return `<div class="callout callout-tip bg-blue-50 border-l-4 border-blue-400 p-4 my-4 rounded-r-lg">${quote}</div>`;
  } else if (quote.includes('🔐')) {
    return `<div class="callout callout-safety bg-red-50 border-l-4 border-red-400 p-4 my-4 rounded-r-lg">${quote}</div>`;
  }
  
  return `<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">${quote}</blockquote>`;
};

// Personnaliser les listes avec classes Tailwind
renderer.list = function(body, ordered) {
  const tag = ordered ? 'ol' : 'ul';
  const classes = ordered ? 'list-decimal list-inside space-y-2' : 'list-disc list-inside space-y-2';
  return `<${tag} class="${classes} text-gray-700 mb-4">${body}</${tag}>`;
};

// Personnaliser les éléments de liste
renderer.listitem = function(text) {
  return `<li class="mb-1">${text}</li>`;
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

const COMPONENTS = {
  'FormationLayout': { props: ['title', 'type', 'modules', 'navigation'] },
  'ModuleCard': { props: ['module', 'index', 'completed'] },
  'ProgressTracker': { props: ['currentModule', 'totalModules', 'completion'] },
  'VideoPlayer': { props: ['src', 'title', 'duration'] },
  'QuizSection': { props: ['questions', 'passingGrade'] },
  'ResourceList': { props: ['videos', 'documents', 'links'] },
  'SafetyChecklist': { props: ['items', 'required'] },
  'EquipmentSpecs': { props: ['specifications', 'images'] },
  'ExerciseBlock': { props: ['title', 'instructions', 'timeAllowed', 'materials'] }
};

// ==========================================
// FONCTIONS UTILITAIRES AVANCÉES
// ==========================================

function detectFormationType(frontMatter, content) {
  // Détection intelligente du type basée sur le contenu
  if (frontMatter.type) return frontMatter.type;
  
  if (frontMatter.equipment || content.includes('équipement') || content.includes('robot')) {
    return 'equipment';
  }
  
  if (content.includes('sécurité') || content.includes('danger') || content.includes('risque')) {
    return 'safety';
  }
  
  if (frontMatter.difficulty || content.includes('compétence') || content.includes('apprentissage')) {
    return 'skills';
  }
  
  return 'general';
}

function generateComponentMapping(formation) {
  const type = formation.type;
  const template = TEMPLATES[type];
  
  return {
    template: template.name,
    layout: 'FormationLayout',
    components: {
      navigation: 'ProgressTracker',
      modules: formation.modules.map(module => ({
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

function extractAdvancedModules(content) {
  const modules = [];
  const lines = content.split('\n');
  let currentModule = null;
  let currentContent = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('# ') && !line.includes('===')) {
      // Sauvegarder le module précédent
      if (currentModule) {
        const processedContent = currentContent.join('\n').trim();
        currentModule.content = processedContent;
        currentModule.htmlContent = marked(processedContent);
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
        .trim();
      
      currentModule = {
        id: id,
        title: title,
        titleWithEmoji: titleWithEmoji,
        emoji: emoji,
        order: modules.length + 1,
        content: '',
        htmlContent: '',
        components: [],
        estimatedDuration: 0,
        type: detectModuleType(titleWithEmoji, i, lines)
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
    currentModule.htmlContent = marked(processedContent);
    currentModule.components = extractModuleComponents(processedContent);
    currentModule.estimatedDuration = calculateDuration(processedContent);
    modules.push(currentModule);
  }
  
  return modules;
}

function detectModuleType(title, lineIndex, allLines) {
  const titleLower = title.toLowerCase();
  
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
  
  // Détecter les vidéos
  if (content.includes('📹') || content.includes('Vidéo')) {
    components.push({ type: 'VideoPlayer', detected: true });
  }
  
  // Détecter les exercices
  if (content.includes('Exercice Pratique') || content.includes('Instructions')) {
    components.push({ type: 'ExerciseBlock', detected: true });
  }
  
  // Détecter les checklists
  if (content.match(/- \[[ x]\]/)) {
    components.push({ type: 'SafetyChecklist', detected: true });
  }
  
  // Détecter les callouts
  if (content.includes('⚠️') || content.includes('💡') || content.includes('🔐')) {
    components.push({ type: 'CalloutBox', detected: true });
  }
  
  return components;
}

function calculateDuration(content) {
  const words = content.split(/\s+/).length;
  const readingTime = Math.ceil(words / 200); // 200 mots/minute
  
  // Ajouter du temps pour les éléments interactifs
  let interactiveTime = 0;
  
  // Exercices pratiques
  const exercises = (content.match(/Exercice\s+Pratique/gi) || []).length;
  interactiveTime += exercises * 10; // 10 min par exercice
  
  // Vidéos (extraire la durée si mentionnée)
  const videoMatches = content.match(/(\d+)min/g);
  if (videoMatches) {
    videoMatches.forEach(match => {
      const minutes = parseInt(match.replace('min', ''));
      interactiveTime += minutes;
    });
  }
  
  // Temps pour les callouts et réflexion
  const callouts = (content.match(/[📹⚠️💡🔐]/g) || []).length;
  interactiveTime += callouts * 2; // 2 min par callout
  
  return Math.max(readingTime + interactiveTime, 5); // Minimum 5 minutes
}

function generateAdvancedConfig(formations) {
  const stats = {
    byType: {},
    byDifficulty: {},
    componentsUsed: new Set(),
    totalDuration: 0
  };
  
  formations.forEach(formation => {
    stats.byType[formation.type] = (stats.byType[formation.type] || 0) + 1;
    if (formation.difficulty) {
      stats.byDifficulty[formation.difficulty] = (stats.byDifficulty[formation.difficulty] || 0) + 1;
    }
    stats.totalDuration += formation.estimatedTotalDuration || 0;
    
    // Collecter les composants utilisés
    if (formation.componentMapping) {
      Object.values(formation.componentMapping.components).forEach(comp => {
        if (comp && typeof comp === 'string') {
          stats.componentsUsed.add(comp);
        } else if (comp && comp.component) {
          stats.componentsUsed.add(comp.component);
        }
      });
    }
  });
  
  return {
    app: {
      name: 'Formation Generator',
      version: '1.0.0',
      buildDate: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    },
    
    formations: {
      basePath: '/formations',
      assetsPath: '/assets',
      total: formations.length,
      statistics: {
        ...stats,
        componentsUsed: Array.from(stats.componentsUsed),
        averageDuration: Math.round(stats.totalDuration / formations.length)
      }
    },
    
    templates: TEMPLATES,
    components: COMPONENTS,
    
    ui: {
      themes: {
        industrial: { primary: '#1e40af', accent: '#f59e0b' },
        corporate: { primary: '#059669', accent: '#dc2626' },
        safety: { primary: '#dc2626', accent: '#f59e0b' }
      },
      navigation: {
        showProgress: true,
        allowJumping: true,
        autoSave: true
      }
    },
    
    features: {
      search: true,
      bookmarks: true,
      notes: true,
      certificates: true,
      analytics: true
    }
  };
}

// ==========================================
// FONCTION PRINCIPALE
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
        const { data: frontMatter, content: markdownContent } = matter(content);

        // Détection intelligente du type
        const detectedType = detectFormationType(frontMatter, markdownContent);
        console.log(`   🎯 Type détecté: ${detectedType}`);

        // Extraction avancée des modules
        const modules = extractAdvancedModules(markdownContent);
        console.log(`   📚 ${modules.length} module(s) avec composants`);

        // Calcul de la durée totale
        const estimatedTotalDuration = modules.reduce((total, module) => 
          total + module.estimatedDuration, 0);

        const slug = path.basename(filePath, '.md')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');

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
          
          // Mapping des composants React
          componentMapping: generateComponentMapping({
            type: detectedType,
            modules: modules,
            resources: frontMatter.resources,
            assessment: frontMatter.assessment,
            equipment: frontMatter.equipment
          }),
          
          // Navigation et interface
          tableOfContents: modules.map(module => ({
            id: module.id,
            title: module.title,
            emoji: module.emoji,
            order: module.order,
            duration: module.estimatedDuration,
            type: module.type,
            components: module.components.map(c => c.type)
          })),
          
          // Contenu pour recherche et indexation
          searchableContent: [
            frontMatter.title,
            ...modules.map(m => m.title),
            ...(frontMatter.learning_objectives || []),
            ...(frontMatter.prerequisites || [])
          ].filter(Boolean).join(' ').toLowerCase(),
          
          // Métadonnées de qualité
          qualityScore: calculateQualityScore(modules, frontMatter),
          
          // Contenu complet
          rawContent: markdownContent,
          htmlContent: marked(markdownContent)
        };

        formations.push(formation);

        // Sauvegarder individuellement
        await fs.writeJSON(`./public/generated/${slug}.json`, formation, { spaces: 2 });
        console.log(`   ✅ ${slug}.json (${formation.qualityScore}/100 qualité)`);

      } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}`);
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
        components: f.componentMapping.template,
        features: f.componentMapping.features
      })),
      
      searchIndex: formations.map(f => ({
        slug: f.slug,
        title: f.title,
        type: f.type,
        searchText: f.searchableContent
      }))
    };

    await fs.writeJSON('./public/generated/index.json', index, { spaces: 2 });

    // Configuration avancée
    console.log('⚙️  Génération de la configuration avancée...');
    const config = generateAdvancedConfig(formations);
    await fs.writeJSON('./public/generated/config.json', config, { spaces: 2 });

    console.log(`\n🎉 GÉNÉRATION AVANCÉE TERMINÉE !`);
    console.log(`📊 Statistiques:`);
    console.log(`   - ${formations.length} formations générées`);
    console.log(`   - ${config.formations.statistics.componentsUsed.length} composants utilisés`);
    console.log(`   - ${config.formations.statistics.totalDuration} minutes de contenu`);
    console.log(`   - Score qualité moyen: ${Math.round(formations.reduce((sum, f) => sum + f.qualityScore, 0) / formations.length)}/100`);

  } catch (error) {
    console.error('💥 Erreur:', error.message);
  }
}

function calculateQualityScore(modules, frontMatter) {
  let score = 0;
  
  // Points pour les métadonnées complètes
  if (frontMatter.title) score += 10;
  if (frontMatter.learning_objectives && frontMatter.learning_objectives.length > 0) score += 15;
  if (frontMatter.prerequisites) score += 10;
  if (frontMatter.resources) score += 15;
  if (frontMatter.assessment) score += 15;
  
  // Points pour la structure
  if (modules.length >= 3) score += 10;
  if (modules.length <= 8) score += 5; // Pas trop de modules
  
  // Points pour l'interactivité
  const hasExercises = modules.some(m => m.components.some(c => c.type === 'ExerciseBlock'));
  if (hasExercises) score += 10;
  
  const hasVideos = modules.some(m => m.components.some(c => c.type === 'VideoPlayer'));
  if (hasVideos) score += 5;
  
  const hasCallouts = modules.some(m => m.components.some(c => c.type === 'CalloutBox'));
  if (hasCallouts) score += 5;
  
  return Math.min(score, 100);
}

generateAdvancedFormations();