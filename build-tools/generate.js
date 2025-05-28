import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';
import { marked } from 'marked';

// Configuration des chemins
const FORMATIONS_DIR = './formations';
const PUBLIC_DIR = './public';
const GENERATED_DIR = './public/generated';
const SRC_DIR = './src';

// Configuration du renderer Marked
const renderer = new marked.Renderer();

// Personnaliser le rendu des titres pour ajouter des IDs
renderer.heading = function(text, level) {
  const id = text.toLowerCase()
    .replace(/[^\w\s-]/g, '') // Supprimer caractères spéciaux
    .replace(/\s+/g, '-')     // Remplacer espaces par tirets
    .trim();
  
  return `<h${level} id="${id}" class="heading-${level}">${text}</h${level}>`;
};

// Personnaliser le rendu des liens
renderer.link = function(href, title, text) {
  const titleAttr = title ? ` title="${title}"` : '';
  
  // Vérifier si c'est un lien externe
  if (href.startsWith('http')) {
    return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer" class="external-link">${text}</a>`;
  }
  
  return `<a href="${href}"${titleAttr} class="internal-link">${text}</a>`;
};

// Personnaliser le rendu des blockquotes
renderer.blockquote = function(quote) {
  // Détecter les types de blockquotes spéciaux
  if (quote.includes('📹')) {
    return `<div class="video-callout">${quote}</div>`;
  } else if (quote.includes('⚠️')) {
    return `<div class="warning-callout">${quote}</div>`;
  } else if (quote.includes('💡')) {
    return `<div class="tip-callout">${quote}</div>`;
  }
  
  return `<blockquote class="standard-quote">${quote}</blockquote>`;
};

// Configuration Marked
marked.setOptions({
  renderer: renderer,
  highlight: function(code, lang) {
    // Ici on pourrait intégrer Prism.js pour la coloration syntaxique
    return `<pre><code class="language-${lang || 'text'}">${code}</code></pre>`;
  },
  pedantic: false,
  gfm: true,
  breaks: false,
  sanitize: false,
  smartypants: false,
  xhtml: false
});

/**
 * Extrait les modules d'une formation basée sur les titres H1
 */
function extractModules(content, frontMatter) {
  const modules = [];
  const lines = content.split('\n');
  let currentModule = null;
  let currentContent = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Détecter un nouveau module (titre H1)
    if (line.startsWith('# ') && !line.includes('===')) {
      // Sauvegarder le module précédent
      if (currentModule) {
        currentModule.content = currentContent.join('\n').trim();
        currentModule.htmlContent = marked(currentModule.content);
        modules.push(currentModule);
      }
      
      // Créer un nouveau module
      const title = line.replace('# ', '').trim();
      const id = title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      
      currentModule = {
        id: id,
        title: title,
        order: modules.length + 1,
        content: '',
        htmlContent: '',
        estimatedDuration: estimateReadingTime(currentContent.join('\n'))
      };
      
      currentContent = [];
    } else if (currentModule) {
      currentContent.push(line);
    }
  }
  
  // Ajouter le dernier module
  if (currentModule) {
    currentModule.content = currentContent.join('\n').trim();
    currentModule.htmlContent = marked(currentModule.content);
    currentModule.estimatedDuration = estimateReadingTime(currentModule.content);
    modules.push(currentModule);
  }
  
  return modules;
}

/**
 * Estime le temps de lecture d'un contenu
 */
function estimateReadingTime(content) {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return Math.max(1, minutes); // Minimum 1 minute
}

/**
 * Valide les métadonnées d'une formation
 */
function validateFormationData(data, filename) {
  const errors = [];
  const required = ['title', 'type', 'duration', 'instructor'];
  
  required.forEach(field => {
    if (!data[field]) {
      errors.push(`Champ requis manquant: ${field}`);
    }
  });
  
  // Validation du type
  const validTypes = ['equipment', 'skills', 'safety', 'general'];
  if (data.type && !validTypes.includes(data.type)) {
    errors.push(`Type invalide: ${data.type}. Types valides: ${validTypes.join(', ')}`);
  }
  
  // Validation de la durée
  if (data.duration && (typeof data.duration !== 'number' || data.duration <= 0)) {
    errors.push('La durée doit être un nombre positif (en minutes)');
  }
  
  // Validation des ressources
  if (data.resources) {
    if (data.resources.videos) {
      data.resources.videos.forEach((video, index) => {
        if (!video.title || !video.file) {
          errors.push(`Vidéo ${index + 1}: titre et fichier requis`);
        }
      });
    }
    
    if (data.resources.documents) {
      data.resources.documents.forEach((doc, index) => {
        if (!doc.title || !doc.file) {
          errors.push(`Document ${index + 1}: titre et fichier requis`);
        }
      });
    }
  }
  
  if (errors.length > 0) {
    console.error(`❌ Erreurs dans ${filename}:`);
    errors.forEach(error => console.error(`   - ${error}`));
    return false;
  }
  
  return true;
}

