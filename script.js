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

    // On retire la classe pour remettre le switch à sa position initiale
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
    const mdp = document.getElementById("mdp").value;
    const mdp_confirmation = document.getElementById("mdp_confirmation").value;
    const reglementOK = document.getElementById("conditions").checked;

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

    const erreur = document.querySelector(".erreur");

    if (message_erreur.length > 0)
    {
        erreur.innerHTML = `<h2>Erreurs de validation:</h2><ul>${message_erreur.map(msg => `<li>${msg}</li>`).join("")}</ul>`;
    }
});