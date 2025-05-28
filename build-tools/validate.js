import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';

// Configuration des chemins
const FORMATIONS_DIR = './formations';
const PUBLIC_DIR = './public';
const ASSETS_DIR = './public/assets';

// Configuration des validations
const VALIDATION_RULES = {
  // Champs obligatoires par type de formation
  requiredFields: {
    all: ['title', 'type', 'duration', 'instructor', 'learning_objectives'],
    equipment: ['equipment', 'equipment.name', 'equipment.manufacturer'],
    skills: ['prerequisites', 'difficulty'],
    safety: ['prerequisites', 'assessment'],
    general: []
  },
  
  // Types de formation valides
  validTypes: ['equipment', 'skills', 'safety', 'general'],
  
  // Niveaux de difficulté valides
  validDifficulties: ['débutant', 'intermédiaire', 'avancé', 'expert'],
  
  // Extensions de fichiers multimédias acceptées
  validMediaExtensions: {
    videos: ['.mp4', '.webm', '.avi', '.mov', '.mkv'],
    images: ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'],
    documents: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xlsx', '.xls']
  },
  
  // Limites de taille et durée
  limits: {
    titleMaxLength: 100,
    descriptionMaxLength: 500,
    minDuration: 5,        // minutes
    maxDuration: 480,      // 8 heures
    maxObjectives: 10,
    maxPrerequisites: 8,
    minModules: 1,
    maxModules: 20
  }
};

// Compteurs pour les statistiques
let validationStats = {
  totalFiles: 0,
  validFiles: 0,
  invalidFiles: 0,
  totalErrors: 0,
  totalWarnings: 0,
  errorsByType: {},
  warningsByType: {}
};

/**
 * Classe pour gérer les erreurs et avertissements de validation
 */
class ValidationResult {
  constructor(filename) {
    this.filename = filename;
    this.errors = [];
    this.warnings = [];
    this.isValid = true;
  }
  
  addError(message, field = null) {
    this.errors.push({
      type: 'error',
      message,
      field,
      severity: 'high'
    });
    this.isValid = false;
    
    // Statistiques
    validationStats.totalErrors++;
    const errorType = field || 'general';
    validationStats.errorsByType[errorType] = (validationStats.errorsByType[errorType] || 0) + 1;
  }
  
  addWarning(message, field = null) {
    this.warnings.push({
      type: 'warning',
      message,
      field,
      severity: 'medium'
    });
    
    // Statistiques
    validationStats.totalWarnings++;
    const warningType = field || 'general';
    validationStats.warningsByType[warningType] = (validationStats.warningsByType[warningType] || 0) + 1;
  }
  
  hasIssues() {
    return this.errors.length > 0 || this.warnings.length > 0;
  }
  
