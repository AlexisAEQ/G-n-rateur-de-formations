---
# === MÉTADONNÉES DE FORMATION ===
title: "Mathématiques pour Techniciens en Robotique"
type: "skills"
company: "AEQ"
duration: 150
difficulty: "Avancée"
instructor: "Alexis Ross"
version: "1.0"
last_updated: "2025-05-28"

# === CONFIGURATION VISUELLE ===
theme: "industrial"
primary_color: "#059669"
accent_color: "#dc2626"

# === OBJECTIFS PÉDAGOGIQUES ===
learning_objectives:
  - "Maîtriser les systèmes de coordonnées et transformations géométriques en robotique"
  - "Calculer les vitesses et accélérations dans les mouvements robotiques"
  - "Appliquer la trigonométrie pour résoudre des problèmes de positionnement"
  - "Utiliser l'algèbre vectorielle pour analyser les forces et déplacements"
  - "Comprendre les matrices de transformation homogène"
  - "Résoudre des problèmes de cinématique directe et inverse"

# === PRÉREQUIS ===
prerequisites:
  - "Mathématiques de niveau collégial"
  - "Notions de base en physique mécanique"
  - "Expérience pratique avec des systèmes robotiques"
  - "Capacité à utiliser une calculatrice scientifique"

# === RESSOURCES MULTIMÉDIAS ===
resources:
  videos:
    - title: "Introduction aux coordonnées cartésiennes en robotique"
      file: "maths-robotique-module1-coordonnees.mp4"
      duration: "12min"
    - title: "Démonstration des transformations géométriques"
      file: "maths-robotique-module2-transformations.mp4"
      duration: "18min"
    - title: "Calculs de vitesse et trajectoires"
      file: "maths-robotique-module3-cinematique.mp4"
      duration: "15min"
    - title: "Applications pratiques des matrices"
      file: "maths-robotique-module4-matrices.mp4"
      duration: "20min"
  
  documents:
    - title: "Formulaire mathématique robotique"
      file: "Robotics_Math_Formulas_FR.pdf"
    - title: "Exercices corrigés - Transformations"
      file: "Math_Exercises_Transformations.pdf"
    - title: "Tables trigonométriques de référence"
      file: "Trigonometry_Reference_Tables.pdf"
  
  links:
    - title: "Calculateur de matrices en ligne"
      url: "https://www.symbolab.com/solver/matrix-calculator"
      description: "Outil pour vérifier vos calculs matriciels"
    - title: "Simulateur de transformations géométriques"
      url: "https://www.geogebra.org/3d"
      description: "Visualisation interactive des transformations"

# === ÉVALUATION ===
assessment:
  practical_weight: 60
  theory_weight: 40
  passing_grade: 75
  exercises:
    - "Calcul de position d'un effecteur à partir d'angles articulaires"
    - "Détermination de trajectoire optimale entre deux points"
    - "Résolution d'un problème de cinématique inverse"
    - "Application des matrices de transformation homogène"
---

# 📐 Module 1 : Systèmes de Coordonnées et Repères

## Introduction aux Systèmes de Coordonnées

En robotique, la **localisation précise** des objets et des outils est fondamentale. Un technicien doit maîtriser les différents systèmes de coordonnées pour comprendre et programmer les mouvements robotiques.

### Système de Coordonnées Cartésiennes

Le système cartésien utilise trois axes perpendiculaires : **X, Y, et Z**.

**Caractéristiques principales :**
- **Axe X** : Généralement horizontal, vers la droite
- **Axe Y** : Généralement horizontal, vers l'avant  
- **Axe Z** : Généralement vertical, vers le haut
- **Origine (0,0,0)** : Point de référence du système

> 📹 **Vidéo recommandée** : "Introduction aux coordonnées cartésiennes en robotique" (12min)

### Conventions Robotiques Standards

**Convention main droite :**
1. Pointez le pouce dans la direction X positive
2. L'index indique Y positive
3. Le majeur indique Z positive

Cette convention assure la cohérence entre tous les systèmes robotiques.

### Système de Coordonnées Cylindriques

Particulièrement utile pour les robots à configuration cylindrique.

