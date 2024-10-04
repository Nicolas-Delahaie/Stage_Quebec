//Librairies
import React from 'react';      //Pour mettre des key aux balises vides 

/**
 * Affiche un tableau avec les liberations triees par annee et par semestre sur une duree souhaitee
 * @param {array} liberations 
 * @param {int} anneesAvant nomre d'années qu on veut afficher avant l annee actuelle 
 * @param {int} anneesApres nomre d'années qu on veut afficher apres l annee actuelle
 * @returns 
 */
function TableauLiberation({ liberations, anneesAvant = 1, anneesApres = 1 }) {
    /**
     * @brief On retourne le motif de la liberation avoir un signe devant pour preciser sa nature
     * @details x si c est non periodique
     * @details - si c est chaque semestre
     * @details | si c est chaque annee
     * @details * si c est chaque semestre d une annee
     */
    const statutLiberation = (liberation) => {

        if (liberation.pivot.annee === null && liberation.pivot.semestre === null) {
            return "*";
        }
        else if (liberation.pivot.annee === null && liberation.pivot.semestre !== null) {
            return "|";
        }
        else if (liberation.pivot.annee !== null && liberation.pivot.semestre === null) {
            return "-";
        }
        else {
            return "+";
        }
    }

    const hoverStatutLiberation = (liberation) => {
        switch (statutLiberation(liberation)) {
            case "*":
                return "Chaque semestre de chaque annee";
            case "|":
                return "Tous les semestres " + liberation.pivot.semestre;
            case "-":
                return "Toute l'annee " + liberation.pivot.annee;
            case "+":
                return "Uniquement au semestre" + liberation.pivot.semestre + " de l'année " + liberation.pivot.annee;
            default:
                console.error("Erreur hover");
        }
    }

    /**
     * Retourne les liberations d un semestre d une annee donnee
     * @param {int} annee de la liberation voulue 
     * @param {int} semestre de la liberation voulue 
     * @returns 
     */
    const liberationsDuSemestre = (annee, semestre) => {
        return liberations.filter((liberation) => {
            return (liberation.pivot.annee === annee || liberation.pivot.annee === null) &&
                (liberation.pivot.semestre === semestre || liberation.pivot.semestre === null);
        });
    };

    // Transformation du parametre en cas de null (pour que le map fonctionne)
    if (!liberations) {
        liberations = [];
    }

    // On genere les annees a afficher de la forme "[2022, 2023, 2024]"
    var anneesAAfficher = [];
    const anneeActuelle = new Date().getFullYear();
    const anneeDebut = anneeActuelle - anneesAvant;
    const anneeFin = anneeActuelle + anneesApres;
    for (var i = anneeDebut; i <= anneeFin; i++) {
        anneesAAfficher.push(i);
    }

    return (
        <table>
            <tr>
                <th>Semestre</th>
                <th>1</th>
                <th>2</th>
            </tr>
            {
                anneesAAfficher.map((annee) => {
                    // Pour chaque annee (ligne)
                    return (
                        <tr key={annee}>
                            <td className={annee === anneeActuelle ? "anneeActuelle" : undefined}>{annee}-{annee + 1}</td >
                            {
                                [1, 2].map((semestre) => {
                                    // Pour chaque semestre (case)
                                    return (
                                        <td key={annee + semestre}>{
                                            liberationsDuSemestre(annee, semestre).map((liberation) => {
                                                // Pour chaque liberation (ligne d une case)
                                                return <div title={hoverStatutLiberation(liberation)} key={liberation.id + liberation.pivot.annee + liberation.pivot.semestre}>
                                                    {statutLiberation(liberation)} {liberation.motif} ({(liberation.pivot.tempsAloue * 100).toFixed(1)}%)
                                                </div>
                                            })}
                                        </td>
                                    )
                                })
                            }
                        </tr>
                    )
                })
            }
        </table>
    )
}
export default TableauLiberation;