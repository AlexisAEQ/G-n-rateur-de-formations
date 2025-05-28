import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';

// Configuration des chemins
const FORMATIONS_DIR = './formations';
const ASSETS_DIR = './public/assets';
const GENERATED_DIR = './public/generated';

// Règles de validation
const VALIDATION_RULES = {
  // Champs obligatoires par type de formation
  requiredFields: {
    all: ['title', 'type', 'duration', 'instructor', 'learning_objectives'],
    equipment: ['equipment.name', 'equipment.manufacturer'],
    skills: ['difficulty'],
    safety: ['assessment'],
    general: []
  },
  
  // Types de formation valides
  validTypes: ['equipment', 'skills', 'safety', 'general'],
  
  // Niveaux de difficulté valides
  validDifficulties: ['débutant', 'intermédiaire', 'avancé', 'expert'],
  
  // Thèmes valides
  validThemes: ['industrial', 'corporate', 'safety', 'custom'],
  
  // Extensions de fichiers multimédias acceptées
  validExtensions: {
    videos: ['.mp4', '.webm', '.avi', '.mov', '.mkv'],
    images: ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'],
    documents: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xlsx', '.xls']
  },
  
  // Limites
  limits: {
    titleMaxLength: 100,
    minDuration: 5,
    maxDuration: 480,
    maxObjectives: 10,
    maxPrerequisites: 8,
    minModules: 1,
    maxModules: 20,
    minWords: 50
  }
};

// Statistiques globales
let globalStats = {
  totalFiles: 0,
  validFiles: 0,
  invalidFiles: 0,
  totalErrors: 0,
  totalWarnings: 0,
  processingTime: 0
};

/**
 * Classe pour gérer les résultats de validation
 */
class ValidationResult {
  constructor(filename) {
    this.filename = filename;
    this.errors = [];
    this.warnings = [];
    this.isValid = true;
    this.stats = {
      moduleCount: 0,
      wordCount: 0,
      hasResources: false,
      hasAssessment: false
    };
  }
  
  addError(message, field = null, severity = 'high') {
    this.errors.push({ message, field, severity, type: 'error' });
    this.isValid = false;
    globalStats.totalErrors++;
  }
  
  addWarning(message, field = null, severity = 'medium') {
    this.warnings.push({ message, field, severity, type: 'warning' });
    globalStats.totalWarnings++;
  }
  
  hasIssues() {
    return this.errors.length > 0 || this.warnings.length > 0;
  }
  
  getSummary() {
    return {
      filename: this.filename,
      isValid: this.isValid,
      errorCount: this.errors.length,
      warningCount: this.warnings.length,
      stats: this.stats
    };
  }
  
