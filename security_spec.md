# Spécification de Sécurité Cloud Firestore — LekòlWeb

## 1. Invariants de Données et Règles d'Accès

- **Propriété Institutionnelle** : Un établissement scolaire (`/schools/{schoolId}`) est strictement modifiable uniquement par son propriétaire (`ownerId == request.auth.uid`) ou par un administrateur plateforme autorisé (`isAdmin()`).
- **Isolation des Sous-Ressources (Master Gate)** : Toutes les sous-collections d'une école (`siteConfig`, `news`, `gallery`, `applications`) dérivent leurs autorisations d'écriture du document parent `/schools/{schoolId}`.
- **Accès Public Restreint** : Les visiteurs non-authentifiés peuvent lire uniquement les contenus publiés (`status == 'published'`). Les brouillons demeurent privés.
- **Protection Maximale des Candidatures (Admissions PII)** : Le grand public peut créer un dossier de pré-inscription avec statut initial obligatoire `'received'`. Les visiteurs publics n'ont **AUCUN droit de lecture** sur les candidatures ou les notes internes d'admission. Seul le propriétaire de l'école ou le super-administrateur peut lire et traiter les dossiers.
- **Sous-Domaines Atomiques** : La collection `/subdomainReservations/{slug}` empêche l'attribution du même sous-domaine à deux écoles distinctes.
- **Protection des Rôles Administratifs** : Un utilisateur ne peut pas s'auto-attribuer le rôle administrateur. Le statut d'administrateur est validé via l'adresse sécurisée `madjyboy25@gmail.com` ou la collection protégée `/admins/{userId}`.

---

## 2. The Dirty Dozen — 12 Vecteurs d'Attaque Testés

1. **Tentative de lecture publique de dossiers de pré-inscription (`/schools/x/applications/y`)** -> DOIT être rejetée (PERMISSION_DENIED).
2. **Tentative de modification des notes internes d'admission par un parent** -> DOIT être rejetée (PERMISSION_DENIED).
3. **Usurpation d'identité d'école (modifier une école d'un autre directeur)** -> DOIT être rejetée (PERMISSION_DENIED).
4. **Injection de slug réservé (`admin`, `www`, `api`)** -> Validé au niveau applicatif et rejeté par règle de réservation.
5. **Tentative de publication avec statut 'verified' auto-attribué** -> Seul un admin peut accorder le statut `verified`.
6. **Lecture de brouillons d'actualités par un visiteur anonyme** -> DOIT être rejetée (PERMISSION_DENIED).
7. **Écriture dans `/admins/{uid}` par un utilisateur régulier** -> DOIT être rejetée (PERMISSION_DENIED).
8. **Altération de l'ownerId d'une école lors d'une mise à jour** -> DOIT être rejetée (`request.resource.data.ownerId == resource.data.ownerId`).
9. **Injection d'identifiant malveillant non-conforme (junk id > 128 chars)** -> DOIT être rejetée par `isValidId()`.
10. **Création d'une candidature avec statut 'accepted' direct par le parent** -> DOIT être rejetée (statut obligatoire: `received`).
11. **Suppression arbitraire de photos de galerie d'une autre école** -> DOIT être rejetée (PERMISSION_DENIED).
12. **Écriture directe sur la racine de la base de données** -> Rejetée par le filet de sécurité global (`allow read, write: if false;`).