**Paramètres :**
- **ρ (rho)** : Distance radiale depuis l'axe Z
- **φ (phi)** : Angle autour de l'axe Z
- **z** : Hauteur le long de l'axe Z

**Conversion cartésien → cylindrique :**
- ρ = √(x² + y²)
- φ = arctan(y/x)
- z = z

### Système de Coordonnées Sphériques

Idéal pour les robots à poignet sphérique.

**Paramètres :**
- **r** : Distance depuis l'origine
- **θ (theta)** : Angle d'élévation depuis le plan XY
- **φ (phi)** : Angle azimutal dans le plan XY

**Conversion cartésien → sphérique :**
- r = √(x² + y² + z²)
- θ = arccos(z/r)
- φ = arctan(y/x)

### 📝 Quiz : Systèmes de Coordonnées

**Question 1** : Dans le système de coordonnées cartésiennes, quelle est la convention main droite ?
- [x] Pouce = X+, Index = Y+, Majeur = Z+
- [ ] Pouce = Y+, Index = X+, Majeur = Z+
- [ ] Pouce = Z+, Index = X+, Majeur = Y+
- [ ] Aucune convention spécifique

**Explication** : La convention main droite assure la cohérence entre tous les systèmes robotiques.

**Question 2** : Pour convertir des coordonnées cartésiennes (x,y,z) en cylindriques (ρ,φ,z), quelle formule utilise-t-on pour ρ ?
- [ ] ρ = x + y
- [x] ρ = √(x² + y²)
- [ ] ρ = x × y
- [ ] ρ = arctan(y/x)

**Explication** : ρ représente la distance radiale depuis l'axe Z, calculée par le théorème de Pythagore.

**Question 3** : Les coordonnées sphériques sont particulièrement utiles pour :
- [ ] Les robots linéaires
- [x] Les robots à poignet sphérique
- [ ] Les robots planaires uniquement
- [ ] Les systèmes de coordonnées fixes

**Seuil de réussite** : 70%

## Exercice Pratique 1 : Conversion de Coordonnées

**Objectif** : Maîtriser les conversions entre systèmes de coordonnées

**Problème :**
Un robot doit atteindre un point situé à :
- Coordonnées cartésiennes : (150mm, 200mm, 300mm)

**Tâches :**
1. Convertir en coordonnées cylindriques
2. Convertir en coordonnées sphériques
3. Vérifier vos calculs avec le simulateur en ligne

**Solution :**

*Coordonnées cylindriques :*
- ρ = √(150² + 200²) = √(22500 + 40000) = 250mm
- φ = arctan(200/150) = 53.13°
- z = 300mm

*Coordonnées sphériques :*
- r = √(150² + 200² + 300²) = √112500 = 335.4mm
- θ = arccos(300/335.4) = 26.57°
- φ = arctan(200/150) = 53.13°

**Temps alloué** : 20 minutes

---

# 🔄 Module 2 : Transformations Géométriques

## Translations et Rotations

Les **transformations géométriques** permettent de décrire le mouvement d'un objet dans l'espace. C'est la base de toute programmation robotique.

### Translation

Une translation déplace un point sans changer son orientation.

**Formule de translation :**
```
x' = x + dx
y' = y + dy  
z' = z + dz
```

Où (dx, dy, dz) est le vecteur de translation.

### Rotation autour d'un Axe

**Rotation autour de l'axe Z (dans le plan XY) :**
```
x' = x⋅cos(θ) - y⋅sin(θ)
y' = x⋅sin(θ) + y⋅cos(θ)
z' = z
```

**Rotation autour de l'axe X :**
```
x' = x
y' = y⋅cos(θ) - z⋅sin(θ)
z' = y⋅sin(θ) + z⋅cos(θ)
```

**Rotation autour de l'axe Y :**
```
x' = x⋅cos(θ) + z⋅sin(θ)
y' = y
z' = -x⋅sin(θ) + z⋅cos(θ)
```

> 📹 **Vidéo recommandée** : "Démonstration des transformations géométriques" (18min)

### Angles d'Euler

