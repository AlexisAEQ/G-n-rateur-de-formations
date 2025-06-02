import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';
import { marked } from 'marked';

console.log('🚀 GÉNÉRATION AVANCÉE AVEC TOUS LES OUTILS (VERSION MODIFIÉE POUR MIEUX INTÉGRER enhanced_tailwind_css)');

// ==========================================
// CONFIGURATION DES OUTILS DISPONIBLES
// ==========================================

// Configuration Marked avec renderer personnalisé
const renderer = new marked.Renderer();

// Personnaliser les titres pour être stylisés par prose et enhanced_tailwind_css
renderer.heading = function(text, level) {
  const cleanText = String(text || '').trim();
  const id = cleanText.toLowerCase()
    .replace(/[^\w\s-]/g, '') // Supprimer les caractères non alphanumériques sauf espaces et tirets
    .replace(/\s+/g, '-')     // Remplacer les espaces par des tirets
    .trim();
  
  // Génère des titres "propres", laissant prose (via .module-content) gérer le style.
  // Les styles pour h1, h2, etc. (y compris les effets de survol) dans enhanced_tailwind_css s'appliqueront.
  return `<h${level} id="${id}">${cleanText}</h${level}>`;
};

// Personnaliser les liens pour être stylisés par prose et enhanced_tailwind_css
renderer.link = function(href, title, text) {
  const titleAttr = title ? ` title="${title}"` : '';
  const isExternal = String(href || '').startsWith('http');
  
  // Génère des liens "propres". Les styles de .module-content a dans enhanced_tailwind_css s'appliqueront.
  if (isExternal) {
    return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
  }
  
  return `<a href="${href}"${titleAttr}>${text}</a>`;
};

// Personnaliser les blockquotes pour les callouts, en utilisant les classes de enhanced_tailwind_css
renderer.blockquote = function(quote) {
  const quoteStr = String(quote || '');
  // Retirer le <p></p> potentiellement ajouté par marked à l'intérieur du blockquote pour les callouts
  const innerContent = quoteStr.replace(/^<p>|<\/p>$/g, '');

  if (quoteStr.includes('📹')) { // Vidéo
    // Utilise la classe .video-callout définie dans enhanced_tailwind_css
    return `<div class="video-callout">${innerContent}</div>`;
  } else if (quoteStr.includes('⚠️')) { // Avertissement
    // Utilise la classe .warning-callout définie dans enhanced_tailwind_css
    return `<div class="warning-callout">${innerContent}</div>`;
  } else if (quoteStr.includes('💡')) { // Astuce
    // Utilise la classe .tip-callout définie dans enhanced_tailwind_css
    return `<div class="tip-callout">${innerContent}</div>`;
  } else if (quoteStr.includes('🔐')) { // Sécurité (mapped to warning-callout for red theme)
    // Utilise la classe .warning-callout (thème rouge) pour la sécurité.
    // Vous pourriez créer une classe .safety-callout distincte dans enhanced_tailwind_css si besoin.
    return `<div class="warning-callout">${innerContent}</div>`;
  }
  
  // Pour les blockquotes standard, génère une balise simple.
  // Les styles de .module-content blockquote dans enhanced_tailwind_css s'appliqueront.
  return `<blockquote>${quote}</blockquote>`;
};

// Configuration Marked avec toutes les options
marked.setOptions({
  renderer: renderer,
  pedantic: false,
  gfm: true,
  breaks: false,
  sanitize: false, // Soyez conscient des implications de sécurité si le contenu Markdown n'est pas sûr
  smartypants: true,
  xhtml: false
});