/**
 * Génère les données d'une formation
 */
async function processFormation(filePath) {
  console.log(`📄 Traitement de: ${path.basename(filePath)}`);
  
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    const { data: frontMatter, content } = matter(fileContent);
    
    // Validation des données
    if (!validateFormationData(frontMatter, path.basename(filePath))) {
      return null;
    }
    
    // Extraction des modules
    const modules = extractModules(content, frontMatter);
    
    // Calcul de la durée totale estimée
    const estimatedTotalDuration = modules.reduce((total, module) => 
      total + module.estimatedDuration, 0
    );
    
    // Création de l'objet formation complet
    const formation = {
      // Métadonnées de base
      ...frontMatter,
      
      // Informations de fichier
      slug: path.basename(filePath, '.md'),
      filename: path.basename(filePath),
      lastProcessed: new Date().toISOString(),
      
      // Contenu structuré
      modules: modules,
      moduleCount: modules.length,
      
      // Statistiques
      estimatedTotalDuration: estimatedTotalDuration,
      wordCount: content.split(/\s+/).length,
      
      // Navigation
      tableOfContents: modules.map(module => ({
        id: module.id,
        title: module.title,
        order: module.order,
        duration: module.estimatedDuration
      })),
      
      // Contenu HTML complet (pour recherche)
      htmlContent: marked(content),
      rawContent: content
    };
    
    // Ajouter des données spécifiques selon le type
    if (frontMatter.type === 'equipment' && frontMatter.equipment) {
      formation.equipmentSpecs = frontMatter.equipment;
    }
    
    console.log(`   ✅ ${modules.length} modules traités`);
    console.log(`   📊 Durée estimée: ${estimatedTotalDuration} minutes`);
    
    return formation;
    
  } catch (error) {
    console.error(`❌ Erreur lors du traitement de ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Génère l'index des formations
 */
function generateFormationsIndex(formations) {
  const index = {
    totalFormations: formations.length,
    lastGenerated: new Date().toISOString(),
    
    // Statistiques globales
    stats: {
      byType: {},
      byDifficulty: {},
      totalDuration: 0,
      totalModules: 0
    },
    
    // Liste des formations avec métadonnées essentielles
    formations: formations.map(formation => ({
      slug: formation.slug,
      title: formation.title,
      type: formation.type,
      company: formation.company,
      duration: formation.duration,
      difficulty: formation.difficulty,
      instructor: formation.instructor,
      moduleCount: formation.moduleCount,
      estimatedTotalDuration: formation.estimatedTotalDuration,
      lastUpdated: formation.last_updated,
      version: formation.version,
      // Première phrase de description si disponible
      description: formation.learning_objectives ? 
        formation.learning_objectives[0] : 
        'Formation professionnelle'
    })),
    
    // Index de recherche
    searchIndex: formations.map(formation => ({
      slug: formation.slug,
      title: formation.title,
      type: formation.type,
      keywords: [
        formation.title,
        formation.type,
        formation.company,
        formation.instructor,
        ...(formation.learning_objectives || []),
        ...(formation.prerequisites || [])
      ].filter(Boolean).join(' ').toLowerCase()
    }))
  };
  
  // Calculer les statistiques
  formations.forEach(formation => {
    // Par type
    index.stats.byType[formation.type] = 
      (index.stats.byType[formation.type] || 0) + 1;
    
    // Par difficulté
    if (formation.difficulty) {
      index.stats.byDifficulty[formation.difficulty] = 
        (index.stats.byDifficulty[formation.difficulty] || 0) + 1;
    }
    
    // Totaux
    index.stats.totalDuration += formation.duration || 0;
    index.stats.totalModules += formation.moduleCount || 0;
  });
  
  return index;
}

/**
 * Copie les assets nécessaires
 */
async function copyAssets() {
  console.log('📁 Copie des assets...');
  
  try {
    // S'assurer que les dossiers de destination existent
    await fs.ensureDir(`${PUBLIC_DIR}/assets/images`);
    await fs.ensureDir(`${PUBLIC_DIR}/assets/videos`);
    await fs.ensureDir(`${PUBLIC_DIR}/assets/documents`);
    
    // Copier les assets depuis le dossier formations si ils existent
    const assetsDir = `${FORMATIONS_DIR}/assets`;
    if (await fs.pathExists(assetsDir)) {
      await fs.copy(assetsDir, `${PUBLIC_DIR}/assets`, { overwrite: true });
      console.log('   ✅ Assets copiés');
    } else {
      console.log('   ℹ️  Aucun dossier assets trouvé');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la copie des assets:', error.message);
  }
}

/**
 * Génère le fichier de configuration pour React
 */
function generateReactConfig(formations) {
  const config = {
    // Configuration générale
    app: {
      name: 'Formation Generator',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    },
    
    // Paramètres des formations
    formations: {
      basePath: '/formations',
      defaultTheme: 'industrial',
      supportedFormats: ['video', 'document', 'interactive']
    },
    
    // Types de templates disponibles
    templates: {
      equipment: 'EquipmentTemplate',
      skills: 'SkillsTemplate',
      safety: 'SafetyTemplate',
      general: 'GeneralTemplate'
    },
    
    // Thèmes disponibles
    themes: {
      industrial: {
        primary: '#1e40af',
        accent: '#f59e0b',
        background: '#f8fafc'
      },
      corporate: {
        primary: '#059669',
        accent: '#dc2626',
        background: '#ffffff'
      }
    }
  };
  
  return config;
}

/**
 * Fonction principale de génération
 */
async function main() {
  console.log('🚀 Démarrage de la génération des formations...\n');
  
  try {
    // Créer les dossiers nécessaires
    await fs.ensureDir(GENERATED_DIR);
    
    // Rechercher tous les fichiers Markdown
    const formationFiles = await glob(`${FORMATIONS_DIR}/**/*.md`);
    
    if (formationFiles.length === 0) {
      console.log('⚠️  Aucun fichier de formation trouvé dans ./formations/');
      console.log('   Créez vos formations en format .md dans ce dossier');
      return;
    }
    
    console.log(`📚 ${formationFiles.length} formation(s) trouvée(s):\n`);
    
    // Traiter chaque formation
    const formations = [];
    for (const filePath of formationFiles) {
      const formation = await processFormation(filePath);
      if (formation) {
        formations.push(formation);
        
        // Sauvegarder la formation individuelle
        const outputPath = `${GENERATED_DIR}/${formation.slug}.json`;
        await fs.writeJSON(outputPath, formation, { spaces: 2 });
      }
    }
    
    if (formations.length === 0) {
      console.log('❌ Aucune formation valide n\'a pu être générée');
      return;
    }
    
    // Générer l'index des formations
    console.log('\n📋 Génération de l\'index...');
    const index = generateFormationsIndex(formations);
    await fs.writeJSON(`${GENERATED_DIR}/index.json`, index, { spaces: 2 });
    
    // Générer la configuration React
    console.log('⚙️  Génération de la configuration...');
    const config = generateReactConfig(formations);
    await fs.writeJSON(`${GENERATED_DIR}/config.json`, config, { spaces: 2 });
    
    // Copier les assets
    await copyAssets();
    
    // Résumé final
    console.log('\n✨ Génération terminée avec succès!');
    console.log(`📊 Statistiques:`);
    console.log(`   - ${formations.length} formations générées`);
    console.log(`   - ${index.stats.totalModules} modules au total`);
    console.log(`   - ${index.stats.totalDuration} minutes de contenu`);
    console.log(`   - Types: ${Object.keys(index.stats.byType).join(', ')}`);
    
    console.log('\n📁 Fichiers générés:');
    console.log(`   - ${GENERATED_DIR}/index.json`);
    console.log(`   - ${GENERATED_DIR}/config.json`);
    formations.forEach(f => {
      console.log(`   - ${GENERATED_DIR}/${f.slug}.json`);
    });
    
  } catch (error) {
    console.error('💥 Erreur fatale:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Exécuter le script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default main;