  print() {
    if (!this.hasIssues() && this.isValid) {
      console.log(`✅ ${this.filename} - Validation réussie`);
      return;
    }
    
    console.log(`\n📄 ${this.filename}:`);
    
    if (this.errors.length > 0) {
      console.log(`  ❌ ${this.errors.length} erreur(s):`);
      this.errors.forEach((error, index) => {
        const fieldInfo = error.field ? ` [${error.field}]` : '';
        console.log(`     ${index + 1}. ${error.message}${fieldInfo}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log(`  ⚠️  ${this.warnings.length} avertissement(s):`);
      this.warnings.forEach((warning, index) => {
        const fieldInfo = warning.field ? ` [${warning.field}]` : '';
        console.log(`     ${index + 1}. ${warning.message}${fieldInfo}`);
      });
    }
  }
}

/**
 * Vérifie si un fichier existe
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valide la structure et syntaxe du fichier Markdown
 */
function validateFileStructure(fileContent, result) {
  try {
    const { data, content } = matter(fileContent);
    
    if (!data || Object.keys(data).length === 0) {
      result.addError('Aucune métadonnée YAML trouvée (front matter manquant)');
      return { frontMatter: {}, content: '' };
    }
    
    if (!content || content.trim().length === 0) {
      result.addError('Contenu Markdown vide');
      return { frontMatter: data, content: '' };
    }
    
    return { frontMatter: data, content };
    
  } catch (error) {
    result.addError(`Erreur de parsing du fichier: ${error.message}`);
    return { frontMatter: {}, content: '' };
  }
}

/**
 * Valide les métadonnées de base
 */
function validateBasicMetadata(data, result) {
  const { title, type, duration, instructor, company, version, last_updated } = data;
  
  // Titre
  if (!title) {
    result.addError('Le titre est obligatoire', 'title');
  } else if (typeof title !== 'string') {
    result.addError('Le titre doit être une chaîne de caractères', 'title');
  } else if (title.length > VALIDATION_RULES.limits.titleMaxLength) {
    result.addWarning(`Titre trop long (${title.length} caractères, max ${VALIDATION_RULES.limits.titleMaxLength})`, 'title');
  }
  
  // Type
  if (!type) {
    result.addError('Le type de formation est obligatoire', 'type');
  } else if (!VALIDATION_RULES.validTypes.includes(type)) {
    result.addError(`Type invalide: "${type}". Types valides: ${VALIDATION_RULES.validTypes.join(', ')}`, 'type');
  }
  
  // Durée
  if (!duration) {
    result.addError('La durée est obligatoire', 'duration');
  } else if (typeof duration !== 'number' || duration <= 0) {
    result.addError('La durée doit être un nombre positif (en minutes)', 'duration');
  } else {
    if (duration < VALIDATION_RULES.limits.minDuration) {
      result.addWarning(`Durée très courte (${duration} min, minimum recommandé: ${VALIDATION_RULES.limits.minDuration} min)`, 'duration');
    }
    if (duration > VALIDATION_RULES.limits.maxDuration) {
      result.addWarning(`Durée très longue (${duration} min, maximum recommandé: ${VALIDATION_RULES.limits.maxDuration} min)`, 'duration');
    }
  }
  
  // Instructeur
  if (!instructor) {
    result.addError('Le nom de l\'instructeur est obligatoire', 'instructor');
  } else if (typeof instructor !== 'string') {
    result.addError('Le nom de l\'instructeur doit être une chaîne de caractères', 'instructor');
  }
  
  // Optionnels avec avertissements
  if (!company) {
    result.addWarning('Le nom de l\'entreprise est recommandé', 'company');
  }
  
  if (!version) {
    result.addWarning('Un numéro de version est recommandé', 'version');
  }
  
  // Validation de la date
  if (last_updated) {
    const date = new Date(last_updated);
    if (isNaN(date.getTime())) {
      result.addWarning('Format de date invalide pour last_updated (utilisez YYYY-MM-DD)', 'last_updated');
    }
  } else {
    result.addWarning('Date de dernière mise à jour recommandée', 'last_updated');
  }
  
  // Validation de la difficulté
  if (data.difficulty && !VALIDATION_RULES.validDifficulties.includes(data.difficulty)) {
    result.addError(`Niveau de difficulté invalide: "${data.difficulty}". Niveaux valides: ${VALIDATION_RULES.validDifficulties.join(', ')}`, 'difficulty');
  }
  
  // Validation du thème
  if (data.theme && !VALIDATION_RULES.validThemes.includes(data.theme)) {
    result.addWarning(`Thème non reconnu: "${data.theme}". Thèmes disponibles: ${VALIDATION_RULES.validThemes.join(', ')}`, 'theme');
  }
}

/**
 * Valide les objectifs pédagogiques
 */
function validateLearningObjectives(objectives, result) {
  if (!objectives) {
    result.addError('Les objectifs pédagogiques sont obligatoires', 'learning_objectives');
    return;
  }
  
  if (!Array.isArray(objectives)) {
    result.addError('Les objectifs pédagogiques doivent être un tableau', 'learning_objectives');
    return;
  }
  
  if (objectives.length === 0) {
    result.addError('Au moins un objectif pédagogique est requis', 'learning_objectives');
    return;
  }
  
  if (objectives.length > VALIDATION_RULES.limits.maxObjectives) {
    result.addWarning(`Beaucoup d'objectifs (${objectives.length}, max recommandé: ${VALIDATION_RULES.limits.maxObjectives})`, 'learning_objectives');
  }
  
  objectives.forEach((objective, index) => {
    if (!objective || typeof objective !== 'string') {
      result.addError(`L'objectif ${index + 1} doit être une chaîne de caractères non vide`, 'learning_objectives');
    } else if (objective.length < 10) {
      result.addWarning(`L'objectif ${index + 1} est très court (${objective.length} caractères)`, 'learning_objectives');
    }
  });
}

/**
 * Valide les prérequis
 */
function validatePrerequisites(prerequisites, result) {
  if (!prerequisites) {
    result.addWarning('Les prérequis sont recommandés', 'prerequisites');
    return;
  }
  
  if (!Array.isArray(prerequisites)) {
    result.addError('Les prérequis doivent être un tableau', 'prerequisites');
    return;
  }
  
  if (prerequisites.length > VALIDATION_RULES.limits.maxPrerequisites) {
    result.addWarning(`Beaucoup de prérequis (${prerequisites.length}, max recommandé: ${VALIDATION_RULES.limits.maxPrerequisites})`, 'prerequisites');
  }
  
  prerequisites.forEach((prerequisite, index) => {
    if (!prerequisite || typeof prerequisite !== 'string') {
      result.addError(`Le prérequis ${index + 1} doit être une chaîne de caractères non vide`, 'prerequisites');
    }
  });
}

/**
 * Valide les ressources multimédias
 */
async function validateResources(resources, result) {
  if (!resources) {
    result.addWarning('Aucune ressource multimédia définie - recommandé pour enrichir la formation', 'resources');
    return;
  }
  
  result.stats.hasResources = true;
  
  // Validation des vidéos
  if (resources.videos) {
    if (!Array.isArray(resources.videos)) {
      result.addError('La section videos doit être un tableau', 'resources.videos');
    } else {
      for (let i = 0; i < resources.videos.length; i++) {
        const video = resources.videos[i];
        
        if (!video.title) {
          result.addError(`Vidéo ${i + 1}: le titre est obligatoire`, 'resources.videos');
        }
        
        if (!video.file) {
          result.addError(`Vidéo ${i + 1}: le nom de fichier est obligatoire`, 'resources.videos');
        } else {
          const ext = path.extname(video.file).toLowerCase();
          if (!VALIDATION_RULES.validExtensions.videos.includes(ext)) {
            result.addWarning(`Vidéo ${i + 1}: extension "${ext}" non optimale. Recommandées: ${VALIDATION_RULES.validExtensions.videos.join(', ')}`, 'resources.videos');
          }
          
          // Vérifier l'existence du fichier
          const videoPath = path.join(ASSETS_DIR, 'videos', video.file);
          if (!(await fileExists(videoPath))) {
            result.addWarning(`Vidéo ${i + 1}: fichier "${video.file}" non trouvé dans assets/videos/`, 'resources.videos');
          }
        }
        
        if (video.duration && !/^\d+min$/.test(video.duration)) {
          result.addWarning(`Vidéo ${i + 1}: format de durée recommandé: "Xmin"`, 'resources.videos');
        }
      }
    }
  }
  
  // Validation des documents
  if (resources.documents) {
    if (!Array.isArray(resources.documents)) {
      result.addError('La section documents doit être un tableau', 'resources.documents');
    } else {
      for (let i = 0; i < resources.documents.length; i++) {
        const doc = resources.documents[i];
        
        if (!doc.title) {
          result.addError(`Document ${i + 1}: le titre est obligatoire`, 'resources.documents');
        }
        
        if (!doc.file) {
          result.addError(`Document ${i + 1}: le nom de fichier est obligatoire`, 'resources.documents');
        } else {
          const ext = path.extname(doc.file).toLowerCase();
          if (!VALIDATION_RULES.validExtensions.documents.includes(ext)) {
            result.addWarning(`Document ${i + 1}: extension "${ext}" non reconnue`, 'resources.documents');
          }
          
          const docPath = path.join(ASSETS_DIR, 'documents', doc.file);
          if (!(await fileExists(docPath))) {
            result.addWarning(`Document ${i + 1}: fichier "${doc.file}" non trouvé dans assets/documents/`, 'resources.documents');
          }
        }
      }
    }
  }
  
  // Validation des liens
  if (resources.links) {
    if (!Array.isArray(resources.links)) {
      result.addError('La section links doit être un tableau', 'resources.links');
    } else {
      resources.links.forEach((link, index) => {
        if (!link.title) {
          result.addError(`Lien ${index + 1}: le titre est obligatoire`, 'resources.links');
        }
        
        if (!link.url) {
          result.addError(`Lien ${index + 1}: l'URL est obligatoire`, 'resources.links');
        } else {
          try {
            new URL(link.url);
          } catch {
            result.addError(`Lien ${index + 1}: URL invalide "${link.url}"`, 'resources.links');
          }
        }
      });
    }
  }
}

/**
 * Valide les données spécifiques aux équipements
 */
function validateEquipmentData(equipment, result, formationType) {
  if (formationType !== 'equipment') {
    return;
  }
  
  if (!equipment) {
    result.addError('Les données equipment sont obligatoires pour le type "equipment"', 'equipment');
    return;
  }
  
  if (!equipment.name) {
    result.addError('Le nom de l\'équipement (equipment.name) est obligatoire', 'equipment.name');
  }
  
  if (!equipment.manufacturer) {
    result.addError('Le fabricant (equipment.manufacturer) est obligatoire', 'equipment.manufacturer');
  }
  
  if (!equipment.model) {
    result.addWarning('Le modèle de l\'équipement est fortement recommandé', 'equipment.model');
  }
  
  if (equipment.image) {
    const ext = path.extname(equipment.image).toLowerCase();
    if (!VALIDATION_RULES.validExtensions.images.includes(ext)) {
      result.addWarning(`Extension d'image non optimale: "${ext}"`, 'equipment.image');
    }
  } else {
    result.addWarning('Une image de l\'équipement améliorerait la formation', 'equipment.image');
  }
  
  if (equipment.specs && typeof equipment.specs !== 'object') {
    result.addError('Les spécifications (equipment.specs) doivent être un objet', 'equipment.specs');
  } else if (!equipment.specs) {
    result.addWarning('Les spécifications techniques sont recommandées', 'equipment.specs');
  }
}

/**
 * Valide l'évaluation
 */
function validateAssessment(assessment, result, formationType) {
  if (!assessment) {
    if (formationType === 'safety') {
      result.addError('Une évaluation est obligatoire pour les formations de sécurité', 'assessment');
    } else {
      result.addWarning('Une évaluation est recommandée', 'assessment');
    }
    return;
  }
  
  result.stats.hasAssessment = true;
  
  // Validation des poids
  if (assessment.practical_weight !== undefined && assessment.theory_weight !== undefined) {
    if (typeof assessment.practical_weight !== 'number' || typeof assessment.theory_weight !== 'number') {
      result.addError('Les poids doivent être des nombres', 'assessment');
    } else {
      const total = assessment.practical_weight + assessment.theory_weight;
      if (total !== 100) {
        result.addError(`Les poids doivent totaliser 100% (actuellement: ${total}%)`, 'assessment');
      }
    }
  }
  
  // Validation de la note de passage
  if (assessment.passing_grade !== undefined) {
    if (typeof assessment.passing_grade !== 'number' || assessment.passing_grade < 0 || assessment.passing_grade > 100) {
      result.addError('La note de passage doit être un nombre entre 0 et 100', 'assessment.passing_grade');
    } else if (formationType === 'safety' && assessment.passing_grade < 100) {
      result.addWarning('Les formations de sécurité nécessitent généralement 100% de réussite', 'assessment.passing_grade');
    }
  }
  
  // Validation des exercices
  if (!assessment.exercises) {
    result.addWarning('Des exercices d\'évaluation sont recommandés', 'assessment.exercises');
  } else if (!Array.isArray(assessment.exercises)) {
    result.addError('Les exercices doivent être un tableau', 'assessment.exercises');
  } else if (assessment.exercises.length === 0) {
    result.addWarning('Au moins un exercice d\'évaluation est recommandé', 'assessment.exercises');
  }
}

/**
 * Valide la structure et le contenu Markdown
 */
function validateContent(content, result) {
  if (!content || content.trim().length === 0) {
    result.addError('Le contenu de la formation est vide', 'content');
    return;
  }
  
  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  result.stats.wordCount = wordCount;
  
  if (wordCount < VALIDATION_RULES.limits.minWords) {
    result.addWarning(`Contenu très court (${wordCount} mots, minimum recommandé: ${VALIDATION_RULES.limits.minWords})`, 'content');
  }
  
  // Compter les modules (titres H1 qui ne sont pas des séparateurs)
  const moduleMatches = content.match(/^# [^=]/gm);
  const moduleCount = moduleMatches ? moduleMatches.length : 0;
  result.stats.moduleCount = moduleCount;
  
  if (moduleCount < VALIDATION_RULES.limits.minModules) {
    result.addError(`Aucun module trouvé. Utilisez des titres H1 (# Titre) pour structurer votre formation`, 'content');
  } else if (moduleCount > VALIDATION_RULES.limits.maxModules) {
    result.addWarning(`Beaucoup de modules (${moduleCount}, max recommandé: ${VALIDATION_RULES.limits.maxModules})`, 'content');
  }
  
  // Vérifier la présence d'exercices pratiques
  const exerciseMatches = content.match(/exercice\s+pratique/gi);
  if (!exerciseMatches || exerciseMatches.length === 0) {
    result.addWarning('Aucun exercice pratique détecté - recommandé pour l\'apprentissage actif', 'content');
  }
  
  // Vérifier les callouts de sécurité pour certains types
  const safetyCallouts = content.match(/⚠️|🚨|🛡️/g);
  if (!safetyCallouts) {
    result.addWarning('Aucun callout de sécurité détecté - important pour les formations techniques', 'content');
  }
}

/**
 * Valide un fichier de formation complet
 */
async function validateFormation(filePath) {
  const filename = path.basename(filePath);
  const result = new ValidationResult(filename);
  
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    const { frontMatter, content } = validateFileStructure(fileContent, result);
    
    if (result.errors.length > 0) {
      return result; // Erreurs critiques, arrêter la validation
    }
    
    // Validations des métadonnées
    validateBasicMetadata(frontMatter, result);
    validateLearningObjectives(frontMatter.learning_objectives, result);
    validatePrerequisites(frontMatter.prerequisites, result);
    await validateResources(frontMatter.resources, result);
    validateEquipmentData(frontMatter.equipment, result, frontMatter.type);
    validateAssessment(frontMatter.assessment, result, frontMatter.type);
    
    // Validation du contenu
    validateContent(content, result);
    
    // Validations spécifiques par type
    if (frontMatter.type === 'skills' && !frontMatter.difficulty) {
      result.addWarning('Le niveau de difficulté est fortement recommandé pour les formations de compétences', 'difficulty');
    }
    
  } catch (error) {
    result.addError(`Erreur lors de la lecture du fichier: ${error.message}`, 'file');
  }
  
  return result;
}

/**
 * Génère un rapport de validation détaillé
 */
function generateValidationReport(results) {
  const validResults = results.filter(r => r.isValid);
  const invalidResults = results.filter(r => !r.isValid);
  
  // Analyse des erreurs les plus fréquentes
  const errorFrequency = {};
  const warningFrequency = {};
  
  results.forEach(result => {
    result.errors.forEach(error => {
      const key = error.field || 'general';
      errorFrequency[key] = (errorFrequency[key] || 0) + 1;
    });
    
    result.warnings.forEach(warning => {
      const key = warning.field || 'general';
      warningFrequency[key] = (warningFrequency[key] || 0) + 1;
    });
  });
  
  const report = {
    timestamp: new Date().toISOString(),
    generatorVersion: '1.0.0',
    
    summary: {
      totalFiles: globalStats.totalFiles,
      validFiles: globalStats.validFiles,
      invalidFiles: globalStats.invalidFiles,
      totalErrors: globalStats.totalErrors,
      totalWarnings: globalStats.totalWarnings,
      successRate: Math.round((globalStats.validFiles / globalStats.totalFiles) * 100),
      processingTime: globalStats.processingTime
    },
    
    statistics: {
      errorsByField: Object.entries(errorFrequency)
        .sort(([,a], [,b]) => b - a)
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}),
      warningsByField: Object.entries(warningFrequency)
        .sort(([,a], [,b]) => b - a)
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}),
      averageModules: validResults.length > 0 ? 
        Math.round(validResults.reduce((sum, r) => sum + r.stats.moduleCount, 0) / validResults.length) : 0,
      averageWords: validResults.length > 0 ? 
        Math.round(validResults.reduce((sum, r) => sum + r.stats.wordCount, 0) / validResults.length) : 0
    },
    
    recommendations: [],
    
    files: results.map(result => ({
      filename: result.filename,
      isValid: result.isValid,
      errorCount: result.errors.length,
      warningCount: result.warnings.length,
      stats: result.stats,
      issues: [...result.errors, ...result.warnings]
    }))
  };
  
