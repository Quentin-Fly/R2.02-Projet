// Fonction qui gère l'affichage des formulaires de connexion et d'inscription avec le bouton switch
const btnConnexion = document.getElementById("switch_connexion");
const btnInscription = document.getElementById("switch_inscription");
const swtConteneur = document.querySelector(".switch");

const formConnexion = document.getElementById("formulaire_connexion");
const formInscription = document.getElementById("formulaire_inscription");

btnConnexion.addEventListener("click", () => 
{
    formConnexion.classList.add("active");
    formInscription.classList.remove("active");

    btnConnexion.classList.add("active");
    btnInscription.classList.remove("active");

    // On retire la classe pour remettre le switch à sa position initiale (gauche)
    swtConteneur.classList.remove("signup-active");
});

btnInscription.addEventListener("click", () => 
{
    formInscription.classList.add("active");
    formConnexion.classList.remove("active");

    btnInscription.classList.add("active");
    btnConnexion.classList.remove("active");

    // On ajoute la classe pour déplacer le switch vers la droite
    swtConteneur.classList.add("signup-active");
});

// Fonction qui gère l'aperçu de la photo de profil dans le formulaire d'inscription
const inputImage = document.getElementById("image");
const photoProfilApercu = document.getElementById("photo_profil_apercu");

inputImage.addEventListener("change", () =>
{
    const fichier = inputImage.files[0];
    if (fichier)
    {
        const lecteur = new FileReader();
        lecteur.onload = () =>
        {
            photoProfilApercu.src = lecteur.result;
        }
        lecteur.readAsDataURL(fichier);
    }
});

// Fonction qui gère la validation du formulaire d'inscription
document.getElementById("formulaire_inscription").addEventListener("submit", function (event)
{
    event.preventDefault();
    
    // Récupération des valeurs du formulaire
    const pdp = document.getElementById("image").files[0];
    const nom = document.getElementById("nom").value.trim();
    const prenom = document.getElementById("prenom").value.trim();
    const email = document.getElementById("email").value.trim();
    const mdp = document.getElementById("mdp_inscription").value;
    const mdp_confirmation = document.getElementById("confirmation_mdp").value;
    const reglementOK = document.getElementById("conditions").checked;

    // Récupération des profils existants
    const profilsExistants = recuperationProfilsExistants();

    // Validation des données
    let message_erreur = [];

    if (nom === "")
    { 
        message_erreur.push("Le nom est requis."); 
    }
    if (prenom === "") 
    { 
        message_erreur.push("Le prénom est requis."); 
    }
    if (!email.includes("@")) 
    { 
        message_erreur.push("L'email n'est pas valide."); 
    }
    if (profilsExistants.some(profil => profil.email === email)) 
    {
        message_erreur.push("Cet email est déjà utilisé.");
    }
    if (mdp === "")
    { 
        message_erreur.push("Le mot de passe est requis."); 
    }
    if (mdp !== mdp_confirmation) 
    { 
        message_erreur.push("Les mots de passe ne correspondent pas."); 
    }
    if (!reglementOK) 
    { 
        message_erreur.push("Vous devez accepter les conditions d'utilisation."); 
    }

    // Gestion du message d'erreur
    const erreur = document.getElementById("message_erreur");

    if (message_erreur.length > 0)
    {
        // Cible spécifiquement la pop-up d'erreur
        const boite_pop_up = document.querySelector(".pop_up.erreur");
        const contenu_pop_up = boite_pop_up.querySelector(".pop_up_contenu");

        // Nettoyage des classes d'animation de fermeture
        boite_pop_up.classList.remove("fond_disparition");
        contenu_pop_up.classList.remove("en_fermeture");

        void boite_pop_up.offsetWidth;

        // Affichage du pop-up d'erreur
        boite_pop_up.classList.add("active");
        erreur.innerHTML = `<ul>${message_erreur.map(msg => `<li>${msg}</li>`).join("")}</ul>`;
    }
    else
    {
        enregistrementDonneeInscription(pdp, nom, prenom, email, mdp);
        document.querySelector(".pop_up.succes").classList.add("active"); // Affiche le pop-up de succès
        
        // Réinitialisation du formulaire
        document.getElementById("formulaire_inscription").reset();
        document.getElementById("photo_profil_apercu").src = "data/utilisateur.png";
        document.getElementById("switch_connexion").click();
    }
});

// Fonction qui gère la validation du formulaire de connexion
document.getElementById("formulaire_connexion").addEventListener("submit", function (event)
{
    event.preventDefault();

    // Récupération des valeurs du formulaire
    const email = document.getElementById("email_connexion").value.trim();
    const mdp = document.getElementById("mdp_connexion").value;

    // Récupération des profils existants
    const profils_existants = recuperationProfilsExistants();

    // Validation des données
    const profil_trouve = profils_existants.find(profil => profil.email === email && profil.mdp === mdp);

    // Récupération du message d'erreur
    const erreur = document.getElementById("message_erreur");


    if (profil_trouve)
    {
        // Redirection vers le fils d'actualité
        afficherFilActualite();
    }
    else
    {
        // Affichage pop up message erreur
        const boite_pop_up = document.querySelector(".pop_up.erreur");
        const contenu_pop_up = boite_pop_up.querySelector(".pop_up_contenu");

        // Nettoyage des classes d'animation de fermeture
        boite_pop_up.classList.remove("fond_disparition");
        contenu_pop_up.classList.remove("en_fermeture");

        void boite_pop_up.offsetWidth;

        // Affichage du pop-up d'erreur
        boite_pop_up.classList.add("active");
        contenu_pop_up.querySelector("h2").textContent = "Erreur de connexion";
        erreur.textContent = "Email ou mot de passe incorrect.";
        
    }
});

// Fonction pour fermer la pop-up d'erreur ou de succès avec une animation de disparition
function fermerPopUp(type)
{
    const boite_pop_up = document.querySelector(`.pop_up.${type}`);   
    const contenu_pop_up = boite_pop_up.querySelector(".pop_up_contenu");

    boite_pop_up.classList.add("fond_disparition"); 
    contenu_pop_up.classList.add("en_fermeture");   
    
    setTimeout(() => 
    {
        boite_pop_up.classList.remove("active");
        boite_pop_up.classList.remove("fond_disparition");
        contenu_pop_up.classList.remove("en_fermeture");
    }, 300);
}

// Fonction qui récupère les données des profils
function recuperationProfilsExistants()
{
    const profils = localStorage.getItem("profils");
    if (profils) 
    {
        return JSON.parse(profils);
    }
    return [];
}

// Fonction pour enregistrer le nouveau profil utilisateur
function enregistrementDonneeInscription(image, nom, prenom, email, mdp)
{
    const profils = recuperationProfilsExistants();

    const nouveau_profil = 
    {
        image: image,
        nom: nom,
        prenom: prenom,
        email: email,
        mdp: mdp
    };

    profils.push(nouveau_profil);
    localStorage.setItem("profils", JSON.stringify(profils));
}

// Fonction pour faire disparaître la section page d'acceuil et afficher la section : fils d'actualité
function afficherFilActualite()
{
    const page_accueil = document.querySelector("#page_accueil");
    const fil_actualite = document.querySelector("#fil_actualite");

    page_accueil.style.display = "none";
    fil_actualite.style.display = "block";
}