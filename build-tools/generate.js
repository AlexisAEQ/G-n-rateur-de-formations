import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';
import { marked } from 'marked';

console.log('🚀 GÉNÉRATION AVANCÉE AVEC CORRECTION DU BUG [object Object]');

// ==========================================
// CONFIGURATION DES OUTILS DISPONIBLES
// ==========================================

// Configuration Marked avec renderer personnalisé
const renderer = new marked.Renderer();

// Personnaliser les titres pour être stylisés par prose
renderer.heading = function(text, level) {
  const cleanText = String(text || '').trim();
  const id = cleanText.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
  
  return `<h${level} id="${id}">${cleanText}</h${level}>`;
};

// Personnaliser les liens
renderer.link = function(href, title, text) {
  const titleAttr = title ? ` title="${title}"` : '';
  const isExternal = String(href || '').startsWith('http');
  
  if (isExternal) {
    return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
  }
  
  return `<a href="${href}"${titleAttr}>${text}</a>`;
};

// Personnaliser les blockquotes pour les callouts
renderer.blockquote = function(quote) {
  const quoteStr = String(quote || '');
  const innerContent = quoteStr.replace(/^<p>|<\/p>$/g, '');

  if (quoteStr.includes('📹')) {
    return `<div class="video-callout">${innerContent}</div>`;
  } else if (quoteStr.includes('⚠️')) {
    return `<div class="warning-callout">${innerContent}</div>`;
  } else if (quoteStr.includes('💡')) {
    return `<div class="tip-callout">${innerContent}</div>`;
  } else if (quoteStr.includes('🔐')) {
    return `<div class="warning-callout">${innerContent}</div>`;
  }
  
  return `<blockquote>${quote}</blockquote>`;
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
      cleaned[key] = cleanObject(value);
    } else if (typeof value === 'function') {
      continue;
    } else if (value === undefined) {
      continue;
    } else {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
}

function safeMarkdown(content) {
  try {
    const contentStr = String(content || '').trim();
    if (!contentStr) return '';
    
    // Nettoyer le contenu des objets stringifiés
    const cleanedContent = contentStr
      .replace(/\[object Object\]/g, '')
      .replace(/\{[^}]*\}/g, '') // Supprimer les objets JSON inline
      .trim();
    
    if (!cleanedContent) return '<p>Contenu vide</p>';
    
    // Convertir en HTML avec marked
    const htmlResult = marked(cleanedContent);
    
    // Vérifier que le résultat est une string
    if (typeof htmlResult !== 'string') {
      console.error('marked() n\'a pas retourné une string:', typeof htmlResult);
      return `<p>${cleanedContent.substring(0, 200)}...</p>`;
    }
    
    return htmlResult;
  } catch (error) {
    console.error(`Erreur markdown:`, error.message);
    const safeContent = String(content || '').substring(0, 100);
    return `<p>Erreur de parsing: ${safeContent}...</p>`;
  }
}

