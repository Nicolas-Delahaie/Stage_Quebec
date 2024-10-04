/**
 * @todo faire en sorte que toutes les pages se re-rendent lorsque estConnecte est modifié 
 */
import { createContext } from 'react';  //Pour generer le contexte
import Cookies from 'js-cookie';        //Pour récupérer les cookies
import { useState } from 'react';        //Pour utiliser les variables d'état
import { useNavigate } from 'react-router-dom'; //Pour naviguer entre les pages

/* création du contexte */
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // --- COOKIES ---
    /**
     * @brief Retourne le token de l'utilisateur, undefined s il n est pas connecté
     * @details Met egalement a jour la variable estConnecte 
     * @returns string, undefined
     */
    const getToken = () => {
        return Cookies.get('token');
    }
    const getType = () => {
        return Cookies.get('userType');
    }
    const getEstCoordo = () => {
        return Cookies.get('estCoordo');
    }

    // --- VARIABLES GLOBALES ---
    const [estConnecte, setEstConnecte] = useState(getToken() !== undefined);


    // --- CONNEXION / DECONNEXION ---
    /**
     * @brief Connecte l utilsisateur
     * @details Cree le cookie de tokken et met a jour la variable estConnecte 
     */
    const connexionFront = (token, dureeSessionEnMin, userType, estCoordo) => {
        const dureeSessionEnH = dureeSessionEnMin / 60;
        const dureeSessionEnJ = dureeSessionEnH / 24;
        Cookies.set("token", token, { expires: dureeSessionEnJ });
        Cookies.set("userType", userType, { expires: dureeSessionEnJ });
        Cookies.set("estCoordo", estCoordo, { expires: dureeSessionEnJ });
        setEstConnecte(true);
    }
    const navigate = useNavigate();     //Pour naviguer entre les pages
    const deconnexionFront = () => {
        Cookies.remove('token');
        Cookies.remove('userType');
        setEstConnecte(false);
        navigate("/");
    }
    /**
     * @brief Deconnecte l utilisateur du front et du back
     * @details Supprime les cookies, met a jour la variable estConnecte et redirige vers la page de connexion, tout en rendant invalide le token en base de données
     */
    const deconnexion = async () => {
        // Deconnexion back
        await apiAccess({
            url: "http://localhost:8000/api/logout",
            method: "post",
        });
        // Dexonnexion front
        deconnexionFront();
    }


    // --- FONCTIONS UTILES ---
    /**
     * @brief Permet d'envoyer une requête à une API avec vérification de l'authentification.
     * @details Cette fonction envoie une requête à une API en utilisant l'URL spécifiée et effectue des vérifications d'authentification.
     * 
     * @param url L'URL de l'API (obligatoire).
     * @param method La méthode HTTP de la requête. Une chaîne de caractères représentant la méthode HTTP, par exemple "GET", "POST", "PUT" (par défaut : "GET").
     * @param body Le corps de la requête. Un objet dictionnaire représentant les données à envoyer dans le corps de la requête (par défaut : undefined).
     * 
     * @returns Un objet contenant les résultats de la requête avec les propriétés suivantes :
     *          - success : Un booléen indiquant si la requête a réussi.
     *          - statusCode : Le code de statut de la réponse HTTP.
     *          - data : Les données renvoyées par la requête.
     *          - error : Une chaîne de caractères représentant un message d'erreur en cas d'échec de la requête.
     */
    const apiAccess = async ({
        url,
        method = "get",
        body = undefined,
        needAuth = true
    }) => {
        // -- CONSTANTES --
        const errorMessages = {
            400: "Requete mal formée",
            401: "Authentification necessaire",
            403: "Vous ne pouvez pas accéder à ces données",
            404: "La ressource n'existe pas",
            422: "Mauvais format de reponse",
            503: "Service indisponible (surcharge ou maintenance)",
            default: "Erreur de serveur"
        }

        // -- PRE-TRAITEMENTS --
        // Verificaton de l authentification
        const token = getToken();
        console.log(token);
        if (needAuth && !token) {
            // Aucun utilisateur connecte
            setEstConnecte(false);
            return {
                success: false,
                statusCode: 401,
                datas: undefined,
                erreur: errorMessages[401]
            };
        }

        // -- TRAITEMENT --
        console.log(url);
        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                "Authorization": needAuth && `Bearer ${token}`,
            },
            body: body && JSON.stringify(body),
        })
            .catch(err => {
                return {
                    success: false,
                    statusCode: 500,
                    erreur: errorMessages.default
                }
            })

        // -- RETOUR --
        if (res.ok) {
            // La requete a reussi
            return {
                success: true,
                statusCode: res.status,
                datas: res.status === 204 ? {} : await res.json(),      // On ne fait pas json() s il n y a pas de contenu
            }
        }
        else {
            // La requete a echoue
            if (needAuth && res.status === 401) {
                // Le tokken n est plus valide mais existe encore en local
                deconnexionFront();
            }

            return {
                success: false,
                statusCode: res.status,
                erreur: errorMessages[res.status] || errorMessages.default
            }
        }
    }


    return (
        <AppContext.Provider value={{ deconnexion, connexionFront, estConnecte, apiAccess, getType, getEstCoordo }}>
            {children}
        </AppContext.Provider>
    );
};