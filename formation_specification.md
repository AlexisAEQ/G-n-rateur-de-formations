# Spécifications Techniques pour la Génération de Formations

## 📋 Vue d'ensemble

Ce document définit les spécifications exactes pour créer des formations compatibles avec l'infrastructure Formation Generator. Il contient tous les éléments requis pour qu'une IA puisse générer automatiquement des formations complètes et fonctionnelles.

---

## 🏗️ Structure du fichier Markdown

### Format obligatoire
```markdown
---
# === MÉTADONNÉES DE FORMATION (YAML Front Matter) ===
[métadonnées YAML]
---

# Module content in Markdown
```

---

## 📊 Métadonnées YAML (Front Matter)

### Champs obligatoires (tous types)
```yaml
title: "string"                    # Titre de la formation (max 100 caractères)
type: "equipment|skills|safety|general"  # Type de formation
company: "string"                  # Nom de l'entreprise
duration: number                   # Durée en minutes (5-480)
difficulty: "débutant|intermédiaire|avancé|expert"  # Niveau
instructor: "string"               # Nom de l'instructeur
version: "string"                  # Version (ex: "2.1")
last_updated: "YYYY-MM-DD"        # Date de dernière mise à jour
```

### Configuration visuelle
```yaml
theme: "industrial|corporate|custom"
primary_color: "#1e40af"          # Couleur principale (hex)
accent_color: "#f59e0b"           # Couleur d'accent (hex)
```

### Objectifs pédagogiques (obligatoire)
```yaml
learning_objectives:
  - "Objectif 1 - verbe d'action + compétence mesurable"
  - "Objectif 2 - verbe d'action + compétence mesurable"
  # Max 10 objectifs, min 20 caractères chacun
```

### Prérequis
```yaml
prerequisites:
  - "Prérequis 1"
  - "Prérequis 2"
  # Max 8 prérequis
```

### Ressources multimédias
```yaml
resources:
  videos:
    - title: "Titre de la vidéo"
      file: "nom-du-fichier.mp4"    # Extensions: .mp4, .webm, .avi, .mov, .mkv
      duration: "15min"             # Format: "XXmin"
    
  documents:
    - title: "Titre du document"
      file: "Nom_Document_FR.pdf"   # Extensions: .pdf, .doc, .docx, .ppt, .pptx
    
  links:
    - title: "Titre du lien"
      url: "https://example.com"
      description: "Description optionnelle"
```

### Évaluation
```yaml
assessment:
  practical_weight: 70             # Poids pratique (0-100)
  theory_weight: 30                # Poids théorique (0-100, total = 100)
  passing_grade: 80                # Note de passage (0-100)
  exercises:
    - "Exercice 1 - description de l'exercice pratique"
    - "Exercice 2 - description de l'exercice pratique"
```

---

## 🔧 Métadonnées spécifiques par type

### Type "equipment"
```yaml
equipment:
  name: "string"                   # Nom de l'équipement (obligatoire)
  manufacturer: "string"           # Fabricant (obligatoire)
  model: "string"                  # Modèle (recommandé)
  image: "/assets/images/equipment/nom-image.jpg"  # Image principale
  specs:
    payload: "10 kg"               # Spécifications techniques
    reach: "1300 mm"               # Format libre
    repeatability: "±0.1 mm"
    safety: "ISO 10218-1"
```

### Type "skills"
```yaml
# Pas de champs spéciaux obligatoires
# Mais 'difficulty' est fortement recommandé
difficulty: "intermédiaire"        # Obligatoire pour skills
```

### Type "safety"
```yaml
assessment:                        # Évaluation obligatoire pour safety
  practical_weight: 30
  theory_weight: 70
  passing_grade: 100               # Souvent 100% pour sécurité
  exercises:
    - "Test des procédures d'urgence"
    - "Identification des risques"
```

---

## 📝 Structure du contenu Markdown

### Règles de structuration

1. **Modules = Titres H1**
```markdown
# 🤖 Module 1 : Introduction et Sécurité
# ⚙️ Module 2 : Interface PolyScope  
# 🎯 Module 3 : Programmation
```

2. **Sous-sections = H2, H3**
```markdown
## Qu'est-ce qu'un Robot Collaboratif ?
### Caractéristiques Clés du UR10e
```