function detectFormationType(frontMatter, content) {
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
  
  if (!contentStr.trim()) {
    return [{
      id: 'empty-content',
      title: 'Contenu vide',
      titleWithEmoji: '📄 Contenu vide',
      emoji: '📄',
      order: 1,
      content: 'Aucun contenu disponible',
      htmlContent: '<p>Aucun contenu disponible</p>',
      components: [],
      estimatedDuration: 5,
      type: 'content'
    }];
  }
  
  const moduleRegex = /^#\s+(.+?)\s*$/gm;
  let match;
  let lastIndex = 0;
  let order = 1;

  while ((match = moduleRegex.exec(contentStr)) !== null) {
    if (lastIndex !== 0) {
      // Sauvegarder le module précédent
      const previousModuleContent = contentStr.substring(lastIndex, match.index).trim();
      if (modules.length > 0) {
        const prevModule = modules[modules.length - 1];
        prevModule.content = previousModuleContent;
        
        // CORRECTION CRITIQUE: S'assurer que htmlContent est une string
        const htmlResult = safeMarkdown(previousModuleContent);
        prevModule.htmlContent = typeof htmlResult === 'string' ? htmlResult : '<p>Erreur de conversion HTML</p>';
        
        prevModule.components = extractModuleComponents(previousModuleContent);
        prevModule.estimatedDuration = calculateDuration(previousModuleContent);
      }
    }

    const titleWithEmoji = match[1].trim();
    const title = titleWithEmoji.replace(/^[🤖⚙️🎯🛡️📚🔧🔍📝📊✅🚨📄📐🔄🏃🧮📏]+\s*/, '').trim();
    const emoji = titleWithEmoji.match(/^[🤖⚙️🎯🛡️📚🔧🔍📝📊✅🚨📄📐🔄🏃🧮📏]+/)?.[0] || '📄';
    
    const id = title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim() || `module-${order}`;
    
    modules.push({
      id: id,
      title: title || 'Module sans titre',
      titleWithEmoji: titleWithEmoji,
      emoji: emoji,
      order: order++,
      content: '',
      htmlContent: '', // S'assurer que c'est initialisé comme string
      components: [],
      estimatedDuration: 0,
      type: detectModuleType(titleWithEmoji)
    });
    lastIndex = moduleRegex.lastIndex;
  }

  // Ajouter le contenu du dernier module
  if (modules.length > 0) {
    const lastModuleContent = contentStr.substring(lastIndex).trim();
    const lastMod = modules[modules.length - 1];
    lastMod.content = lastModuleContent;
    
    // CORRECTION CRITIQUE: S'assurer que htmlContent est une string
    const htmlResult = safeMarkdown(lastModuleContent);
    lastMod.htmlContent = typeof htmlResult === 'string' ? htmlResult : '<p>Erreur de conversion HTML</p>';
    
    lastMod.components = extractModuleComponents(lastModuleContent);
    lastMod.estimatedDuration = calculateDuration(lastModuleContent);
  } else if (contentStr && modules.length === 0) {
    // Cas où il n'y a pas de H1, traiter tout comme un module
    const title = "Contenu Principal";
    const id = "main-content";
    
    const htmlResult = safeMarkdown(contentStr);
    
    modules.push({
      id: id,
      title: title,
      titleWithEmoji: `📄 ${title}`,
      emoji: '📄',
      order: 1,
      content: contentStr,
      htmlContent: typeof htmlResult === 'string' ? htmlResult : '<p>Erreur de conversion HTML</p>',
      components: extractModuleComponents(contentStr),
      estimatedDuration: calculateDuration(contentStr),
      type: 'content'
    });
  }
  
  // Validation finale: s'assurer que tous les htmlContent sont des strings
  modules.forEach((module, index) => {
    if (typeof module.htmlContent !== 'string') {
      console.error(`Module ${index} htmlContent n'est pas une string:`, typeof module.htmlContent);
      module.htmlContent = '<p>Erreur: contenu HTML invalide</p>';
    }
  });
  
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
  
  if (contentStr.includes('📹') || contentStr.match(/Vidéo recommandée/i)) {
    components.push({ type: 'VideoPlayer', detected: true });
  }
  if (contentStr.includes('Exercice Pratique') || contentStr.includes('Instructions :')) {
    components.push({ type: 'ExerciseBlock', detected: true });
  }
  if (contentStr.match(/- \[[ x]\]/)) {
    components.push({ type: 'SafetyChecklist', detected: true });
  }
  if (contentStr.includes('⚠️') || contentStr.includes('💡') || contentStr.includes('🔐')) {
    components.push({ type: 'CalloutBox', detected: true });
  }
  
  return components;
}

