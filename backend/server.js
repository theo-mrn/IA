import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import axios from 'axios'
import dotenv from 'dotenv'
import fetch from 'node-fetch'
import * as cheerio from 'cheerio'

// Charger les variables d'environnement
dotenv.config()

const app = express()
app.use(cors())
app.use(bodyParser.json())

// Fonction pour décoder les URLs DuckDuckGo
function decodeDuckDuckGoUrl(url) {
  try {
    // Si l'URL ne contient pas de redirection DuckDuckGo, la retourner telle quelle
    if (!url.includes('duckduckgo.com/l/')) {
      return url;
    }
    
    // Extraire le paramètre uddg qui contient l'URL réelle
    const urlObj = new URL(url);
    const uddgParam = urlObj.searchParams.get('uddg');
    
    if (uddgParam) {
      // Décoder l'URL
      const decodedUrl = decodeURIComponent(uddgParam);
      console.log(`🔧 [URL DECODER] URL DuckDuckGo décodée: ${url} -> ${decodedUrl}`);
      return decodedUrl;
    }
    
    return url;
  } catch (error) {
    console.warn(`⚠️ [URL DECODER] Erreur lors du décodage de l'URL: ${url}`, error.message);
    return url;
  }
}

// Fonction de recherche web avec DuckDuckGo
async function searchWeb(query, maxResults = 5) {
  const startTime = Date.now();
  console.log(`🔍 [RECHERCHE WEB] Démarrage de la recherche pour: "${query}"`);
  
  try {
    // Utiliser DuckDuckGo Instant Answer API
    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    console.log(`🌐 [RECHERCHE WEB] Requête vers: ${searchUrl}`);
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    let results = [];
    
    // Ajouter la réponse instantanée si disponible
    if (data.AbstractText) {
      results.push({
        title: data.Heading || 'Information',
        snippet: data.AbstractText,
        url: data.AbstractURL || '',
        type: 'instant_answer'
      });
      console.log(`✅ [RECHERCHE WEB] Réponse instantanée trouvée: "${data.Heading}"`);
    }
    
    // Ajouter les résultats de définition
    if (data.Definition) {
      results.push({
        title: 'Définition',
        snippet: data.Definition,
        url: data.DefinitionURL || '',
        type: 'definition'
      });
      console.log(`✅ [RECHERCHE WEB] Définition trouvée`);
    }
    
    // Ajouter les topics connexes
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      console.log(`✅ [RECHERCHE WEB] ${data.RelatedTopics.length} topics connexes trouvés`);
      data.RelatedTopics.slice(0, 3).forEach(topic => {
        if (topic.Text) {
          results.push({
            title: topic.Text.split(' - ')[0] || 'Information',
            snippet: topic.Text,
            url: topic.FirstURL || '',
            type: 'related_topic'
          });
        }
      });
    }
    
    // Si pas de résultats, essayer une recherche alternative
    if (results.length === 0) {
      console.log(`⚠️ [RECHERCHE WEB] Aucun résultat API, tentative de recherche HTML...`);
      try {
        // Utiliser une recherche HTML simple (limitée mais peut donner des résultats)
        const htmlSearchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        const htmlResponse = await fetch(htmlSearchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        const html = await htmlResponse.text();
        const $ = cheerio.load(html);
        
        $('.result').slice(0, maxResults).each((i, elem) => {
          const title = $(elem).find('.result__title').text().trim();
          const snippet = $(elem).find('.result__snippet').text().trim();
          const rawUrl = $(elem).find('.result__url').attr('href') || '';
          
          // Décoder l'URL DuckDuckGo pour obtenir la vraie URL
          const url = decodeDuckDuckGoUrl(rawUrl);
          
          if (title && snippet) {
            results.push({
              title,
              snippet,
              url,
              type: 'search_result'
            });
          }
        });
        
        if (results.length > 0) {
          console.log(`✅ [RECHERCHE WEB] ${results.length} résultats HTML trouvés`);
        }
      } catch (htmlError) {
        console.log(`❌ [RECHERCHE WEB] Recherche HTML échouée: ${htmlError.message}`);
      }
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (results.length > 0) {
      console.log(`🎉 [RECHERCHE WEB] Succès ! ${results.length} résultats trouvés en ${duration}ms`);
      console.log(`📊 [RECHERCHE WEB] Résultats:`, results.map(r => `- ${r.title} (${r.type})`).join('\n'));
    } else {
      console.log(`❌ [RECHERCHE WEB] Aucun résultat trouvé en ${duration}ms`);
    }
    
    return results.slice(0, maxResults);
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.error(`❌ [RECHERCHE WEB] Erreur après ${duration}ms:`, error.message);
    return [];
  }
}

// Fonction pour détecter et traiter les demandes de recherche
async function processSearchRequest(prompt) {
  console.log(`🔍 [RECHERCHE SYSTÉMATIQUE] Recherche web automatique pour chaque prompt`);
  console.log(`📝 [RECHERCHE SYSTÉMATIQUE] Prompt original: "${prompt}"`);

  // Nettoyer le prompt pour la recherche
  let searchQuery = prompt
    .replace(/[?!.]/g, '') // Enlever la ponctuation
    .trim();

  // Limiter la longueur de la requête de recherche
  if (searchQuery.length > 100) {
    searchQuery = searchQuery.substring(0, 100);
  }

  console.log(`🎯 [RECHERCHE SYSTÉMATIQUE] Requête de recherche: "${searchQuery}"`);
  console.log(`🚀 [RECHERCHE SYSTÉMATIQUE] Lancement de la recherche web obligatoire...`);
  
  const searchResults = await searchWeb(searchQuery);
  
  if (searchResults.length > 0) {
    // Nouveau format structuré pour les résultats
    const structuredResults = {
      query: searchQuery,
      searchDate: new Date().toLocaleString('fr-FR'),
      sources: searchResults.map((result, index) => {
        let domain = null;
        
        // Validation sécurisée de l'URL
        if (result.url && result.url.trim() !== '') {
          try {
            const url = new URL(result.url);
            domain = url.hostname.replace('www.', '');
          } catch (error) {
            console.warn(`⚠️ [URL INVALIDE] Impossible de parser l'URL: "${result.url}"`);
            domain = result.url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
          }
        }
        
        return {
          id: index + 1,
          title: result.title,
          snippet: result.snippet,
          url: result.url || '',
          type: result.type,
          domain: domain || 'Source inconnue'
        };
      }),
      totalResults: searchResults.length
    };

    // Format plus structuré pour l'IA
    let searchContext = `\n\n=== DONNÉES DE RECHERCHE WEB STRUCTURÉES ===\n`;
    searchContext += `Requête: "${searchQuery}"\n`;
    searchContext += `Date: ${structuredResults.searchDate}\n`;
    searchContext += `Sources disponibles: ${structuredResults.totalResults}\n\n`;
    
    searchContext += `INSTRUCTIONS SPÉCIALES POUR LE FORMATAGE:\n`;
    searchContext += `- Utilise des puces (•) pour les listes\n`;
    searchContext += `- Utilise des tirets (-) pour les sous-points\n`;
    searchContext += `- Saute des lignes entre les sections\n`;
    searchContext += `- Cite les sources avec [Source X: nom-du-site]\n`;
    searchContext += `- Organise ta réponse en sections claires\n\n`;
    
    structuredResults.sources.forEach((source) => {
      searchContext += `Source ${source.id}: ${source.title}\n`;
      searchContext += `  Contenu: ${source.snippet}\n`;
      searchContext += `  URL: ${source.url}\n`;
      searchContext += `  Domaine: ${source.domain}\n`;
      searchContext += `  Type: ${source.type}\n\n`;
    });
    
    searchContext += `=== FIN DES DONNÉES DE RECHERCHE ===\n\n`;
    
    console.log(`✅ [RECHERCHE SYSTÉMATIQUE] Recherche terminée avec succès, ${searchResults.length} résultats intégrés`);
    
    return {
      hasSearch: true,
      searchQuery,
      searchResults: structuredResults,
      enhancedPrompt: prompt + searchContext
    };
  } else {
    console.log(`⚠️ [RECHERCHE SYSTÉMATIQUE] Recherche terminée mais aucun résultat trouvé`);
    
    // Même sans résultats, on indique qu'une recherche a été tentée
    let searchContext = `\n\n=== RECHERCHE WEB EFFECTUÉE ===\n`;
    searchContext += `Requête: "${searchQuery}"\n`;
    searchContext += `Date: ${new Date().toLocaleString('fr-FR')}\n`;
    searchContext += `Résultat: Aucun résultat trouvé sur internet pour cette requête.\n`;
    searchContext += `=== FIN DE LA RECHERCHE ===\n\n`;
    
    return {
      hasSearch: true,
      searchQuery,
      searchResults: { query: searchQuery, sources: [], totalResults: 0 },
      enhancedPrompt: prompt + searchContext
    };
  }
}

// Route pour lister les modèles disponibles
app.get('/api/models', async (req, res) => {
  try {
    const ollamaUrl = process.env.OLLAMA_URL || (process.env.NODE_ENV === 'production' ? 'http://ollama:11434' : 'http://localhost:11434');
    
    const response = await axios.get(`${ollamaUrl}/api/tags`, {
      timeout: 5000
    });
    
    res.json(response.data);
  } catch (err) {
    console.error('Erreur lors de la récupération des modèles:', err.message);
    res.status(500).json({ error: 'Impossible de récupérer les modèles' });
  }
});

app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body

  try {
    // Détection automatique de l'environnement
    const ollamaUrl = process.env.OLLAMA_URL || (process.env.NODE_ENV === 'production' ? 'http://ollama:11434' : 'http://localhost:11434');
    
    // Traitement de la recherche web
    const searchResult = await processSearchRequest(prompt);
    
    // Prompt système amélioré avec capacités de recherche
    const systemPrompt = process.env.SYSTEM_PROMPT || `Assistant IA avec accès internet.

    === RECHERCHE ET SOURCES ===
    - Recherche web si nécessaire (infos récentes, vérification, sujets méconnus)
    - TOUJOURS fournir les URLs complètes des sources utilisées
    - Format de citation : [Source: nom-site - URL_COMPLETE]
    - Exemple : [Source: Wikipedia - https://fr.wikipedia.org/wiki/Hypothèse_de_Riemann]
    
    === STYLE DE RÉPONSE ===
    - Langue de l'utilisateur
    - Concis par défaut, développe si demandé explicitement
    - Informations actuelles prioritaires
    - Adapte le niveau de détail selon la complexité
    
    === FORMATAGE ===
    - Structure flexible selon le contexte
    - Puces (•) pour clarifier si nécessaire
    - Lignes sautées entre points importants
    - Pas de formatage rigide imposé
    
    === SOURCES  ===
    Sources consultées au cours de la recherche, s'afficheront en dessous dans une section "Sources":
    - [Nom du site - URL exacte consultée]
    - [Nom du site - URL exacte consultée]
    
    Termine par 'fini'.`;
    
    const fullPrompt = `${systemPrompt}\n\n${searchResult.enhancedPrompt}`;
    
    if (searchResult.hasSearch) {
      console.log(`🌐 Recherche effectuée pour: "${searchResult.searchQuery}"`);
    }
    
    // Configuration du streaming avec métadonnées
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Search-Metadata': encodeURIComponent(JSON.stringify(searchResult.searchResults))
    });

    // Envoyer les métadonnées de recherche en premier
    res.write(`__SEARCH_METADATA__${JSON.stringify(searchResult.searchResults)}__END_METADATA__\n`);

    const response = await axios.post(`${ollamaUrl}/api/generate`, {
      model: 'mistral:latest',
      prompt: fullPrompt,
      stream: true,
      // Paramètres d'optimisation
      options: {
        temperature: 0.7,
        top_p: 0.9,
        repeat_penalty: 1.1,
        num_predict: 2048, // Limite le nombre de tokens
        num_ctx: 4096, // Contexte optimal
        num_batch: 512, // Traitement par batch
        num_thread: 4 // Utilise 4 threads
      }
    }, {
      responseType: 'stream',
      timeout: 30000, // 30 secondes timeout
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    })

    response.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.response) {
            res.write(data.response);
          }
          if (data.done) {
            res.end();
          }
        } catch (parseError) {
          console.error('Erreur parsing JSON:', parseError);
        }
      }
    });

    response.data.on('end', () => {
      if (!res.headersSent) {
        res.end();
      }
    });

    response.data.on('error', (error) => {
      console.error('Erreur stream:', error);
      if (!res.headersSent) {
        res.write(`Erreur stream: ${error.message}`);
        res.end();
      }
    });

  } catch (err) {
    console.error(err.message)
    if (!res.headersSent) {
      res.write(`Erreur: ${err.message}`);
      res.end();
    }
  }
})

app.listen(3001, () => {
  console.log('🚀 Backend lancé sur http://localhost:3001')
  console.log('🌐 Recherche web activée avec DuckDuckGo')
})