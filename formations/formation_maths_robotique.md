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

### Position, Vitesse et Accélération

**Relations fondamentales :**
- **Vitesse** = dérivée de la position : v = dp/dt
- **Accélération** = dérivée de la vitesse : a = dv/dt = d²p/dt²

### Mouvement Rectiligne

**Équations du mouvement uniforme :**
```
Position : x(t) = x₀ + v₀⋅t
Vitesse : v(t) = v₀ (constante)
```

**Équations du mouvement uniformément accéléré :**
```
Position : x(t) = x₀ + v₀⋅t + ½⋅a⋅t²
Vitesse : v(t) = v₀ + a⋅t
```

> 📹 **Vidéo recommandée** : "Calculs de vitesse et trajectoires" (15min)

### Mouvement Circulaire

**Pour un mouvement circulaire uniforme :**
- **Vitesse angulaire** : ω = θ/t (rad/s)
- **Vitesse linéaire** : v = ω⋅r
- **Accélération centripète** : a = v²/r = ω²⋅r

### Cinématique Directe

La **cinématique directe** calcule la position de l'effecteur à partir des angles articulaires.

**Pour un bras robotique 2D simple :**
```
x = L₁⋅cos(θ₁) + L₂⋅cos(θ₁ + θ₂)
y = L₁⋅sin(θ₁) + L₂⋅sin(θ₁ + θ₂)
```

Où :
- L₁, L₂ = longueurs des segments
- θ₁, θ₂ = angles articulaires

### Cinématique Inverse

La **cinématique inverse** détermine les angles articulaires pour atteindre une position donnée.

**Pour le même bras 2D :**
```
θ₂ = ±arccos((x² + y² - L₁² - L₂²)/(2⋅L₁⋅L₂))
θ₁ = arctan(y/x) - arctan((L₂⋅sin(θ₂))/(L₁ + L₂⋅cos(θ₂)))
```

> ⚠️ **ATTENTION** : Plusieurs solutions peuvent exister (coude en haut/en bas)

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

### Opérations Vectorielles Fondamentales

**Addition de vecteurs :**
```
A⃗ + B⃗ = (Ax + Bx, Ay + By, Az + Bz)
```

**Produit scalaire :**
```
A⃗ ⋅ B⃗ = Ax⋅Bx + Ay⋅By + Az⋅Bz = |A⃗|⋅|B⃗|⋅cos(θ)
```

**Produit vectoriel :**
```
A⃗ × B⃗ = (Ay⋅Bz - Az⋅By, Az⋅Bx - Ax⋅Bz, Ax⋅By - Ay⋅Bx)
```

Le produit vectoriel donne un vecteur perpendiculaire aux deux vecteurs originaux.

### Applications en Robotique

**Calcul de couples :**
Le couple τ⃗ exercé par une force F⃗ à une distance r⃗ :
```
τ⃗ = r⃗ × F⃗
```

**Test de colinéarité :**
Deux vecteurs sont colinéaires si leur produit vectoriel est nul.

## Matrices en Robotique

Les **matrices** sont omniprésentes en robotique pour représenter transformations, rotations et systèmes d'équations.

> 📹 **Vidéo recommandée** : "Applications pratiques des matrices" (20min)

### Opérations Matricielles

**Multiplication de matrices :**
Pour multiplier A(m×n) et B(n×p), le résultat C(m×p) :
```
Cij = Σ(k=1 à n) Aik ⋅ Bkj
```

**Inversion de matrice :**
Essentielle pour la cinématique inverse :
```
A⁻¹ ⋅ A = I (matrice identité)
```

### Matrice Jacobienne

La **matrice jacobienne** relie les vitesses articulaires aux vitesses cartésiennes :

```
v⃗ = J ⋅ q̇⃗
```

Où :
- v⃗ = vitesse cartésienne de l'effecteur
- J = matrice jacobienne
- q̇⃗ = vitesses articulaires

### Déterminant et Singularités

Le **déterminant** de la jacobienne indique les singularités :
- det(J) = 0 → Configuration singulière
- det(J) ≠ 0 → Configuration normale

> ⚠️ **IMPORTANT** : Éviter les singularités en programmation de trajectoires

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

### Relations Fondamentales

**Triangle rectangle :**
```
sin(θ) = opposé / hypoténuse
cos(θ) = adjacent / hypoténuse  
tan(θ) = opposé / adjacent
```

**Identités utiles :**
```
sin²(θ) + cos²(θ) = 1
tan(θ) = sin(θ) / cos(θ)
sin(2θ) = 2⋅sin(θ)⋅cos(θ)
cos(2θ) = cos²(θ) - sin²(θ)
```

### Loi des Cosinus