function calculateDuration(content) {
  const contentStr = String(content || '');
  const words = contentStr.split(/\s+/).filter(w => w.length > 0).length;
  const readingTime = Math.ceil(words / 200); 
  
  let interactiveTime = 0;
  const exercises = (contentStr.match(/Exercice\s+Pratique/gi) || []).length;
  interactiveTime += exercises * 10; 
  
  const videoMatches = contentStr.match(/(\d+)min/g) || [];
  videoMatches.forEach(match => {
    const minutes = parseInt(match.replace('min', ''));
    if (!isNaN(minutes)) {
      interactiveTime += minutes;
    }
  });
  
  const callouts = (contentStr.match(/[📹⚠️💡🔐]/g) || []).length;
  interactiveTime += callouts * 1;
  
  return Math.max(readingTime + interactiveTime, 5);
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
          formationTitle: formation.title,
          primaryColor: formation.primary_color
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
  
  if (fm.title) score += 10;
  if (fm.learning_objectives && Array.isArray(fm.learning_objectives) && fm.learning_objectives.length > 0) score += 15;
  if (fm.prerequisites) score += 10;
  if (fm.resources) score += 15;
  if (fm.assessment) score += 15;
  if (modulesList.length >= 3) score += 10;
  if (modulesList.length <= 8) score += 5; 
  
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
      console.log('❌ Aucun fichier Markdown trouvé dans ./formations. Veuillez vérifier le chemin.');
      return;
    }

    const formations = [];

    for (const filePath of files) {
      const filename = path.basename(filePath);
      console.log(`\n⚙️  Traitement: ${filename}`);

      try {
        const content = await fs.readFile(filePath, 'utf8');
        
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

        frontMatter = cleanObject(frontMatter);

        const detectedType = detectFormationType(frontMatter, markdownContent);
        console.log(`   🎯 Type détecté: ${detectedType}`);

        const modules = extractAdvancedModules(markdownContent);
        console.log(`   📚 ${modules.length} module(s) trouvé(s)`);

        // Validation des modules
        const validModules = modules.filter(module => {
          if (typeof module.htmlContent !== 'string') {
            console.error(`   ❌ Module ${module.id} a un htmlContent invalide`);
            return false;
          }
          return true;
        });

        if (validModules.length !== modules.length) {
          console.log(`   ⚠️  ${modules.length - validModules.length} module(s) rejeté(s) pour htmlContent invalide`);
        }

        const estimatedTotalDuration = validModules.reduce((total, module) => 
          total + (module.estimatedDuration || 0), 0);

        const slug = (frontMatter.slug || path.basename(filePath, '.md'))
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
          || 'formation-sans-nom';

        const formation = {
          ...frontMatter,
          title: frontMatter.title || filename.replace('.md', ''),
          type: detectedType,
          company: frontMatter.company || 'Organisation',
          duration: frontMatter.duration || estimatedTotalDuration,
          instructor: frontMatter.instructor || 'Expert Formateur',
          slug: slug,
          filename: filename,
          lastProcessed: new Date().toISOString(),
          generatorVersion: '1.0.2',
          modules: validModules,
          moduleCount: validModules.length,
          estimatedTotalDuration: estimatedTotalDuration,
          tableOfContents: validModules.map(module => ({
            id: module.id,
            title: module.titleWithEmoji,
            order: module.order,
            duration: module.estimatedDuration,
            type: module.type,
            components: (module.components || []).map(c => c.type)
          })),
          searchableContent: [
            frontMatter.title,
            ...validModules.map(m => m.title),
            ...(frontMatter.learning_objectives || []),
            ...(frontMatter.prerequisites || [])
          ].filter(Boolean).join(' ').toLowerCase().replace(/[^\w\s-]/g, ''),
          qualityScore: calculateQualityScore(validModules, frontMatter),
          rawContent: markdownContent,
        };
        
        const cleanedFormation = cleanObject(formation);
        cleanedFormation.componentMapping = generateComponentMapping(cleanedFormation);

        formations.push(cleanedFormation);

        await fs.writeJSON(`./public/generated/${slug}.json`, cleanedFormation, { spaces: 2 });
        console.log(`   ✅ ${slug}.json (score: ${cleanedFormation.qualityScore}/100) généré`);

      } catch (error) {
        console.log(`   ❌ Erreur lors du traitement de ${filename}: ${error.message}`);
        console.log(`   📝 Stack: ${error.stack.split('\n').slice(0,3).join('\n')}`);
      }
    }

    if (formations.length > 0) {
      console.log('\n📋 Génération de l\'index...');
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
          template: f.componentMapping ? f.componentMapping.template : 'GeneralTemplate',
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
      console.log('   ✅ index.json généré');

      console.log('⚙️  Génération de la configuration...');
      const config = {
        app: {
          name: 'Formation Generator',
          version: '1.0.2',
          buildDate: new Date().toISOString()
        },
        formations: {
          basePath: '/formations',
          total: formations.length
        },
        templates: TEMPLATES
      };
      await fs.writeJSON('./public/generated/config.json', config, { spaces: 2 });
      console.log('   ✅ config.json généré');

      console.log(`\n🎉 GÉNÉRATION TERMINÉE !`);
      console.log(`📊 Statistiques:`);
      console.log(`   - ${formations.length} formations traitées`);
      const avgScore = Math.round(formations.reduce((sum, f) => sum + f.qualityScore, 0) / formations.length);
      const totalDurationSum = formations.reduce((sum, f) => sum + f.estimatedTotalDuration, 0);
      console.log(`   - ${totalDurationSum} minutes de contenu total`);
      console.log(`   - Score qualité moyen: ${avgScore}/100`);
    } else {
      console.log('\n⚠️ Aucune formation n\'a été générée avec succès.');
    }

  } catch (error) {
    console.error('💥 Erreur critique durant la génération:', error.message);
    console.error(error.stack);
  }
}

