'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SendIcon, LoaderIcon, Sparkles, Search, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormattedResponse } from '@/components/ui/formatted-response';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMetadata, setSearchMetadata] = useState<any>(null);

  // Fonction pour détecter si le prompt contient une demande de recherche
  const detectSearchRequest = (prompt: string) => {
    // Maintenant, chaque prompt déclenche une recherche web
    if (prompt.trim().length > 0) {
      // Nettoyer le prompt pour l'affichage
      let searchQuery = prompt
        .replace(/[?!.]/g, '')
        .trim();
      
      // Limiter la longueur pour l'affichage
      if (searchQuery.length > 50) {
        searchQuery = searchQuery.substring(0, 50) + '...';
      }
      
      return searchQuery;
    }
    return '';
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setLoading(true);
    setResponse('');
    setSearchMetadata(null);
    
    // Maintenant, chaque prompt déclenche une recherche web
    const searchQuery = prompt
      .replace(/[?!.]/g, '')
      .trim();
    
    if (searchQuery.length > 50) {
      setSearchQuery(searchQuery.substring(0, 50) + '...');
    } else {
      setSearchQuery(searchQuery);
    }
    
    setIsSearchingWeb(true);
    console.log('🔍 Recherche web systématique pour:', searchQuery);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const fullUrl = `${apiUrl}/api/generate`;
      console.log('Fetching from:', fullUrl);
      
      const res = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);
      console.log('Response headers:', res.headers);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      // Lecture en streaming
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      
      if (reader) {
        let currentResponse = '';
        let metadataProcessed = false;
        
        console.log('📡 Démarrage du streaming...');
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('🎉 Streaming terminé');
            break;
          }
          
          const chunk = decoder.decode(value, { stream: true });
          console.log('📦 Chunk reçu:', chunk.substring(0, 100) + '...');
          
          // Traiter les métadonnées de recherche
          if (!metadataProcessed && chunk.includes('__SEARCH_METADATA__')) {
            console.log('📊 Traitement des métadonnées...');
            const metadataMatch = chunk.match(/__SEARCH_METADATA__([\s\S]*?)__END_METADATA__/);
            if (metadataMatch) {
              try {
                const metadataString = metadataMatch[1];
                console.log('📊 Métadonnées brutes:', metadataString.substring(0, 100) + '...');
                const metadata = JSON.parse(metadataString);
                setSearchMetadata(metadata);
                console.log('📊 Métadonnées de recherche reçues:', metadata);
              } catch (error) {
                console.error('❌ Erreur parsing métadonnées:', error);
                console.error('❌ Contenu problématique:', metadataMatch[1]);
              }
              metadataProcessed = true;
              // Enlever les métadonnées du chunk
              const cleanChunk = chunk.replace(/__SEARCH_METADATA__[\s\S]*?__END_METADATA__\n/, '');
              if (cleanChunk) {
                currentResponse += cleanChunk;
                setResponse(currentResponse);
                console.log('💬 Réponse mise à jour:', currentResponse.substring(0, 50) + '...');
              }
            } else {
              console.log('❌ Pas de match trouvé pour les métadonnées');
            }
          } else if (metadataProcessed) {
            currentResponse += chunk;
            setResponse(currentResponse);
            console.log('💬 Réponse mise à jour:', currentResponse.substring(0, 50) + '...');
          } else {
            console.log('⏳ En attente des métadonnées...');
          }
          
          // Désactiver l'indicateur de recherche après les premiers caractères
          if (currentResponse.length > 10 && isSearchingWeb) {
            setIsSearchingWeb(false);
            console.log('🔍 Recherche terminée');
          }
        }
      } else {
        console.error('❌ Pas de reader disponible');
      }
      
    } catch (error) {
      console.error('❌ Error:', error);
      setResponse(`Erreur lors de la communication avec le backend: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
      setIsSearchingWeb(false);
      console.log('🏁 Génération terminée');
    }
  };

  return (
    <div className="min-h-screen flex flex-col w-full items-center justify-center bg-black text-white p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
        <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-fuchsia-500/10 rounded-full mix-blend-normal filter blur-[96px] animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-4xl mx-auto relative">
        <motion.div 
          className="relative z-10 space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="text-center space-y-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block"
            >
              <h1 className="text-4xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white/90 to-white/40 pb-1">
                Yner Chat
              </h1>
              <motion.div 
                className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </motion.div>
            <motion.p 
              className="text-sm text-white/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              demander a Fred  ce que vous voulez
            </motion.p>
          </div>

          {/* Indicateur de recherche web */}
          <AnimatePresence>
            {isSearchingWeb && (
              <motion.div 
                className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 backdrop-blur-2xl bg-blue-500/[0.1] rounded-full px-6 py-3 shadow-lg border border-blue-500/[0.2]"
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Globe className="w-5 h-5 text-blue-400" />
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-blue-400"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-sm text-white/90">
                      <span className="font-medium">🔍 Recherche web en cours...</span>
                      <SearchDots />
                    </div>
                    {searchQuery && (
                      <div className="text-xs text-blue-300/70 mt-1">
                        Recherche: "{searchQuery}"
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.div 
            className="relative backdrop-blur-2xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl"
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <form onSubmit={handleGenerate} className="p-6 space-y-6">
              <div className="space-y-3">
                <label htmlFor="prompt" className="block text-sm font-medium text-white/70">
                  Votre prompt :
                </label>
                <div className="relative">
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Écrivez votre prompt ici... (Ex: 'recherche les dernières nouvelles sur l'IA')"
                    className={cn(
                      "w-full px-4 py-3 rounded-lg",
                      "bg-white/[0.02] backdrop-blur-xl",
                      "border border-white/[0.05] focus:border-white/[0.1]",
                      "text-white/90 placeholder:text-white/30",
                      "focus:outline-none focus:ring-2 focus:ring-violet-500/30",
                      "resize-none transition-all duration-200",
                      "min-h-[120px]"
                    )}
                    rows={4}
                    required
                  />
                  {prompt && (
                    <motion.div 
                      className="absolute top-2 right-2 text-violet-400"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                  )}
                  
                  {/* Indicateur de recherche détectée */}
                  {prompt.trim() && (
                    <motion.div 
                      className="absolute bottom-2 left-2 flex items-center gap-2 text-blue-400 text-xs"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Search className="w-3 h-3" />
                      <span>Recherche web systématique</span>
                    </motion.div>
                  )}
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading || !prompt.trim()}
                className={cn(
                  "w-full px-6 py-3 rounded-lg font-medium transition-all duration-200",
                  "bg-gradient-to-r from-violet-500 to-indigo-500",
                  "hover:from-violet-600 hover:to-indigo-600",
                  "text-white shadow-lg shadow-violet-500/20",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "flex items-center justify-center gap-2"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <>
                    <LoaderIcon className="w-4 h-4 animate-spin" />
                    {isSearchingWeb ? 'Recherche en cours...' : 'Génération...'}
                  </>
                ) : (
                  <>
                    <SendIcon className="w-4 h-4" />
                    Envoyer
                  </>
                )}
              </motion.button>
              
            </form>
          </motion.div>

          {/* Response */}
          <AnimatePresence>
            {response && (
              <motion.div 
                className="relative backdrop-blur-2xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white/70">Assistant</span>
                </div>
                
                <FormattedResponse response={response} metadata={searchMetadata} className="max-w-none" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

function SearchDots() {
  return (
    <div className="flex items-center ml-1">
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          className="w-1 h-1 bg-blue-400 rounded-full mx-0.5"
          initial={{ opacity: 0.3 }}
          animate={{ 
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: dot * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