  // Générer des recommandations
  if (report.summary.totalErrors > 0) {
    const topErrors = Object.entries(errorFrequency).slice(0, 3);
    report.recommendations.push({
      type: 'error',
      priority: 'high',
      message: `Erreurs les plus fréquentes: ${topErrors.map(([field, count]) => `${field} (${count})`).join(', ')}`
    });
  }
  
  if (report.summary.totalWarnings > 0) {
    report.recommendations.push({
      type: 'improvement',
      priority: 'medium',
      message: 'Ajoutez des ressources multimédias et des exercices pratiques pour enrichir vos formations'
    });
  }
  
  if (report.summary.successRate < 100) {
    report.recommendations.push({
      type: 'quality',
      priority: 'medium',
      message: 'Consultez le guide de spécifications pour créer des formations conformes'
    });
  }
  
  return report;
}

/**
 * Fonction principale de validation
 */
async function main() {
  const startTime = Date.now();
  console.log('🔍 Démarrage de la validation des formations...\n');
  
  try {
    // Rechercher tous les fichiers Markdown
    const formationFiles = await glob(`${FORMATIONS_DIR}/**/*.md`);
    
    if (formationFiles.length === 0) {
      console.log('⚠️  Aucun fichier de formation trouvé dans ./formations/');
      console.log('   💡 Créez vos formations en format .md dans ce dossier');
      console.log('   📖 Consultez le guide des spécifications pour le format requis');
      return;
    }
    
    globalStats.totalFiles = formationFiles.length;
    console.log(`📚 Validation de ${formationFiles.length} formation(s)...\n`);
    
    // Valider chaque formation
    const results = [];
    for (const filePath of formationFiles) {
      console.log(`🔍 Validation: ${path.basename(filePath)}`);
      const result = await validateFormation(filePath);
      results.push(result);
      
      if (result.isValid) {
        globalStats.validFiles++;
      } else {
        globalStats.invalidFiles++;
      }
      
      result.print();
    }
    
    globalStats.processingTime = Date.now() - startTime;
    
    // Générer le rapport
    console.log('\n📊 Génération du rapport...');
    const report = generateValidationReport(results);
    
    await fs.ensureDir(GENERATED_DIR);
    await fs.writeJSON(`${GENERATED_DIR}/validation-report.json`, report, { spaces: 2 });
    
    // Afficher le résumé
    console.log('\n' + '='.repeat(50));
    console.log('📋 RÉSUMÉ DE LA VALIDATION');
    console.log('='.repeat(50));
    console.log(`✅ Fichiers valides: ${globalStats.validFiles}/${globalStats.totalFiles}`);
    console.log(`❌ Fichiers avec erreurs: ${globalStats.invalidFiles}/${globalStats.totalFiles}`);
    console.log(`🔥 Total erreurs: ${globalStats.totalErrors}`);
    console.log(`⚠️  Total avertissements: ${globalStats.totalWarnings}`);
    console.log(`📈 Taux de réussite: ${report.summary.successRate}%`);
    console.log(`⏱️  Temps de traitement: ${Math.round(globalStats.processingTime / 1000)}s`);
    
    if (Object.keys(report.statistics.errorsByField).length > 0) {
      console.log('\n❌ Erreurs les plus fréquentes:');
      Object.entries(report.statistics.errorsByField).slice(0, 3).forEach(([field, count]) => {
        console.log(`   - ${field}: ${count} erreur(s)`);
      });
    }
    
    if (Object.keys(report.statistics.warningsByField).length > 0) {
      console.log('\n⚠️  Avertissements les plus fréquents:');
      Object.entries(report.statistics.warningsByField).slice(0, 3).forEach(([field, count]) => {
        console.log(`   - ${field}: ${count} avertissement(s)`);
      });
    }
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommandations:');
      report.recommendations.forEach((rec, index) => {
        const icon = rec.type === 'error' ? '🔴' : rec.type === 'improvement' ? '🟡' : '🔵';
        console.log(`   ${index + 1}. ${icon} ${rec.message}`);
      });
    }
    
    console.log(`\n📄 Rapport détaillé: ${GENERATED_DIR}/validation-report.json`);
    
    // Conseils pour la suite
    if (globalStats.validFiles === globalStats.totalFiles) {
      console.log('\n🎉 Toutes les formations sont valides!');
      console.log('   ➡️  Vous pouvez maintenant lancer: npm run generate');
    } else {
      console.log('\n🔧 Corrigez les erreurs ci-dessus, puis relancez la validation');
      console.log('   📖 Consultez le guide des spécifications pour plus d\'aide');
    }
    
    // Code de sortie
    process.exit(globalStats.totalErrors > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('\n💥 Erreur fatale lors de la validation:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Exécuter le script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default main;