3. **Émojis recommandés par module**
- 🤖 🔧 ⚙️ = Technique/Équipement
- 🛡️ ⚠️ 🚨 = Sécurité  
- 🎯 📋 ✅ = Objectifs/Évaluation
- 📚 💡 📖 = Apprentissage
- 🔍 🧪 🛠️ = Pratique

### Callouts spéciaux
```markdown
> 📹 **Vidéo recommandée** : "Titre de la vidéo" (durée)
> ⚠️ **IMPORTANT** : Message d'avertissement critique
> 💡 **ASTUCE** : Conseil pratique
```

### Listes et exercices
```markdown
**Checklist pré-opérationnelle :**
1. **Inspection visuelle complète**
   - Vérifier l'intégrité des câbles
   - S'assurer que la base est bien fixée

### Exercice Pratique 1 : Navigation de Base
**Objectif** : Se familiariser avec les onglets
**Instructions** :
1. Étape 1
2. Étape 2
**Temps alloué** : 15 minutes
```

---

## 🎨 Convention de nommage des assets

### Images
```
[équipement]-[description]-[version].[ext]
ur10e-installation-v2.jpg
siemens-wiring-diagram.png
safety-pictogram-warning.svg
```

### Vidéos  
```
[formation-id]-[module]-[séquence].[ext]
robotique-ur10e-module1-demo.mp4
safety-procedures-intro.mp4
maintenance-weekly-checklist.webm
```

### Documents
```
[Equipment]_[Type]_[Language].[ext]
UR10e_Installation_Manual_FR.pdf
Safety_Checklist_Template.pdf
Maintenance_Log_Form.xlsx
```

---

## 🔄 Templates et contexte

### Sélection automatique du template
- `type: "equipment"` → EquipmentTemplate.jsx
- `type: "skills"` → SkillsTemplate.jsx  
- `type: "safety"` → SafetyTemplate.jsx
- `type: "general"` → Layout de base

### Fonctionnalités par template

**EquipmentTemplate :**
- Onglets : Vue d'ensemble, Sécurité, Maintenance, Évaluation
- Checklist de sécurité interactive
- Spécifications techniques
- Procédures de maintenance
- Guide de dépannage

**SkillsTemplate :**
- Onglets : Progression, Exercices, Contenu, Évaluation
- Suivi de progression par compétence
- Exercices pratiques avec scoring
- Plan d'apprentissage personnalisé
- Conditions d'accès à l'évaluation

**SafetyTemplate :**
- Onglets : Procédures, Analyse des risques, Urgences, Certification
- Checklist obligatoire
- Analyse des risques avec acknowledgment
- Contacts d'urgence
- Certification 100% obligatoire

---

## ⚡ Règles de validation automatique

### Validation des métadonnées
```javascript
// Champs obligatoires par type
const requiredFields = {
  all: ['title', 'type', 'duration', 'instructor', 'learning_objectives'],
  equipment: ['equipment.name', 'equipment.manufacturer'],
  skills: ['difficulty'],
  safety: ['assessment']
};

// Limites
const limits = {
  titleMaxLength: 100,
  minDuration: 5,
  maxDuration: 480,
  maxObjectives: 10,
  maxPrerequisites: 8
};
```

### Validation du contenu
- Minimum 1 module (titre H1)
- Maximum 20 modules recommandé
- Contenu minimum 100 mots
- Vérification des liens internes

### Validation des assets
- Existence des fichiers référencés
- Extensions acceptées
- Taille des noms de fichiers

---

## 🏭 Contexte industrie manufacturière

### Terminologie standard
- **Équipements** : Robots, automates, variateurs, machines CNC
- **Sécurité** : EPI, LOTO, analyse des risques, procédures
- **Maintenance** : Préventive, corrective, prédictive
- **Qualité** : ISO, certifications, audits

### Types de formations typiques
1. **Mise en service d'équipement**
2. **Formation sécurité machine**  
3. **Maintenance préventive**
4. **Mise à niveau compétences**
5. **Certification opérateur**

### Éléments critiques sécurité
- Procédures d'arrêt d'urgence
- Identification des dangers
- Port des EPI obligatoires
- Consignation/déconsignation
- Analyse des risques

---

## 📤 Format de sortie attendu

### Structure des fichiers générés
```
public/generated/
├── index.json              # Index de toutes les formations
├── config.json            # Configuration React
└── [formation-slug].json  # Données de chaque formation
```

