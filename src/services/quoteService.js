/**
 * Servicio para obtener frases motivacionales de la API Quotable
 */
class QuoteService {
  constructor() {
    this.baseURL = 'https://api.quotable.io';
  }

  /**
   * Obtiene una frase aleatoria
   */
  async getRandomQuote() {
    try {
      const response = await fetch(`${this.baseURL}/random`);
      
      if (!response.ok) {
        throw new Error('Error al obtener la frase');
      }

      const quote = await response.json();
      return {
        text: quote.content,
        author: quote.author,
        tags: quote.tags || [],
      };
    } catch (error) {
      console.error('Error al obtener frase:', error);
      // Frase de respaldo en caso de error
      return {
        text: "El éxito no es final, el fracaso no es fatal: es el coraje para continuar lo que cuenta.",
        author: "Winston Churchill",
        tags: ["motivación", "éxito"],
      };
    }
  }

  /**
   * Obtiene una frase por categoría específica
   */
  async getQuoteByCategory(category) {
    try {
      const response = await fetch(`${this.baseURL}/random?tags=${category}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener la frase por categoría');
      }

      const quote = await response.json();
      return {
        text: quote.content,
        author: quote.author,
        tags: quote.tags || [],
      };
    } catch (error) {
      console.error('Error al obtener frase por categoría:', error);
      return this.getRandomQuote();
    }
  }

  /**
   * Obtiene múltiples frases
   */
  async getMultipleQuotes(limit = 5) {
    try {
      const response = await fetch(`${this.baseURL}/quotes?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener las frases');
      }

      const quotes = await response.json();
      return quotes.map(quote => ({
        text: quote.content,
        author: quote.author,
        tags: quote.tags || [],
      }));
    } catch (error) {
      console.error('Error al obtener múltiples frases:', error);
      return [];
    }
  }

  /**
   * Obtiene categorías disponibles
   */
  async getCategories() {
    try {
      const response = await fetch(`${this.baseURL}/tags`);
      
      if (!response.ok) {
        throw new Error('Error al obtener las categorías');
      }

      const categories = await response.json();
      return categories.map(cat => ({
        name: cat.name,
        count: cat.quoteCount,
      }));
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      return [
        { name: 'motivación', count: 100 },
        { name: 'éxito', count: 80 },
        { name: 'trabajo', count: 60 },
        { name: 'productividad', count: 40 },
      ];
    }
  }
}

// Exportamos una instancia única del servicio
export const quoteService = new QuoteService();
export default quoteService;
