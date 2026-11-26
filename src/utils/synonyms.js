/**
 * synonyms.js
 *
 * Dictionnaire et utilitaires de synonymes pour le Lost & Found.
 * Gère la normalisation (minuscules, retrait des accents) et
 * l'expansion intelligente des mots-clés de recherche.
 */

// Familles de synonymes courantes avec versions accentuées et courantes
const SYNONYM_GROUPS = [
    ["téléphone", "telephone", "portable", "smartphone", "mobile", "iphone", "samsung", "huawei", "xiaomi"],
    ["sac", "sacoche", "cartable", "besace", "pochette", "sac à dos", "sac a dos", "bagage", "valise"],
    ["portefeuille", "porte-monnaie", "porte monnaie", "porte-cartes", "porte cartes", "papiers", "billet"],
    ["clé", "clés", "cle", "cles", "clef", "clefs", "trousseau", "badge", "bip", "pass"],
    ["écouteurs", "ecouteurs", "airpods", "casque", "oreillette", "buds", "earbuds"],
    ["ordinateur", "pc", "macbook", "laptop", "portable", "tablette", "ipad"],
    ["lunettes", "lunettes de soleil", "monture", "verres"],
    ["montre", "smartwatch", "montre connectée", "montre connectee", "apple watch"],
    ["bijou", "bijoux", "bague", "collier", "bracelet", "chaîne", "chaine", "boucle d'oreille", "alliance"],
    ["vêtement", "vetement", "veste", "manteau", "blouson", "écharpe", "echarpe", "pull", "gilet", "bonnet", "casquette", "chapeau"],
    ["parapluie", "ombrelle"],
    ["livre", "cahier", "manuel", "classeur", "agenda"]
];

/**
 * Normalise une chaîne : minuscules, suppression des accents et caractères spéciaux.
 * @param {string} str
 * @returns {string}
 */
export const normalizeText = (str = "") => {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Enlève les accents (é -> e, à -> a, etc.)
        .replace(/[^\w\s]/g, " ")       // Remplace la ponctuation par un espace
        .replace(/\s+/g, " ")           // Espaces multiples -> simple
        .trim();
};

/**
 * Trouve tous les synonymes associés à un terme ou une expression.
 * @param {string} term
 * @returns {string[]} Liste des synonymes (incluant le terme lui-même si trouvé)
 */
export const getSynonymsForTerm = (term = "") => {
    const cleanTerm = normalizeText(term);
    if (!cleanTerm) return [];

    const matches = new Set();

    for (const group of SYNONYM_GROUPS) {
        const hit = group.some((word) => {
            const cleanWord = normalizeText(word);
            return cleanWord === cleanTerm || cleanTerm.includes(cleanWord) || cleanWord.includes(cleanTerm);
        });

        if (hit) {
            group.forEach((w) => matches.add(w));
        }
    }

    return Array.from(matches);
};

/**
 * Élargit une requête utilisateur en y ajoutant les synonymes pertinents
 * pour l'index textuel MongoDB.
 *
 * Ex: "sacoche noir" -> "sacoche noir sac cartable besace"
 *
 * @param {string} rawQuery
 * @returns {{ original: string, expanded: string, synonymsAdded: string[] }}
 */
export const expandQueryWithSynonyms = (rawQuery = "") => {
    if (!rawQuery || typeof rawQuery !== "string") {
        return { original: "", expanded: "", synonymsAdded: [] };
    }

    const clean = normalizeText(rawQuery);
    const tokens = clean.split(" ").filter((t) => t.length > 1);

    const synonymsFound = new Set();

    // 1. Tester l'expression complète (ex: "sac a dos")
    const fullSyns = getSynonymsForTerm(clean);
    fullSyns.forEach((s) => synonymsFound.add(s));

    // 2. Tester chaque mot individuel (ex: "sacoche")
    for (const token of tokens) {
        const tokenSyns = getSynonymsForTerm(token);
        tokenSyns.forEach((s) => synonymsFound.add(s));
    }

    // Retirer les termes déjà présents dans la requête originale pour la liste des ajouts
    const additions = Array.from(synonymsFound).filter(
        (syn) => !tokens.includes(normalizeText(syn)) && normalizeText(syn) !== clean
    );

    // On combine les mots originaux et les synonymes (limité à 6 synonymes max pour éviter le bruit)
    const expandedList = [rawQuery, ...additions.slice(0, 6)];
    const expanded = expandedList.join(" ").trim();

    return {
        original: rawQuery,
        expanded,
        synonymsAdded: additions.slice(0, 6)
    };
};

export default {
    normalizeText,
    getSynonymsForTerm,
    expandQueryWithSynonyms
};