### Format des données JSON
```javascript
{
  // Métadonnées originales
  "title": "Formation Robot Collaboratif UR10e",
  "type": "equipment",
  "company": "Acier Bélanger Inc.",
  
  // Données générées
  "slug": "formation-robot-ur10e",
  "modules": [
    {
      "id": "introduction-et-securite",
      "title": "Introduction et Sécurité", 
      "order": 1,
      "content": "contenu markdown brut",
      "htmlContent": "contenu HTML converti",
      "estimatedDuration": 15
    }
  ],
  
  // Statistiques
  "moduleCount": 4,
  "estimatedTotalDuration": 180,
  "wordCount": 2453,
  
  // Navigation
  "tableOfContents": [...],
  
  // Métadonnées de génération
  "lastProcessed": "2025-01-20T10:30:00Z"
}
```

---

## 🎯 Prompts suggérés pour génération IA

### Prompt de base
```
Génère une formation complète pour [ENTREPRISE] sur [SUJET].

Contexte :
- Industrie : Manufacturière  
- Public : [Opérateurs/Techniciens/Ingénieurs]
- Niveau : [débutant/intermédiaire/avancé]
- Durée cible : [X] minutes
- Type : [equipment/skills/safety]

Équipement (si applicable) :
- Nom : [nom de l'équipement]
- Fabricant : [fabricant]
- Modèle : [modèle]

Exigences :
- 4-6 modules avec progression logique
- Objectifs pédagogiques mesurables
- Exercices pratiques concrets
- Éléments de sécurité si pertinents
- Ressources multimédias suggérées

Format : Respecter exactement les spécifications techniques du document.
```

### Prompt pour équipement spécifique
```
Crée une formation equipment pour un [NOM_ÉQUIPEMENT] de [FABRICANT].

Inclure obligatoirement :
- Spécifications techniques détaillées
- Procédures de sécurité spécifiques à cet équipement
- Guide de maintenance préventive
- Exercices de mise en service pratique
- Procédures de dépannage courantes

Respecter le format EquipmentTemplate avec métadonnées equipment complètes.
```

### Prompt pour formation sécurité
```
Génère une formation safety obligatoire pour [CONTEXTE_SÉCURITAIRE].

Exigences critiques :
- Identification de tous les risques (critique, élevé, modéré)
- Procédures d'urgence détaillées
- Checklist de sécurité obligatoire
- Évaluation à 100% de réussite obligatoire
- Contacts d'urgence spécifiques

Le contenu doit être conforme aux normes de sécurité industrielle.
```

---

## ✅ Checklist de validation finale

### Avant génération
- [ ] Contexte d'entreprise défini
- [ ] Type de formation identifié  
- [ ] Public cible spécifié
- [ ] Équipement/sujet technique précisé
- [ ] Niveau et durée cible définis

### Après génération
- [ ] Front matter YAML valide
- [ ] Tous les champs obligatoires présents
- [ ] Structure des modules (H1) correcte
- [ ] Objectifs pédagogiques mesurables
- [ ] Exercices pratiques concrets
- [ ] Ressources multimédias référencées
- [ ] Convention de nommage respectée
- [ ] Cohérence du type avec le contenu

### Test de compatibilité
- [ ] Validation automatique réussie
- [ ] Génération JSON sans erreurs
- [ ] Template approprié sélectionné
- [ ] Assets référencés existants
- [ ] Fonctionnalités interactives opérationnelles

---

## 🔧 Dépannage et erreurs courantes

### Erreurs de validation
```
❌ "Type invalide: [type]" 
→ Utiliser: equipment|skills|safety|general

❌ "Champ obligatoire manquant: equipment.name"
→ Ajouter le nom de l'équipement pour type equipment

❌ "Les poids pratique et théorique doivent totaliser 100%"
→ Vérifier assessment.practical_weight + theory_weight = 100
```

### Problèmes d'assets
```
❌ "Fichier introuvable: video.mp4"
→ Vérifier que le fichier existe dans public/assets/videos/

❌ "Extension non recommandée: .avi"
→ Préférer .mp4, .webm pour les vidéos
```

### Conseils d'optimisation
- Utiliser des titres de modules courts et explicites
- Limiter à 6 modules maximum pour la lisibilité
- Inclure des temps estimés réalistes pour chaque exercice
- Prévoir des ressources multimédias pour enrichir l'apprentissage
- Adapter le niveau de détail au public cible

---

*Ce document constitue la référence complète pour générer des formations compatibles avec l'infrastructure Formation Generator. Toute formation respectant ces spécifications sera automatiquement fonctionnelle.*