generateAdvancedFormations();

// Fonctions à ajouter dans generate.js pour le système enrichi

// ==========================================
// DÉTECTION DES ÉLÉMENTS INTERACTIFS
// ==========================================

function extractInteractiveElements(content) {
  const elements = {
    challenges: [],
    quizzes: [],
    simulations: [],
    checkpoints: []
  };
  
  // 1. Détecter les défis via regex améliorée
  const challengeRegex = /### 🎯 ([^#\n]+)[\s\S]*?(?=###|$)/g;
  let challengeMatch;
  let challengeId = 1;
  
  while ((challengeMatch = challengeRegex.exec(content)) !== null) {
    const challengeContent = challengeMatch[0];
    const title = challengeMatch[1].trim();
    
    // Extraire les métadonnées du défi
    const difficulty = challengeContent.match(/\*\*Difficulté\*\*\s*:\s*([^\n]+)/)?.[1]?.trim() || 'Moyen';
    const xp = parseInt(challengeContent.match(/\*\*XP\*\*\s*:\s*(\d+)/)?.[1]) || (100 * challengeId);
    const timeMatch = challengeContent.match(/\*\*Temps estimé\*\*\s*:\s*([^\n]+)/)?.[1]?.trim();
    const estimatedTime = timeMatch ? parseInt(timeMatch.replace(/\D/g, '')) || 15 : 15;
    
    // Extraire la mission
    const mission = challengeContent.match(/\*\*Mission\*\*\s*:\s*([^\n*]+)/)?.[1]?.trim() || '';
    
    // Extraire les critères de réussite
    const criteria = extractSuccessCriteria(challengeContent);
    
    // Extraire les indices
    const hint = challengeContent.match(/\*\*Indice\*\*\s*:\s*([^\n*]+)/)?.[1]?.trim();
    
    // Extraire les étapes
    const steps = extractChallengeSteps(challengeContent);
    
    // Extraire la validation automatique
    const validation = challengeContent.match(/\*\*Validation automatique\*\*\s*:\s*([^\n*]+)/)?.[1]?.trim();

    elements.challenges.push({
      id: `challenge-${challengeId}`,
      title,
      difficulty,
      xp,
      estimatedTime,
      mission,
      criteria,
      hint,
      steps,
      validation,
      content: challengeContent,
      type: 'interactive',
      unlocked: challengeId === 1 // Premier défi débloqué par défaut
    });
    
    challengeId++;
  }
  
  // 2. Détecter les quiz intégrés
  const quizRegex = /### 📝 Quiz[^#\n]*[\s\S]*?(?=###|$)/g;
  let quizMatch;
  let quizId = 1;
  
  while ((quizMatch = quizRegex.exec(content)) !== null) {
    const quizContent = quizMatch[0];
    const questions = extractQuizQuestions(quizContent);
    const passingGrade = parseInt(quizContent.match(/Seuil de réussite\s*:\s*(\d+)%/)?.[1]) || 75;
    const timeLimit = parseInt(quizContent.match(/Temps limite\s*:\s*(\d+)/)?.[1]) || null;
    
    if (questions.length > 0) {
      elements.quizzes.push({
        id: `quiz-${quizId}`,
        title: `Quiz ${quizId}`,
        questions,
        passingGrade,
        timeLimit,
        randomize: true,
        showExplanations: true
      });
      quizId++;
    }
  }
  
  // 3. Détecter les simulations
  const simulationRegex = /### 🖥️ Simulation[^#\n]*[\s\S]*?(?=###|$)/g;
  let simMatch;
  let simId = 1;
  
  while ((simMatch = simulationRegex.exec(content)) !== null) {
    const simContent = simMatch[0];
    const title = simContent.match(/### 🖥️ ([^#\n]+)/)?.[1]?.trim() || `Simulation ${simId}`;
    const url = simContent.match(/\*\*URL\*\*\s*:\s*([^\n]+)/)?.[1]?.trim();
    const type = simContent.match(/\*\*Type\*\*\s*:\s*([^\n]+)/)?.[1]?.trim() || 'iframe';
    
    if (url) {
      elements.simulations.push({
        id: `simulation-${simId}`,
        title,
        url,
        type,
        fullscreen: true
      });
      simId++;
    }
  }
  
  // 4. Détecter les checkpoints de progression
  const checkpointRegex = /### ✅ Checkpoint[^#\n]*[\s\S]*?(?=###|$)/g;
  let checkMatch;
  let checkId = 1;
  
  while ((checkMatch = checkpointRegex.exec(content)) !== null) {
    const checkContent = checkMatch[0];
    const title = checkContent.match(/### ✅ ([^#\n]+)/)?.[1]?.trim() || `Checkpoint ${checkId}`;
    const requirements = extractCheckpointRequirements(checkContent);
    
    elements.checkpoints.push({
      id: `checkpoint-${checkId}`,
      title,
      requirements,
      reward: 50 * checkId
    });
    checkId++;
  }
  
  return elements;
}

function extractSuccessCriteria(content) {
  const criteria = [];
  const criteriaRegex = /\*\*Critères de réussite\*\*\s*:\s*([\s\S]*?)(?=\*\*|###|$)/;
  const match = content.match(criteriaRegex);
  
  if (match) {
    const criteriaText = match[1];
    const items = criteriaText.match(/- \[ \] ([^\n]+)/g) || [];
    
    items.forEach((item, index) => {
      const text = item.replace(/- \[ \] /, '').trim();
      criteria.push({
        id: index + 1,
        text,
        completed: false,
        required: true
      });
    });
  }
  
  return criteria;
}

function extractChallengeSteps(content) {
  const steps = [];
  const stepsRegex = /\*\*Étapes\*\*\s*:\s*([\s\S]*?)(?=\*\*|###|$)/;
  const match = content.match(stepsRegex);
  
  if (match) {
    const stepsText = match[1];
    const items = stepsText.match(/\d+\.\s*([^\n]+)/g) || [];
    
    items.forEach((item, index) => {
      const text = item.replace(/\d+\.\s*/, '').trim();
      steps.push({
        id: index + 1,
        text,
        completed: false
      });
    });
  }
  
  return steps;
}

function extractQuizQuestions(quizContent) {
  const questions = [];
  
  // Détecter les questions avec leur format
  const questionRegex = /\*\*Question( \d+)?\*\*\s*:\s*([^\n]+)([\s\S]*?)(?=\*\*Question|\*\*Explication|###|$)/g;
  let questionMatch;
  let questionId = 1;
  
  while ((questionMatch = questionRegex.exec(quizContent)) !== null) {
    const questionText = questionMatch[2].trim();
    const questionContent = questionMatch[3];
    
    // Extraire les options
    const options = [];
    let correctAnswer = -1;
    const optionMatches = questionContent.match(/- \[([ x])\] ([^\n]+)/g) || [];
    
    optionMatches.forEach((option, index) => {
      const isCorrect = option.includes('[x]');
      const text = option.replace(/- \[[ x]\] /, '').trim();
      
      options.push(text);
      if (isCorrect) correctAnswer = index;
    });
    
    // Extraire l'explication
    const explanation = questionContent.match(/\*\*Explication\*\*\s*:\s*([^\n*]+)/)?.[1]?.trim();
    
    // Détecter le type de question
    let type = 'multiple';
    if (questionText.toLowerCase().includes('vrai ou faux')) {
      type = 'boolean';
    } else if (options.length === 0) {
      type = 'text';
    }
    
    if (questionText && (options.length > 0 || type === 'text')) {
      questions.push({
        id: questionId,
        question: questionText,
        type,
        options,
        correctAnswer,
        explanation,
        points: 10
      });
      questionId++;
    }
  }
  
  return questions;
}

function extractCheckpointRequirements(content) {
  const requirements = [];
  const reqRegex = /- \[ \] ([^\n]+)/g;
  let match;
  let reqId = 1;
  
  while ((match = reqRegex.exec(content)) !== null) {
    requirements.push({
      id: reqId,
      text: match[1].trim(),
      completed: false
    });
    reqId++;
  }
  
  return requirements;
}

// ==========================================
// GÉNÉRATION AUTOMATIQUE DE DÉFIS
// ==========================================

function generateAutoChallenges(objectives, difficulty = 'intermédiaire') {
  const challenges = [];
  const difficultyConfig = {
    'débutant': { xpBase: 75, timeMultiplier: 1.2 },
    'intermédiaire': { xpBase: 100, timeMultiplier: 1.0 },
    'avancé': { xpBase: 150, timeMultiplier: 0.8 },
    'expert': { xpBase: 200, timeMultiplier: 0.6 }
  };
  
  const config = difficultyConfig[difficulty] || difficultyConfig.intermédiaire;
  
  objectives.forEach((objective, index) => {
    const xp = config.xpBase * (index + 1);
    const estimatedTime = Math.round(15 * config.timeMultiplier * (index + 1));
    
    challenges.push({
      id: `auto-challenge-${index + 1}`,
      title: `Mission ${index + 1}`,
      difficulty,
      xp,
      estimatedTime,
      mission: objective,
      criteria: [
        {
          id: 1,
          text: "Compréhension de l'objectif",
          completed: false,
          required: true
        },
        {
          id: 2,
          text: "Application pratique",
          completed: false,
          required: true
        }
      ],
      steps: [
        {
          id: 1,
          text: "Analyser l'objectif d'apprentissage",
          completed: false
        },
        {
          id: 2,
          text: "Appliquer les concepts appris",
          completed: false
        },
        {
          id: 3,
          text: "Valider la compréhension",
          completed: false
        }
      ],
      type: 'auto-generated',
      unlocked: index === 0
    });
  });
  
  return challenges;
}

function generateAutoQuiz(content, moduleTitle) {
  // Extraire les concepts clés du contenu
  const concepts = extractKeyConcepts(content);
  const questions = [];
  
  concepts.forEach((concept, index) => {
    if (index < 3) { // Maximum 3 questions auto-générées
      questions.push({
        id: index + 1,
        question: `Quelle est la définition de ${concept.term} ?`,
        type: 'multiple',
        options: [
          concept.definition,
          generateDistractor(concept),
          generateDistractor(concept),
          generateDistractor(concept)
        ],
        correctAnswer: 0,
        explanation: `${concept.term} : ${concept.definition}`,
        points: 10
      });
    }
  });
  
  return {
    id: 'auto-quiz',
    title: `Quiz : ${moduleTitle}`,
    questions,
    passingGrade: 70,
    randomize: true,
    showExplanations: true
  };
}

function extractKeyConcepts(content) {
  const concepts = [];
  const contentStr = String(content || '');
  
  // Détecter les définitions avec des patterns comme "Le/La X est..."
  const definitionRegex = /(?:Le|La|Les|Un|Une)\s+([A-Z][a-zA-Zàâäéèêëïîôùûüÿç\s-]+)\s+(?:est|sont|désigne|représente)\s+([^.!?]+[.!?])/g;
  let match;
  
  while ((match = definitionRegex.exec(contentStr)) !== null) {
    const term = match[1].trim();
    const definition = match[2].trim();
    
    if (term.length > 3 && term.length < 50 && definition.length > 10) {
      concepts.push({
        term,
        definition: definition.replace(/[.!?]$/, '')
      });
    }
  }
  
  return concepts;
}

function generateDistractor(concept) {
  // Générer des distracteurs plausibles mais incorrects
  const templates = [
    `Une technique différente de ${concept.term.toLowerCase()}`,
    `L'opposé de ${concept.term.toLowerCase()}`,
    `Une variante complexe de ${concept.term.toLowerCase()}`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

// ==========================================
// INTÉGRATION DANS LA FONCTION PRINCIPALE
// ==========================================

// Modifier extractAdvancedModules pour inclure les éléments interactifs
function extractAdvancedModulesWithInteractivity(content) {
  const modules = extractAdvancedModules(content); // Fonction existante
  
  // Ajouter les éléments interactifs à chaque module
  modules.forEach(module => {
    const interactiveElements = extractInteractiveElements(module.content);
    
    // Si pas d'éléments interactifs détectés, en générer automatiquement
    if (interactiveElements.challenges.length === 0 && module.type !== 'introduction') {
      // Générer des défis basés sur le contenu du module
      const objectives = extractObjectivesFromContent(module.content);
      if (objectives.length > 0) {
        interactiveElements.challenges = generateAutoChallenges(objectives);
      }
    }
    
    if (interactiveElements.quizzes.length === 0 && module.content.length > 500) {
      // Générer un quiz automatique pour les modules substantiels
      const autoQuiz = generateAutoQuiz(module.content, module.title);
      if (autoQuiz.questions.length > 0) {
        interactiveElements.quizzes.push(autoQuiz);
      }
    }
    
    // Ajouter au module
    module.interactiveElements = interactiveElements;
    module.totalXP = interactiveElements.challenges.reduce((sum, c) => sum + c.xp, 0);
    
    // Mettre à jour les composants détectés
    if (interactiveElements.challenges.length > 0) {
      module.components.push({ type: 'ChallengeBlock', count: interactiveElements.challenges.length });
    }
    if (interactiveElements.quizzes.length > 0) {
      module.components.push({ type: 'QuizBlock', count: interactiveElements.quizzes.length });
    }
    if (interactiveElements.simulations.length > 0) {
      module.components.push({ type: 'SimulationBlock', count: interactiveElements.simulations.length });
    }
  });
  
  return modules;
}

function extractObjectivesFromContent(content) {
  // Extraire des objectifs implicites du contenu
  const objectives = [];
  const contentStr = String(content || '');
  
  // Détecter les sections avec "Exercice", "Exemple", "Application"
  const exerciseRegex = /(?:Exercice|Exemple|Application)\s*[:\-]?\s*([^#\n]+)/gi;
  let match;
  
  while ((match = exerciseRegex.exec(contentStr)) !== null) {
    const objective = match[1].trim();
    if (objective.length > 10 && objective.length < 100) {
      objectives.push(objective);
    }
  }
  
  return objectives;
}