Pour un triangle quelconque avec côtés a, b, c et angle C opposé au côté c :
```
c² = a² + b² - 2⋅a⋅b⋅cos(C)
```

Cette loi est cruciale pour la cinématique inverse.

### Loi des Sinus

```
a/sin(A) = b/sin(B) = c/sin(C)
```

## Applications Robotiques Spécifiques

### Calcul d'Angles Articulaires

**Problème type :** Robot SCARA avec deux liens
- Lien 1 : longueur L₁
- Lien 2 : longueur L₂
- Position cible : (x, y)

**Solution par loi des cosinus :**
```
cos(θ₂) = (x² + y² - L₁² - L₂²) / (2⋅L₁⋅L₂)
θ₂ = ±arccos(cos(θ₂))
```

### Orientation d'Outils

**Calcul de l'angle d'approche :**
Pour approcher perpendiculairement une surface inclinée d'angle α :
```
θ_outil = 90° - α
```

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

### Étape 1 : Analyse du Problème
1. **Identifier** les contraintes géométriques
2. **Définir** les systèmes de coordonnées
3. **Lister** les inconnues et données
4. **Choisir** les outils mathématiques appropriés

### Étape 2 : Modélisation Mathématique
1. **Établir** les équations de base
2. **Simplifier** si possible
3. **Vérifier** la cohérence dimensionnelle
4. **Prévoir** les cas limites

### Étape 3 : Résolution et Validation
1. **Résoudre** étape par étape
2. **Vérifier** les résultats par méthode alternative
3. **Tester** avec des valeurs limites
4. **Interpréter** physiquement les solutions

## Cas d'Étude Complet : Robot de Soudage

### Contexte
Un robot de soudage 6 axes doit suivre une trajectoire circulaire de rayon 50mm, centrée en (200, 150, 100), dans le plan Z = 100mm.

### Analyse Mathématique

**Paramètrisation de la trajectoire :**
```
x(t) = 200 + 50⋅cos(ωt)
y(t) = 150 + 50⋅sin(ωt)  
z(t) = 100
```

**Vitesses requises :**
```
vx(t) = -50ω⋅sin(ωt)
vy(t) = 50ω⋅cos(ωt)
vz(t) = 0
```

**Accélérations :**
```
ax(t) = -50ω²⋅cos(ωt)
ay(t) = -50ω²⋅sin(ωt)
az(t) = 0
```

### Contraintes de Performance

**Vitesse maximale :** 100 mm/s
```
|v|max = 50ω → ω ≤ 2 rad/s
```

**Accélération maximale :** 500 mm/s²
```
|a|max = 50ω² → ω ≤ √10 ≈ 3.16 rad/s
```

La contrainte de vitesse est **limitante** : ω = 2 rad/s maximum.

### Orientation de l'Outil

**Vecteur tangent à la trajectoire :**
```
T⃗(t) = (-sin(ωt), cos(ωt), 0)
```

**Angle d'orientation :**
```
θ(t) = arctan(cos(ωt) / -sin(ωt)) = ωt - π/2
```

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

### Concepts Maîtrisés ✅

1. **Systèmes de coordonnées** : Cartésien, cylindrique, sphérique
2. **Transformations géométriques** : Translation, rotation, matrices homogènes  
3. **Cinématique** : Directe, inverse, trajectoires
4. **Algèbre vectorielle** : Produits scalaire et vectoriel, applications
5. **Matrices** : Multiplication, inversion, jacobienne
6. **Trigonométrie** : Fonctions, identités, lois des cosinus/sinus

### Formules Essentielles 📐

**Transformation homogène :**
```
[R  t]   [p]   [Rp + t]
[0  1] ⋅ [1] = [  1   ]
```

**Cinématique directe 2D :**
```
x = L₁cos(θ₁) + L₂cos(θ₁+θ₂)
y = L₁sin(θ₁) + L₂sin(θ₁+θ₂)
```

**Vitesse en coordonnées polaires :**
```
vr = ṙ
vθ = rθ̇
```

### Applications Industrielles 🏭

- **Programmation de trajectoires** optimisées
- **Calibrage et étalonnage** de robots
- **Diagnostic de singularités** et limitations
- **Calcul de forces et couples** requis
- **Optimisation de cycles** de production

### Ressources pour Approfondir 📚

- Formulaires mathématiques spécialisés robotique
- Simulateurs de cinématique en ligne
- Logiciels de calcul matriciel (MATLAB, Octave)
- Standards industriels de programmation robot

---

*Cette formation vous donne les bases mathématiques solides nécessaires pour exceller comme technicien en robotique. Continuez à pratiquer ces concepts dans vos applications quotidiennes !*