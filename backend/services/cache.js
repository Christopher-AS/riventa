// Sistema de cache simples para melhorar performance
class CacheService {
  constructor() {
    this.cache = new Map();
    this.maxSize = 1000;
    this.ttl = 300000; // 5 minutos
  }

  // Salvar dados no cache
  set(key, value) {
    // Remove itens antigos se cache estiver cheio
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    const item = {
      value: value,
      timestamp: Date.now()
    };
    
    this.cache.set(key, item);
  }

  // Buscar dados do cache
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Verificar se expirou
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  // Limpar cache
  clear() {
    this.cache.clear();
  }
}

export const cacheService = new CacheService();