// ==========================================
// TEMPLATES ET COMPOSANTS DISPONIBLES
// (Pas de changement ici, sauf si la logique de mapping doit changer)
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
// (Pas de changement majeur ici, cleanObject et safeMarkdown sont utiles)
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
    
    const cleanedContent = contentStr.replace(/\[object Object\]/g, '');
    
    return marked(cleanedContent);
  } catch (error) {
    console.log(`   ⚠️  Erreur markdown ignorée: ${error.message}`);
    return `<p>${String(content || '')}</p>`; // Fallback simple
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
  // Utiliser une expression régulière pour mieux capturer les titres de module H1 Markdown
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
        prevModule.htmlContent = safeMarkdown(previousModuleContent);
        prevModule.components = extractModuleComponents(previousModuleContent);
        prevModule.estimatedDuration = calculateDuration(previousModuleContent);
      }
    }

    const titleWithEmoji = match[1].trim();
    const title = titleWithEmoji.replace(/^[🤖⚙️🎯🛡️📚🔧🔍📝📊✅🚨📄]+\s*/, '').trim();
    const emoji = titleWithEmoji.match(/^[🤖⚙️🎯🛡️📚🔧🔍📝📊✅🚨📄]+/)?.[0] || '📄';
    
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
      content: '', // Sera rempli avec le contenu jusqu'au prochain H1 ou la fin
      htmlContent: '',
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
    lastMod.htmlContent = safeMarkdown(lastModuleContent);
    lastMod.components = extractModuleComponents(lastModuleContent);
    lastMod.estimatedDuration = calculateDuration(lastModuleContent);
  } else if (contentStr && modules.length === 0) {
    // Gérer le cas où il n'y a pas de H1 pour les modules, mais il y a du contenu
    // Considérer l'ensemble du contenu comme un seul module
    const title = "Contenu Principal";
    const id = "main-content";
    modules.push({
        id: id,
        title: title,
        titleWithEmoji: `📄 ${title}`,
        emoji: '📄',
        order: 1,
        content: contentStr,
        htmlContent: safeMarkdown(contentStr),
        components: extractModuleComponents(contentStr),
        estimatedDuration: calculateDuration(contentStr),
        type: 'content'
    });
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
    // Note: le renderer.blockquote s'occupe de la transformation en HTML avec la bonne classe
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
  interactiveTime += callouts * 1; // Réduit à 1 min par callout pour ne pas surévaluer
  
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
          module: module, // Assurez-vous que l'objet module complet est passé
          formationTitle: formation.title, // Exemple de prop supplémentaire
          primaryColor: formation.primary_color // Passer les couleurs si ModuleCard les utilise
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
      console.log(`\n⚙️  Traitement avancé: ${filename}`);

      try {
        const content = await fs.readFile(filePath, 'utf8');
        
        let frontMatter = {};
        let markdownContent = content;
        
        try {
          const parsed = matter(content);
          frontMatter = parsed.data || {};
          markdownContent = parsed.content || '';
        } catch (parseError) {
          console.log(`   ⚠️  Erreur parsing front matter pour ${filename}: ${parseError.message}`);
          console.log(`   ℹ️  Utilisation du contenu brut pour ${filename}`);
        }

        frontMatter = cleanObject(frontMatter);

        const detectedType = detectFormationType(frontMatter, markdownContent);
        console.log(`   🎯 Type détecté pour ${filename}: ${detectedType}`);

        const modules = extractAdvancedModules(markdownContent);
        console.log(`   📚 ${modules.length} module(s) trouvé(s) dans ${filename}`);
        if (modules.length === 0 && markdownContent.trim() !== '') {
            console.log(`   ⚠️ Aucun module (titre H1) détecté dans ${filename} alors que du contenu est présent. Le contenu sera traité comme un seul module.`);
        }


        const estimatedTotalDuration = modules.reduce((total, module) => 
          total + (module.estimatedDuration || 0), 0);

        const slug = (frontMatter.slug || path.basename(filePath, '.md'))
          .toLowerCase()
          .replace(/[^\w\s-]/g, '') // Supprimer les caractères spéciaux sauf espaces et tirets
          .replace(/\s+/g, '-')     // Remplacer les espaces par des tirets
          .replace(/-+/g, '-')      // Remplacer les tirets multiples par un seul
          .replace(/^-|-$/g, '')    // Supprimer les tirets en début/fin
          || 'formation-sans-nom'; // Fallback pour slug vide


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
          generatorVersion: '1.0.1', // Version updated
          modules: modules,
          moduleCount: modules.length,
          estimatedTotalDuration: estimatedTotalDuration,
          tableOfContents: modules.map(module => ({
            id: module.id,
            title: module.titleWithEmoji, // Utiliser titleWithEmoji pour la TOC
            // emoji: module.emoji, // Déjà dans titleWithEmoji
            order: module.order,
            duration: module.estimatedDuration,
            type: module.type,
            components: (module.components || []).map(c => c.type)
          })),
          searchableContent: [
            frontMatter.title,
            ...modules.map(m => m.title), // Utiliser title simple pour la recherche
            ...(frontMatter.learning_objectives || []),
            ...(frontMatter.prerequisites || [])
          ].filter(Boolean).join(' ').toLowerCase().replace(/[^\w\s-]/g, ''), // Nettoyer le contenu de recherche
          qualityScore: calculateQualityScore(modules, frontMatter),
          rawContent: markdownContent, // Le contenu Markdown brut original des modules combinés
          // htmlContent global n'est plus pertinent si chaque module a son htmlContent
        };
        
        // Nettoyage final de l'objet formation complet
        const cleanedFormation = cleanObject(formation);
        
        // Le componentMapping est généré sur l'objet formation nettoyé
        cleanedFormation.componentMapping = generateComponentMapping(cleanedFormation);


        formations.push(cleanedFormation);

        await fs.writeJSON(`./public/generated/${slug}.json`, cleanedFormation, { spaces: 2 });
        console.log(`   ✅ ${slug}.json (score: ${cleanedFormation.qualityScore}/100) généré.`);

      } catch (error) {
        console.log(`   ❌ Erreur lors du traitement de ${filename}: ${error.message}`);
        console.log(`   📝 Stack: ${error.stack.split('\n').slice(0,3).join('\n')}`); // Short stack
      }
    }

    if (formations.length > 0) {
        console.log('\n📋 Génération de l\'index enrichi...');
        const index = {
          totalFormations: formations.length,
          lastGenerated: new Date().toISOString(),
          formations: formations.map(f => ({
            slug: f.slug,
            title: f.title,
            type: f.type,
            company: f.company,
            duration: f.duration, // Conserver la durée originale ou estimée
            difficulty: f.difficulty,
            moduleCount: f.moduleCount,
            estimatedDuration: f.estimatedTotalDuration, // Durée calculée
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
        console.log('   ✅ index.json généré.');

        console.log('⚙️  Génération de la configuration avancée...');
        const config = {
          app: {
            name: 'Formation Generator',
            version: '1.0.1', // Version updated
            buildDate: new Date().toISOString()
          },
          formations: {
            basePath: '/formations', // Chemin public si les JSON sont servis
            total: formations.length
          },
          templates: TEMPLATES // Informations sur les templates disponibles
        };
        await fs.writeJSON('./public/generated/config.json', config, { spaces: 2 });
        console.log('   ✅ config.json généré.');

        console.log(`\n🎉 GÉNÉRATION AVANCÉE TERMINÉE !`);
        console.log(`📊 Statistiques:`);
        console.log(`   - ${formations.length} formations traitées.`);
        const avgScore = Math.round(formations.reduce((sum, f) => sum + f.qualityScore, 0) / formations.length);
        const totalDurationSum = formations.reduce((sum, f) => sum + f.estimatedTotalDuration, 0);
        console.log(`   - ${totalDurationSum} minutes de contenu total estimé.`);
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