Les **angles d'Euler** décrivent l'orientation d'un objet avec trois rotations successives :

1. **Roulis (Roll)** : Rotation autour de l'axe X
2. **Tangage (Pitch)** : Rotation autour de l'axe Y  
3. **Lacet (Yaw)** : Rotation autour de l'axe Z

> ⚠️ **IMPORTANT** : L'ordre des rotations affecte le résultat final !

## Matrices de Transformation Homogène

Les **matrices 4×4** permettent de combiner translation et rotation en une seule opération.

**Structure générale :**
```
[R₁₁ R₁₂ R₁₃ tx]
[R₂₁ R₂₂ R₂₃ ty]
[R₃₁ R₃₂ R₃₃ tz]
[0   0   0   1 ]
```

Où :
- **R** = Matrice de rotation 3×3
- **t** = Vecteur de translation (tx, ty, tz)

### Exemple Concret

**Matrice de translation pure :**
```
[1  0  0  50 ]    # Translation de 50mm en X
[0  1  0  30 ]    # Translation de 30mm en Y
[0  0  1  100]    # Translation de 100mm en Z
[0  0  0  1  ]
```

**Matrice de rotation de 90° autour de Z :**
```
[0  -1  0  0]     # cos(90°) = 0, sin(90°) = 1
[1   0  0  0]
[0   0  1  0]
[0   0  0  1]
```

### 📝 Quiz : Transformations

**Question 1** : Vrai ou Faux : L'ordre des rotations affecte le résultat final
- [x] Vrai
- [ ] Faux

**Explication** : L'ordre des rotations est crucial car les rotations ne sont pas commutatives.

**Question 2** : Dans une matrice de transformation homogène 4×4, que représente le vecteur t ?
- [ ] La matrice de rotation
- [x] Le vecteur de translation
- [ ] Les coordonnées homogènes
- [ ] Les angles d'Euler

**Question 3** : Une rotation de 90° autour de l'axe Z transforme le point (1,0,0) en :
- [ ] (1,0,0)
- [x] (0,1,0)
- [ ] (0,0,1)
- [ ] (-1,0,0)

**Seuil de réussite** : 75%

## Exercice Pratique 2 : Transformations Successives

**Objectif** : Appliquer plusieurs transformations géométriques

**Contexte :**
Un bras robotique doit :
1. Tourner de 45° autour de l'axe Z
2. Se déplacer de 100mm en X
3. Tourner de 30° autour de l'axe Y

**Instructions :**
1. Calculer la matrice de chaque transformation
2. Multiplier les matrices dans l'ordre correct
3. Appliquer le résultat au point (50, 0, 0)

**Temps alloué** : 30 minutes

---

# 🏃 Module 3 : Cinématique et Dynamique

## Cinématique : Étude du Mouvement

La **cinématique** analyse le mouvement sans considérer les forces qui le causent. Elle est essentielle pour programmer des trajectoires fluides.

### 🎯 Défi 3 : Ingénieur Trajectoires

**Difficulté** : Avancé
**XP** : 250
**Temps estimé** : 40 minutes
**Mission** : Concevoir et optimiser des trajectoires robotiques complexes

**Critères de réussite** :
- [ ] Calculer une trajectoire point-à-point avec profil trapézoïdal
- [ ] Optimiser la vitesse selon les contraintes mécaniques
- [ ] Vérifier la continuité des vitesses aux points de transition
- [ ] Valider les limites d'accélération

**Étapes** :
1. Analyser les contraintes de mouvement
2. Définir les phases d'accélération, vitesse constante et décélération
3. Calculer les équations pour chaque phase
4. Vérifier la cohérence et les limites

**Indice** : Utilisez les équations du mouvement uniformément varié pour les phases d'accélération

### 📝 Quiz : Cinématique

**Question 1** : La cinématique directe permet de calculer :
- [x] La position de l'effecteur à partir des angles articulaires
- [ ] Les angles articulaires à partir de la position de l'effecteur
- [ ] Les forces exercées par le robot
- [ ] La masse des segments du robot

**Question 2** : Dans un mouvement circulaire uniforme, l'accélération centripète vaut :
- [ ] v/r
- [ ] ω/r
- [x] v²/r
- [ ] ωr