  print() {
    if (!this.hasIssues()) {
      console.log(`✅ ${this.filename} - Aucun problème détecté`);
      return;
    }
    
    console.log(`\n📄 ${this.filename}:`);
    
    // Afficher les erreurs
    if (this.errors.length > 0) {
      console.log(`  ❌ ${this.errors.length} erreur(s):`);
      this.errors.forEach(error => {
        const fieldInfo = error.field ? ` [${error.field}]` : '';
        console.log(`     - ${error.message}${fieldInfo}`);
      });
    }
    
    // Afficher les avertissements
    if (this.warnings.length > 0) {
      console.log(`  ⚠️  ${this.warnings.length} avertissement(s):`);
      this.warnings.forEach(warning => {
        const fieldInfo = warning.field ? ` [${warning.field}]` : '';
        console.log(`     - ${warning.message}${fieldInfo}`);
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
 * Valide les métadonnées de base d'une formation
 */
function validateMetadata(data, result) {
  const { title, type, duration, instructor, company, version, last_updated } = data;
  
  // Validation du titre
  if (!title || typeof title !== 'string') {
    result.addError('Le titre est obligatoire et doit être une chaîne de caractères', 'title');
  } else if (title.length > VALIDATION_RULES.limits.titleMaxLength) {
    result.addWarning(`Le titre est trop long (${title.length} caractères, max ${VALIDATION_RULES.limits.titleMaxLength})`, 'title');
  }
  
  // Validation du type
  if (!type) {
    result.addError('Le type de formation est obligatoire', 'type');
  } else if (!VALIDATION_RULES.validTypes.includes(type)) {
    result.addError(`Type invalide: "${type}". Types valides: ${VALIDATION_RULES.validTypes.join(', ')}`, 'type');
  }
  
  // Validation de la durée
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
  
  // Validation de l'instructeur
  if (!instructor || typeof instructor !== 'string') {
    result.addError('Le nom de l\'instructeur est obligatoire', 'instructor');
  }
  
  // Validation de l'entreprise
  if (!company || typeof company !== 'string') {
    result.addWarning('Le nom de l\'entreprise est recommandé', 'company');
  }
  
  // Validation de la version
  if (version && typeof version !== 'string') {
    result.addWarning('La version doit être une chaîne de caractères', 'version');
  }
  
  // Validation de la date de mise à jour
  if (last_updated) {
    const date = new Date(last_updated);
    if (isNaN(date.getTime())) {
      result.addWarning('Format de date invalide pour last_updated (utilisez YYYY-MM-DD)', 'last_updated');
    }
  }
  
  // Validation de la difficulté
  if (data.difficulty && !VALIDATION_RULES.validDifficulties.includes(data.difficulty)) {
    result.addError(`Niveau de difficulté invalide: "${data.difficulty}". Niveaux valides: ${VALIDATION_RULES.validDifficulties.join(', ')}`, 'difficulty');
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
    result.addError('Les objectifs pédagogiques doivent être une liste', 'learning_objectives');
    return;
  }
  
  if (objectives.length === 0) {
    result.addError('Au moins un objectif pédagogique est requis', 'learning_objectives');
    return;
  }
  
  if (objectives.length > VALIDATION_RULES.limits.maxObjectives) {
    result.addWarning(`Trop d'objectifs (${objectives.length}, max recommandé: ${VALIDATION_RULES.limits.maxObjectives})`, 'learning_objectives');
  }
  
  // Vérifier chaque objectif
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
    result.addWarning('Les prérequis sont recommandés pour une meilleure compréhension', 'prerequisites');
    return;
  }
  
  if (!Array.isArray(prerequisites)) {
    result.addError('Les prérequis doivent être une liste', 'prerequisites');
    return;
  }
  
  if (prerequisites.length > VALIDATION_RULES.limits.maxPrerequisites) {
    result.addWarning(`Trop de prérequis (${prerequisites.length}, max recommandé: ${VALIDATION_RULES.limits.maxPrerequisites})`, 'prerequisites');
  }
  
  // Vérifier chaque prérequis
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
    result.addWarning('Aucune ressource multimédia définie', 'resources');
    return;
  }
  
  // Validation des vidéos
  if (resources.videos) {
    if (!Array.isArray(resources.videos)) {
      result.addError('Les vidéos doivent être une liste', 'resources.videos');
    } else {
      for (let i = 0; i < resources.videos.length; i++) {
        const video = resources.videos[i];
        if (!video.title || !video.file) {
          result.addError(`Vidéo ${i + 1}: titre et fichier sont obligatoires`, 'resources.videos');
        } else {
          // Vérifier l'extension
          const ext = path.extname(video.file).toLowerCase();
          if (!VALIDATION_RULES.validMediaExtensions.videos.includes(ext)) {
            result.addWarning(`Vidéo ${i + 1}: extension "${ext}" non recommandée. Extensions recommandées: ${VALIDATION_RULES.validMediaExtensions.videos.join(', ')}`, 'resources.videos');
          }
          
          // Vérifier l'existence du fichier
          const videoPath = path.join(ASSETS_DIR, 'videos', video.file);
          if (!(await fileExists(videoPath))) {
            result.addError(`Vidéo ${i + 1}: fichier "${video.file}" introuvable dans assets/videos/`, 'resources.videos');
          }
        }
        
        // Validation de la durée si présente
        if (video.duration) {
          if (!/^\d+min$/.test(video.duration)) {
            result.addWarning(`Vidéo ${i + 1}: format de durée recommandé: "Xmin" (ex: "15min")`, 'resources.videos');
          }
        }
      }
    }
  }
  
  // Validation des documents
  if (resources.documents) {
    if (!Array.isArray(resources.documents)) {
      result.addError('Les documents doivent être une liste', 'resources.documents');
    } else {
      for (let i = 0; i < resources.documents.length; i++) {
        const doc = resources.documents[i];
        if (!doc.title || !doc.file) {
          result.addError(`Document ${i + 1}: titre et fichier sont obligatoires`, 'resources.documents');
        } else {
          // Vérifier l'extension
          const ext = path.extname(doc.file).toLowerCase();
          if (!VALIDATION_RULES.validMediaExtensions.documents.includes(ext)) {
            result.addWarning(`Document ${i + 1}: extension "${ext}" non recommandée`, 'resources.documents');
          }
          
          // Vérifier l'existence du fichier
          const docPath = path.join(ASSETS_DIR, 'documents', doc.file);
          if (!(await fileExists(docPath))) {
            result.addError(`Document ${i + 1}: fichier "${doc.file}" introuvable dans assets/documents/`, 'resources.documents');
          }
        }
      }
    }
  }
  
  // Validation des liens
  if (resources.links) {
    if (!Array.isArray(resources.links)) {
      result.addError('Les liens doivent être une liste', 'resources.links');
    } else {
      resources.links.forEach((link, index) => {
        if (!link.title || !link.url) {
          result.addError(`Lien ${index + 1}: titre et URL sont obligatoires`, 'resources.links');
        } else {
          // Validation basique de l'URL
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
function validateEquipmentData(equipment, result) {
  if (!equipment) {
    result.addError('Les données d\'équipement sont obligatoires pour le type "equipment"', 'equipment');
    return;
  }
  
  // Champs obligatoires pour équipement
  if (!equipment.name) {
    result.addError('Le nom de l\'équipement est obligatoire', 'equipment.name');
  }
  
  if (!equipment.manufacturer) {
    result.addError('Le fabricant de l\'équipement est obligatoire', 'equipment.manufacturer');
  }
  
  if (!equipment.model) {
    result.addWarning('Le modèle de l\'équipement est recommandé', 'equipment.model');
  }
  
  // Validation de l'image
  if (equipment.image) {
    const ext = path.extname(equipment.image).toLowerCase();
    if (!VALIDATION_RULES.validMediaExtensions.images.includes(ext)) {
      result.addWarning(`Extension d'image non recommandée: "${ext}"`, 'equipment.image');
    }
  } else {
    result.addWarning('Une image de l\'équipement est recommandée', 'equipment.image');
  }
  
  // Validation des spécifications
  if (equipment.specs && typeof equipment.specs !== 'object') {
    result.addError('Les spécifications doivent être un objet', 'equipment.specs');
  }
}

/**
 * Valide l'évaluation
 */
function validateAssessment(assessment, result) {
  if (!assessment) {
    result.addWarning('Aucune évaluation définie', 'assessment');
    return;
  }
  
  // Validation des poids
  if (assessment.practical_weight !== undefined && assessment.theory_weight !== undefined) {
    const total = assessment.practical_weight + assessment.theory_weight;
    if (total !== 100) {
      result.addError(`Les poids pratique et théorique doivent totaliser 100% (actuellement: ${total}%)`, 'assessment');
    }
  }
  
  // Validation de la note de passage
  if (assessment.passing_grade) {
    if (typeof assessment.passing_grade !== 'number' || assessment.passing_grade < 0 || assessment.passing_grade > 100) {
      result.addError('La note de passage doit être un nombre entre 0 et 100', 'assessment.passing_grade');
    }
  }
  
  // Validation des exercices
  if (assessment.exercises) {
    if (!Array.isArray(assessment.exercises)) {
      result.addError('Les exercices doivent être une liste', 'assessment.exercises');
    } else if (assessment.exercises.length === 0) {
      result.addWarning('Aucun exercice d\'évaluation défini', 'assessment.exercises');
    }
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
  
  // Compter les modules (titres H1)
  const moduleMatches = content.match(/^# [^=]/gm);
  const moduleCount = moduleMatches ? moduleMatches.length : 0;
  
  if (moduleCount < VALIDATION_RULES.limits.minModules) {
    result.addError(`Trop peu de modules (${moduleCount}, minimum: ${VALIDATION_RULES.limits.minModules})`, 'content');
  } else if (moduleCount > VALIDATION_RULES.limits.maxModules) {
    result.addWarning(`Beaucoup de modules (${moduleCount}, maximum recommandé: ${VALIDATION_RULES.limits.maxModules})`, 'content');
  }
  
  // Vérifier la présence de contenu substantiel
  const wordCount = content.split(/\s+/).length;
  if (wordCount < 100) {
    result.addWarning(`Contenu très court (${wordCount} mots)`, 'content');
  }
  
  // Vérifier les liens internes
  const internalLinks = content.match(/\[([^\]]+)\]\(([^)]+)\)/g);
  if (internalLinks) {
    internalLinks.forEach(link => {
      const match = link.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        const url = match[2];
        // Vérifier les liens vers des fichiers locaux
        if (!url.startsWith('http') && !url.startsWith('#') && !url.startsWith('mailto:')) {
          result.addWarning(`Lien interne détecté: vérifiez que le fichier "${url}" existe`, 'content');
        }
      }
    });
  }
}

/**
 * Valide un fichier de formation complet
 */
async function validateFormation(filePath) {
  const filename = path.basename(filePath);
  const result = new ValidationResult(filename);
  
  try {
    // Lire et parser le fichier
    const fileContent = await fs.readFile(filePath, 'utf8');
    const { data: frontMatter, content } = matter(fileContent);
    
    // Validations générales
    validateMetadata(frontMatter, result);
    validateLearningObjectives(frontMatter.learning_objectives, result);
    validatePrerequisites(frontMatter.prerequisites, result);
    await validateResources(frontMatter.resources, result);
    validateAssessment(frontMatter.assessment, result);
    validateContent(content, result);
    
    // Validations spécifiques au type
    switch (frontMatter.type) {
      case 'equipment':
        validateEquipmentData(frontMatter.equipment, result);
        break;
      case 'safety':
        if (!frontMatter.assessment) {
          result.addError('Une évaluation est obligatoire pour les formations de sécurité', 'assessment');
        }
        break;
      case 'skills':
        if (!frontMatter.difficulty) {
          result.addWarning('Le niveau de difficulté est recommandé pour les formations de compétences', 'difficulty');
        }
        break;
    }
    
    // Validation des champs obligatoires spécifiques au type
    const requiredForType = VALIDATION_RULES.requiredFields[frontMatter.type] || [];
    requiredForType.forEach(field => {
      const fieldPath = field.split('.');
      let value = frontMatter;
      
      for (const key of fieldPath) {
        value = value?.[key];
      }
      
      if (value === undefined || value === null || value === '') {
        result.addError(`Champ obligatoire manquant pour le type "${frontMatter.type}": ${field}`, field);
      }
    });
    
  } catch (error) {
    result.addError(`Erreur lors de la lecture du fichier: ${error.message}`, 'file');
  }
  
  return result;
}

/**
 * Génère un rapport de validation
 */
function generateValidationReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: validationStats.totalFiles,
      validFiles: validationStats.validFiles,
      invalidFiles: validationStats.invalidFiles,
      totalErrors: validationStats.totalErrors,
      totalWarnings: validationStats.totalWarnings,
      successRate: Math.round((validationStats.validFiles / validationStats.totalFiles) * 100)
    },
    errorsByType: validationStats.errorsByType,
    warningsByType: validationStats.warningsByType,
    details: results.map(result => ({
      filename: result.filename,
      isValid: result.isValid,
      errorCount: result.errors.length,
      warningCount: result.warnings.length,
      issues: [...result.errors, ...result.warnings]
    }))
  };
  
  return report;
}

/**
 * Fonction principale de validation
 */
async function main() {
  console.log('🔍 Validation des formations...\n');
  
  try {
    // Rechercher tous les fichiers Markdown
    const formationFiles = await glob(`${FORMATIONS_DIR}/**/*.md`);
    
    if (formationFiles.length === 0) {
      console.log('⚠️  Aucun fichier de formation trouvé dans ./formations/');
      return;
    }
    
    validationStats.totalFiles = formationFiles.length;
    console.log(`📚 Validation de ${formationFiles.length} formation(s)...\n`);
    
    // Valider chaque formation
    const results = [];
    for (const filePath of formationFiles) {
      const result = await validateFormation(filePath);
      results.push(result);
      
      if (result.isValid) {
        validationStats.validFiles++;
      } else {
        validationStats.invalidFiles++;
      }
      
      result.print();
    }
    
    // Générer le rapport
    const report = generateValidationReport(results);
    await fs.ensureDir('./public/generated');
    await fs.writeJSON('./public/generated/validation-report.json', report, { spaces: 2 });
    
    // Afficher le résumé
    console.log('\n📊 Résumé de la validation:');
    console.log(`   ✅ Fichiers valides: ${validationStats.validFiles}/${validationStats.totalFiles}`);
    console.log(`   ❌ Fichiers avec erreurs: ${validationStats.invalidFiles}/${validationStats.totalFiles}`);
    console.log(`   🔥 Total erreurs: ${validationStats.totalErrors}`);
    console.log(`   ⚠️  Total avertissements: ${validationStats.totalWarnings}`);
    console.log(`   📈 Taux de réussite: ${report.summary.successRate}%`);
    
    if (validationStats.totalErrors > 0) {
      console.log('\n❌ Erreurs les plus fréquentes:');
      Object.entries(validationStats.errorsByType)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .forEach(([type, count]) => {
          console.log(`   - ${type}: ${count} erreur(s)`);
        });
    }
    
    if (validationStats.totalWarnings > 0) {
      console.log('\n⚠️  Avertissements les plus fréquents:');
      Object.entries(validationStats.warningsByType)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .forEach(([type, count]) => {
          console.log(`   - ${type}: ${count} avertissement(s)`);
        });
    }
    
    console.log(`\n📄 Rapport détaillé sauvegardé: ./public/generated/validation-report.json`);
    
    // Code de sortie
    if (validationStats.totalErrors > 0) {
      console.log('\n💥 Validation échouée - Corrigez les erreurs avant de continuer');
      process.exit(1);
    } else {
      console.log('\n✨ Validation réussie - Toutes les formations sont conformes!');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('💥 Erreur fatale lors de la validation:', error.message);
    process.exit(1);
  }
}

// Exécuter le script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default main;