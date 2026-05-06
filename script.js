// Fonction qui gère l'affichage des formulaires de connexion et d'inscription avec le bouton switch

const btnConnexion = document.getElementById("switch_connexion");
const btnInscription = document.getElementById("switch_inscription");

const formConnexion = document.getElementById("formulaire_connexion");
const formInscription = document.getElementById("formulaire_inscription");

btnConnexion.addEventListener("click", () => 
{
    formConnexion.classList.add("active");
    formInscription.classList.remove("active");

    btnConnexion.classList.add("active");
    btnInscription.classList.remove("active");
});

btnInscription.addEventListener("click", () => 
{
    formInscription.classList.add("active");
    formConnexion.classList.remove("active");

    btnInscription.classList.add("active");
    btnConnexion.classList.remove("active");
});