**Question 3** : Pour un bras robotique 2D, si θ₁ = 30° et θ₂ = 45°, l'angle total de l'effecteur par rapport à la base est :
- [ ] 30°
- [ ] 45°
- [x] 75°
- [ ] 15°

**Seuil de réussite** : 80%

> 📹 **Vidéo recommandée** : "Calculs de vitesse et trajectoires" (15min)

### Cinématique Directe

La **cinématique directe** calcule la position de l'effecteur à partir des angles articulaires.

**Pour un bras robotique 2D simple :**
```
x = L₁⋅cos(θ₁) + L₂⋅cos(θ₁ + θ₂)
y = L₁⋅sin(θ₁) + L₂⋅sin(θ₁ + θ₂)
```

## Exercice Pratique 3 : Calcul de Trajectoire

**Objectif** : Calculer une trajectoire point à point

**Problème :**
Un robot doit se déplacer du point A(100, 50) au point B(200, 150) en 2 secondes avec :
- Accélération de 0.5 sec
- Vitesse constante de 1 sec  
- Décélération de 0.5 sec

**Tâches :**
1. Calculer la distance totale
2. Déterminer les vitesses maximales
3. Établir les équations de mouvement pour chaque phase
4. Vérifier la continuité de la vitesse

**Temps alloué** : 25 minutes

---

# 🧮 Module 4 : Algèbre Vectorielle et Matricielle

## Vecteurs en Robotique

Les **vecteurs** représentent des grandeurs ayant une magnitude et une direction : forces, vitesses, positions relatives.

### 🎯 Défi 4 : Maître des Vecteurs

**Difficulté** : Avancé
**XP** : 300
**Temps estimé** : 45 minutes
**Mission** : Résoudre des problèmes complexes d'équilibre et de dynamique avec l'algèbre vectorielle

**Critères de réussite** :
- [ ] Calculer des produits scalaires et vectoriels
- [ ] Résoudre un système d'équilibre de forces
- [ ] Calculer des moments et couples
- [ ] Interpréter physiquement les résultats

**Étapes** :
1. Identifier les vecteurs forces en présence
2. Appliquer les conditions d'équilibre statique
3. Calculer la force d'équilibrage
4. Vérifier par calcul des moments

**Indice** : Pour l'équilibre statique : ΣF = 0 et ΣM = 0

### 📝 Quiz : Algèbre Vectorielle

**Question 1** : Le produit vectoriel de deux vecteurs donne :
- [ ] Un scalaire
- [x] Un vecteur perpendiculaire aux deux vecteurs originaux
- [ ] Un vecteur colinéaire au premier vecteur
- [ ] La somme des deux vecteurs

**Question 2** : Le déterminant de la matrice jacobienne indique :
- [ ] La vitesse maximale du robot
- [x] Les configurations singulières (det = 0)
- [ ] Le nombre de degrés de liberté
- [ ] La masse du robot

**Question 3** : Pour calculer un couple τ à partir d'une force F et d'un bras de levier r :
- [ ] τ = F + r
- [ ] τ = F · r (produit scalaire)
- [x] τ = r × F (produit vectoriel)
- [ ] τ = F / r

**Seuil de réussite** : 85%

> 📹 **Vidéo recommandée** : "Applications pratiques des matrices" (20min)

## Exercice Pratique 4 : Analyse Vectorielle

**Objectif** : Résoudre un problème d'équilibre des forces

