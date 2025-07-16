import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Globe, Clock, CheckCircle, Quote, Link2 } from 'lucide-react';

interface Source {
  id: number;
  title: string;
  url: string;
  domain: string;
  type: string;
}

interface FormattedResponseProps {
  response: string;
  metadata?: any;
  className?: string;
}

export function FormattedResponse({ response, metadata, className = '' }: FormattedResponseProps) {
  const parseResponse = (text: string) => {
    // Extraire les sources citées dans le texte - nouveau format
    const newSourceRegex = /Source:\s*\[(.*?)\s*-\s*(https?:\/\/[^\]]+)\]/g;
    // Ancien format pour compatibilité
    const oldSourceRegex = /\[Source (\d+): ([^\]]+)\]/g;
    
    const sources: Source[] = [];
    let match;
    let sourceId = 1;
    
    // Parser le nouveau format : Source: [nom - url]
    while ((match = newSourceRegex.exec(text)) !== null) {
      const sourceName = match[1].trim();
      const sourceUrl = match[2].trim();
      
      if (!sources.find(s => s.url === sourceUrl)) {
        // Extraire le domaine de l'URL
        let domain = sourceName;
        try {
          const url = new URL(sourceUrl);
          domain = url.hostname.replace('www.', '');
        } catch (error) {
          console.warn('URL invalide:', sourceUrl);
        }
        
        sources.push({
          id: sourceId++,
          title: sourceName,
          url: sourceUrl,
          domain: domain,
          type: 'web'
        });
      }
    }
    
    // Parser l'ancien format pour compatibilité : [Source 1: nom]
    while ((match = oldSourceRegex.exec(text)) !== null) {
      const sourceIdOld = parseInt(match[1]);
      const sourceName = match[2];
      
      if (!sources.find(s => s.id === sourceIdOld)) {
        // Utiliser les métadonnées si disponibles
        let sourceUrl = '';
        let sourceDomain = sourceName;
        
        if (metadata && metadata.sources) {
          const metadataSource = metadata.sources.find((s: any) => s.id === sourceIdOld);
          if (metadataSource) {
            sourceUrl = metadataSource.url || '';
            sourceDomain = metadataSource.domain || sourceName;
          }
        }
        
        sources.push({
          id: sourceIdOld,
          title: sourceName,
          url: sourceUrl,
          domain: sourceDomain,
          type: 'web'
        });
      }
    }
    
    // Nettoyer le texte en enlevant les références aux sources
    let cleanText = text.replace(newSourceRegex, '');
    cleanText = cleanText.replace(oldSourceRegex, '');
    
    // Nettoyer aussi les lignes vides qui pourraient rester
    cleanText = cleanText.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Séparer en sections
    const sections = cleanText.split('\n\n').filter(section => section.trim());
    
    return { sections, sources };
  };

  const formatSection = (section: string, index: number) => {
    const lines = section.split('\n').filter(line => line.trim());
    
    return (
      <motion.div
        key={index}
        className="mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        {lines.map((line, lineIndex) => {
          const trimmedLine = line.trim();
          
          // Titre de section (numéroté)
          if (/^\d+\./.test(trimmedLine)) {
            return (
              <motion.h3 
                key={lineIndex} 
                className="text-lg font-semibold text-white/90 mb-3 flex items-center gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + lineIndex * 0.1 }}
              >
                <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                {trimmedLine}
              </motion.h3>
            );
          }
          
          // Puce principale (•)
          if (trimmedLine.startsWith('•')) {
            return (
              <motion.div 
                key={lineIndex} 
                className="flex items-start gap-3 mb-2 ml-4"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + lineIndex * 0.05 }}
              >
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white/85 text-sm leading-relaxed">
                  {trimmedLine.substring(1).trim()}
                </p>
              </motion.div>
            );
          }
          
          // Tiret (-)
          if (trimmedLine.startsWith('-')) {
            return (
              <motion.div 
                key={lineIndex} 
                className="flex items-start gap-3 mb-1 ml-8"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + lineIndex * 0.03 }}
              >
                <div className="w-1 h-1 bg-white/40 rounded-full mt-2.5 flex-shrink-0"></div>
                <p className="text-white/75 text-sm leading-relaxed">
                  {trimmedLine.substring(1).trim()}
                </p>
              </motion.div>
            );
          }
          
          // Citation (ligne qui commence par des guillemets)
          if (trimmedLine.startsWith('"') || trimmedLine.startsWith('«')) {
            return (
              <motion.div 
                key={lineIndex} 
                className="my-4 p-3 bg-blue-500/10 border-l-2 border-blue-500/50 rounded-r-lg"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + lineIndex * 0.05 }}
              >
                <div className="flex items-start gap-2">
                  <Quote className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-white/85 text-sm leading-relaxed italic">
                    {trimmedLine}
                  </p>
                </div>
              </motion.div>
            );
          }
          
          // Paragraphe normal
          return (
            <motion.p 
              key={lineIndex} 
              className="text-white/80 text-sm leading-relaxed mb-2"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + lineIndex * 0.05 }}
            >
              {trimmedLine}
            </motion.p>
          );
        })}
      </motion.div>
    );
  };

  const { sections, sources } = parseResponse(response);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Contenu principal */}
      <div className="space-y-4">
        {sections.map((section, index) => formatSection(section, index))}
      </div>

      {/* Sources */}
      {sources.length > 0 && (
        <motion.div
          className="border-t border-white/10 pt-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-blue-400" />
            <h4 className="text-sm font-medium text-white/70">Sources consultées</h4>
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-xs text-white/50">{sources.length} source{sources.length > 1 ? 's' : ''}</span>
          </div>
          
          <div className="grid gap-2">
            {sources.map((source, index) => (
              <motion.div
                key={source.id}
                className="group flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.04] transition-all cursor-pointer"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => source.url && window.open(source.url, '_blank')}
              >
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/30 transition-colors">
                  <span className="text-xs font-medium text-blue-400">{source.id}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/85 truncate group-hover:text-white/95 transition-colors">
                    {source.title}
                  </p>
                  <p className="text-xs text-white/50 flex items-center gap-1">
                    <Link2 className="w-3 h-3" />
                    {source.domain}
                    {source.url && (
                      <span className="text-blue-400 ml-1">• Cliquez pour ouvrir</span>
                    )}
                  </p>
                </div>
                
                {source.url ? (
                  <ExternalLink className="w-4 h-4 text-blue-400 group-hover:text-blue-300 flex-shrink-0 transition-colors" />
                ) : (
                  <div className="w-4 h-4 bg-white/20 rounded-full flex-shrink-0" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Indicateur de fin */}
      <motion.div
        className="flex items-center justify-center gap-2 pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <CheckCircle className="w-4 h-4 text-green-400" />
        <span className="text-xs text-white/50">Réponse terminée</span>
      </motion.div>
    </div>
  );
} 