**Contexte :**
Un robot manipule un objet de 5 kg. Trois forces s'appliquent :
- F₁ = (10, 15, 0) N
- F₂ = (-5, 8, 12) N  
- F₃ = (?, ?, -20) N (force d'équilibre à calculer)

**Tâches :**
1. Calculer F₃ pour l'équilibre statique
2. Déterminer l'angle entre F₁ et F₂
3. Calculer le moment résultant par rapport à l'origine

**Temps alloué** : 20 minutes

---

# 📏 Module 5 : Trigonométrie Appliquée

## Fonctions Trigonométriques Essentielles

La **trigonométrie** est indispensable pour résoudre les problèmes de positionnement et d'orientation en robotique.

### 🎯 Défi 5 : Expert en Trigonométrie Robotique

**Difficulté** : Expert
**XP** : 350
**Temps estimé** : 50 minutes
**Mission** : Résoudre un problème complet de cinématique inverse en utilisant la trigonométrie avancée

**Critères de réussite** :
- [ ] Appliquer la loi des cosinus correctement
- [ ] Calculer tous les angles articulaires possibles
- [ ] Gérer les configurations multiples (coude haut/bas)
- [ ] Vérifier par cinématique directe

**Étapes** :
1. Analyser la géométrie du robot planaire
2. Appliquer la loi des cosinus pour θ₂
3. Utiliser la trigonométrie pour calculer θ₁ et θ₃
4. Valider en recalculant la position finale

**Indice** : Attention aux solutions multiples ! Le ± dans l'arccos donne deux configurations possibles.

### 📝 Quiz : Trigonométrie

**Question 1** : La loi des cosinus s'écrit :
- [ ] a² = b + c - 2bc⋅cos(A)
- [x] c² = a² + b² - 2ab⋅cos(C)
- [ ] c = a + b - 2ab⋅cos(C)
- [ ] c² = a² + b² + 2ab⋅cos(C)

**Question 2** : Pour un robot SCARA, la cinématique inverse peut donner :
- [ ] Une seule solution
- [x] Deux solutions (coude haut/bas)
- [ ] Trois solutions
- [ ] Aucune solution

**Question 3** : L'angle d'approche perpendiculaire à une surface inclinée de 30° est :
- [ ] 30°
- [x] 60°
- [ ] 90°
- [ ] 120°

**Seuil de réussite** : 85%

## Exercice Pratique 5 : Problème de Positionnement

**Objectif** : Résoudre un problème de cinématique inverse complexe

**Configuration :**
Robot planaire à 3 degrés de liberté :
- L₁ = 300mm (bras principal)
- L₂ = 200mm (avant-bras)  
- L₃ = 100mm (poignet)

**Mission :**
Atteindre le point (400, 300) avec orientation de l'effecteur à 45°

**Instructions :**
1. Utiliser la loi des cosinus pour θ₂
2. Calculer θ₁ par trigonométrie
3. Déterminer θ₃ pour l'orientation finale
4. Vérifier par cinématique directe

**Temps alloué** : 35 minutes

---

# 🎯 Module 6 : Applications Pratiques et Résolution de Problèmes

## Méthodologie de Résolution

Face à un problème robotique complexe, suivre cette **approche structurée** :

### 🎯 Défi Final : Projet Intégré de Palettisation

**Difficulté** : Expert
**XP** : 500
**Temps estimé** : 90 minutes
**Mission** : Conception complète d'une cellule robotique de palettisation en intégrant tous les concepts mathématiques

**Critères de réussite** :
- [ ] Analyse géométrique complète de l'espace de travail
- [ ] Calcul précis des limites articulaires requises
- [ ] Programmation mathématique du motif de palettisation
- [ ] Optimisation de trajectoire pour temps de cycle minimal
- [ ] Validation complète par simulation

**Étapes** :
1. Analyser les contraintes géométriques et mécaniques
2. Définir l'espace de travail accessible
3. Concevoir le motif de palettisation optimal
4. Calculer les trajectoires optimisées
5. Valider par simulation et calculs de vérification

**Indice** : Utilisez tous les outils mathématiques : coordonnées, transformations, cinématique, vecteurs et trigonométrie

**Validation automatique** : Soumission du rapport complet avec calculs justifiés

### 📝 Quiz Final : Évaluation Complète

**Question 1** : Pour optimiser une trajectoire robotique, il faut considérer :
- [ ] Seulement la vitesse
- [ ] Seulement la précision
- [x] Vitesse, accélération, jerk et contraintes mécaniques
- [ ] Seulement les angles articulaires

**Question 2** : La transformation homogène combine :
- [ ] Seulement les rotations
- [ ] Seulement les translations
- [x] Rotations et translations en une seule matrice
- [ ] Les coordonnées et les vitesses

**Question 3** : En robotique industrielle, les singularités sont :
- [ ] Bénéfiques pour la vitesse
- [x] Des configurations à éviter (det(J) = 0)
- [ ] Nécessaires pour la précision
- [ ] Sans importance pratique

**Question 4** : La cinématique inverse d'un robot peut :
- [ ] Toujours être résolue analytiquement
- [x] Avoir plusieurs solutions ou aucune solution
- [ ] Avoir une solution unique
- [ ] Être ignorée en pratique

**Question 5** : Le produit vectoriel r⃗ × F⃗ calcule :
- [ ] La force résultante
- [x] Le moment ou couple
- [ ] La vitesse
- [ ] L'accélération

**Seuil de réussite** : 90%
**Temps limite** : 45 minutes

## Exercice Pratique Final : Projet Intégré

**Objectif** : Intégrer tous les concepts mathématiques

**Projet :** Conception d'une cellule robotique de palettisation

**Spécifications :**
- Robot 4 axes (SCARA + rotation + translation Z)
- Zone de travail : 1000mm × 800mm
- Hauteur : 0 à 500mm
- Palettes : 1200mm × 800mm
- Objets : cubes de 100mm × 100mm × 100mm

**Livrables :**
1. **Analyse géométrique** de l'espace de travail
2. **Calcul des limites articulaires** requises
3. **Programmation mathématique** d'un motif de palettisation
4. **Optimisation de trajectoire** pour temps de cycle minimal
5. **Validation** par simulation

**Critères d'évaluation :**
- Exactitude des calculs mathématiques (40%)
- Méthodologie de résolution (30%)
- Optimisation et efficacité (20%)
- Présentation et clarté (10%)

**Temps alloué** : 90 minutes

> 💡 **ASTUCE** : Utilisez les outils en ligne pour vérifier vos calculs matriciels et trigonométriques complexes.

---

## 📋 Récapitulatif et Points Clés

### ✅ Checkpoint Final

**Mission** : Validation complète des compétences acquises

**Critères de réussite** :
- [ ] Maîtrise des 6 modules théoriques
- [ ] Completion de tous les défis pratiques
- [ ] Réussite de tous les quiz (≥75%)
- [ ] Projet final validé
- [ ] Score total ≥ 1750 XP

### Concepts Maîtrisés ✅

1. **Systèmes de coordonnées** : Cartésien, cylindrique, sphérique
2. **Transformations géométriques** : Translation, rotation, matrices homogènes  
3. **Cinématique** : Directe, inverse, trajectoires
4. **Algèbre vectorielle** : Produits scalaire et vectoriel, applications
5. **Matrices** : Multiplication, inversion, jacobienne
6. **Trigonométrie** : Fonctions, identités, lois des cosinus/sinus

### Applications Industrielles 🏭

- **Programmation de trajectoires** optimisées
- **Calibrage et étalonnage** de robots
- **Diagnostic de singularités** et limitations
- **Calcul de forces et couples** requis
- **Optimisation de cycles** de production

---

## 🎯 DÉFIS PRATIQUES

### 🎯 Défi 1 : Maître des Coordonnées

**Difficulté** : Débutant
**XP** : 150
**Temps estimé** : 20 minutes
**Mission** : Devenir expert dans la conversion entre différents systèmes de coordonnées

**Critères de réussite** :
- [ ] Convertir 5 points cartésiens en coordonnées cylindriques
- [ ] Convertir 3 points en coordonnées sphériques
- [ ] Vérifier vos calculs avec le simulateur en ligne
- [ ] Identifier l'origine et les axes dans un schéma robotique

**Étapes** :
1. Analyser les formules de conversion
2. Appliquer les conversions sur les exemples donnés
3. Valider avec l'outil en ligne
4. Documenter vos résultats

**Indice** : Rappelez-vous que ρ = √(x² + y²) pour les coordonnées cylindriques

**Validation automatique** : Soumettez vos 8 conversions dans le tableau de réponses

### 🎯 Défi 2 : Architecte des Transformations

**Difficulté** : Intermédiaire
**XP** : 200
**Temps estimé** : 35 minutes
**Mission** : Maîtriser les transformations géométriques complexes en robotique

**Critères de réussite** :
- [ ] Calculer 3 matrices de transformation homogène
- [ ] Appliquer des transformations successives correctement
- [ ] Interpréter géométriquement les résultats
- [ ] Vérifier l'ordre d'application des transformations

**Étapes** :
1. Étudier les formules de rotation pour chaque axe
2. Construire les matrices de transformation
3. Multiplier les matrices dans l'ordre correct
4. Appliquer au point test et vérifier

**Indice** : L'ordre des rotations change le résultat final ! Toujours appliquer dans l'ordre spécifié.

### 🎯 Défi 3 : Ingénieur Trajectoires

**Difficulté** : Avancé
**XP** : 250
**Temps estimé** : 40 minutes
**Mission** : Concevoir et optimiser des trajectoires robotiques complexes

**Critères de réussite** :
- [ ] Calculer une trajectoire point-à-point avec profil trapézoïdal
- [ ] Optimiser la vitesse selon les contraintes mécaniques
- [ ] Vérifier la continuité des vitesses aux points de transition
- [ ] Valider les limites d'accélération

**Étapes** :
1. Analyser les contraintes de mouvement
2. Définir les phases d'accélération, vitesse constante et décélération
3. Calculer les équations pour chaque phase
4. Vérifier la cohérence et les limites

**Indice** : Utilisez les équations du mouvement uniformément varié pour les phases d'accélération

### 🎯 Défi 4 : Maître des Vecteurs

**Difficulté** : Avancé
**XP** : 300
**Temps estimé** : 45 minutes
**Mission** : Résoudre des problèmes complexes d'équilibre et de dynamique avec l'algèbre vectorielle

**Critères de réussite** :
- [ ] Calculer des produits scalaires et vectoriels
- [ ] Résoudre un système d'équilibre de forces
- [ ] Calculer des moments et couples
- [ ] Interpréter physiquement les résultats

**Étapes** :
1. Identifier les vecteurs forces en présence
2. Appliquer les conditions d'équilibre statique
3. Calculer la force d'équilibrage
4. Vérifier par calcul des moments

**Indice** : Pour l'équilibre statique : ΣF = 0 et ΣM = 0

### 🎯 Défi 5 : Expert en Trigonométrie Robotique

**Difficulté** : Expert
**XP** : 350
**Temps estimé** : 50 minutes
**Mission** : Résoudre un problème complet de cinématique inverse en utilisant la trigonométrie avancée

**Critères de réussite** :
- [ ] Appliquer la loi des cosinus correctement
- [ ] Calculer tous les angles articulaires possibles
- [ ] Gérer les configurations multiples (coude haut/bas)
- [ ] Vérifier par cinématique directe

**Étapes** :
1. Analyser la géométrie du robot planaire
2. Appliquer la loi des cosinus pour θ₂
3. Utiliser la trigonométrie pour calculer θ₁ et θ₃
4. Valider en recalculant la position finale

**Indice** : Attention aux solutions multiples ! Le ± dans l'arccos donne deux configurations possibles.

### 🎯 Défi Final : Projet Intégré de Palettisation

**Difficulté** : Expert
**XP** : 500
**Temps estimé** : 90 minutes
**Mission** : Conception complète d'une cellule robotique de palettisation en intégrant tous les concepts mathématiques

**Critères de réussite** :
- [ ] Analyse géométrique complète de l'espace de travail
- [ ] Calcul précis des limites articulaires requises
- [ ] Programmation mathématique du motif de palettisation
- [ ] Optimisation de trajectoire pour temps de cycle minimal
- [ ] Validation complète par simulation

**Étapes** :
1. Analyser les contraintes géométriques et mécaniques
2. Définir l'espace de travail accessible
3. Concevoir le motif de palettisation optimal
4. Calculer les trajectoires optimisées
5. Valider par simulation et calculs de vérification

**Indice** : Utilisez tous les outils mathématiques : coordonnées, transformations, cinématique, vecteurs et trigonométrie

**Validation automatique** : Soumission du rapport complet avec calculs justifiés