/* ============================================
   100 Abogados Dijeron - Funciones Compartidas
   ============================================ */

const DEFAULT_SURVEYS = [
    { id: 'der-ramas-estudiadas', question: '¿Cuáles son las ramas del Derecho más estudiadas?', category: 'Derecho', responses: [
        { text: 'Civil', points: 35 }, { text: 'Penal', points: 28 }, { text: 'Constitucional', points: 20 }, { text: 'Mercantil', points: 12 }, { text: 'Laboral', points: 5 }
    ]},
    { id: 'der-documentos-identificacion', question: '¿Cuáles son los documentos de identificación más comunes?', category: 'Derecho', responses: [
        { text: 'Credencial para votar (INE)', points: 40 }, { text: 'Pasaporte', points: 25 }, { text: 'Cédula Profesional', points: 15 }, { text: 'Licencia de conducir', points: 12 }, { text: 'CURP', points: 8 }
    ]},
    { id: 'der-fuentes-formales', question: 'Menciona cuáles son las 5 fuentes formales del Derecho', category: 'Derecho', responses: [
        { text: 'La ley', points: 35 }, { text: 'La costumbre', points: 25 }, { text: 'La jurisprudencia', points: 18 }, { text: 'Los principios generales del Derecho', points: 14 }, { text: 'La doctrina', points: 8 }
    ]},
    { id: 'der-adquirir-propiedad', question: '¿Cuáles son las formas de adquirir la propiedad?', category: 'Derecho', responses: [
        { text: 'Compraventa', points: 35 }, { text: 'Donación', points: 25 }, { text: 'Permuta', points: 17 }, { text: 'Herencia', points: 15 }, { text: 'Usucapión', points: 8 }
    ]},
    { id: 'der-delitos-comunes-mexico', question: '¿Qué delitos son los más comunes en México?', category: 'Derecho', responses: [
        { text: 'Robo', points: 38 }, { text: 'Homicidio', points: 24 }, { text: 'Despojo', points: 16 }, { text: 'Extorsión', points: 14 }, { text: 'Portación de arma de fuego', points: 8 }
    ]},
    { id: 'der-funcion-derecho', question: '¿Cuál es una función del Derecho?', category: 'Derecho', responses: [
        { text: 'Mantener el orden social', points: 35 }, { text: 'Proteger los derechos de las personas', points: 28 }, { text: 'Resolver conflictos', points: 22 }, { text: 'Garantizar la justicia', points: 15 }, { text: 'Regular la convivencia', points: 10 }
    ]},
    { id: 'der-menciona-rama', question: 'Menciona alguna rama del Derecho', category: 'Derecho', responses: [
        { text: 'Derecho Civil', points: 30 }, { text: 'Derecho Penal', points: 28 }, { text: 'Derecho Laboral', points: 18 }, { text: 'Derecho Constitucional', points: 14 }, { text: 'Derecho Mercantil', points: 10 }
    ]},
    { id: 'der-contratar-abogado', question: 'Menciona una razón común por la que la gente contrata a un abogado', category: 'Derecho', responses: [
        { text: 'Problemas de terrenos o propiedades', points: 32 }, { text: 'Para salir de la cárcel / detención', points: 28 }, { text: 'Herencias / testamentos', points: 22 }, { text: 'Divorcio / separación', points: 18 }, { text: 'Demandas o conflictos legales', points: 10 }
    ]},
    { id: 'der-libro-estudiante', question: '¿Cuál es el libro o código que un estudiante de Derecho compra primero?', category: 'Derecho', responses: [
        { text: 'Constitución', points: 36 }, { text: 'Código Civil', points: 25 }, { text: 'Código Penal', points: 18 }, { text: 'Ley Federal del Trabajo', points: 12 }, { text: 'Código de Comercio', points: 9 }
    ]},
    { id: 'der-termino-ciudadano', question: '¿Cuál es el recurso legal o término que todo ciudadano conoce, aunque no sepa bien cómo funciona?', category: 'Derecho', responses: [
        { text: 'El Amparo', points: 34 }, { text: 'La Demanda', points: 26 }, { text: 'La Denuncia / Querella', points: 20 }, { text: 'Los Derechos Humanos', points: 12 }, { text: 'La Orden de aprehensión', points: 8 }
    ]},
    { id: 'cg-civilizacion-antigua', question: 'Menciona una civilización antigua.', category: 'Cultura general', responses: [
        { text: 'Egipcia', points: 30 }, { text: 'Romana', points: 25 }, { text: 'Griega', points: 20 }, { text: 'Maya', points: 15 }, { text: 'Azteca', points: 10 }
    ]},
    { id: 'cg-cientifico-famoso', question: 'Menciona un científico famoso.', category: 'Cultura general', responses: [
        { text: 'Albert Einstein', points: 35 }, { text: 'Isaac Newton', points: 25 }, { text: 'Galileo Galilei', points: 18 }, { text: 'Marie Curie', points: 14 }, { text: 'Nikola Tesla', points: 8 }
    ]},
    { id: 'cg-maravilla-mundo', question: 'Menciona una maravilla del mundo antiguo o moderno.', category: 'Cultura general', responses: [
        { text: 'Gran Muralla China', points: 30 }, { text: 'Machu Picchu', points: 25 }, { text: 'Chichén Itzá', points: 20 }, { text: 'Coliseo Romano', points: 15 }, { text: 'Taj Mahal', points: 10 }
    ]},
    { id: 'cg-mundial-futbol', question: 'Menciona un país que haya ganado una Copa Mundial de fútbol.', category: 'Cultura general', responses: [
        { text: 'Brasil', points: 35 }, { text: 'Argentina', points: 25 }, { text: 'Alemania', points: 18 }, { text: 'Italia', points: 14 }, { text: 'Francia', points: 8 }
    ]},
    { id: 'cg-invento-historia', question: 'Menciona un invento que cambió la historia.', category: 'Cultura general', responses: [
        { text: 'La rueda', points: 32 }, { text: 'La imprenta', points: 25 }, { text: 'El teléfono', points: 18 }, { text: 'La computadora', points: 15 }, { text: 'El avión', points: 10 }
    ]},
    { id: 'cg-fauna-mexicana', question: 'Nombra un animal nativo de la fauna mexicana.', category: 'Cultura general', responses: [
        { text: 'Ajolote', points: 32 }, { text: 'Jaguar', points: 25 }, { text: 'Xoloitzcuintle', points: 18 }, { text: 'Lobo mexicano', points: 15 }, { text: 'Vaquita marina', points: 10 }
    ]},
    { id: 'cg-independencia-mexico', question: 'Nombra a un personaje histórico clave de la Independencia de México que no sea Miguel Hidalgo.', category: 'Cultura general', responses: [
        { text: 'José María Morelos y Pavón', points: 30 }, { text: 'Vicente Guerrero', points: 24 }, { text: 'Ignacio Allende', points: 20 }, { text: 'Josefa Ortiz de Domínguez', points: 16 }, { text: 'Agustín de Iturbide', points: 10 }
    ]},
    { id: 'cg-civilizacion-mesoamericana', question: 'Menciona una de las civilizaciones antiguas más importantes de Mesoamérica.', category: 'Cultura general', responses: [
        { text: 'Maya', points: 32 }, { text: 'Azteca / Mexica', points: 28 }, { text: 'Olmeca', points: 18 }, { text: 'Zapoteca', points: 12 }, { text: 'Tolteca / Teotihuacana', points: 10 }
    ]},
    { id: 'cg-dios-griego', question: 'Menciona un dios de la mitología griega que no sea Zeus.', category: 'Cultura general', responses: [
        { text: 'Poseidón', points: 30 }, { text: 'Hades', points: 24 }, { text: 'Atenea', points: 20 }, { text: 'Afrodita', points: 16 }, { text: 'Ares', points: 10 }
    ]},
    { id: 'cg-lenguas-indigenas', question: 'Menciona una de las lenguas indígenas más habladas en el territorio mexicano actual.', category: 'Cultura general', responses: [
        { text: 'Náhuatl', points: 34 }, { text: 'Maya', points: 25 }, { text: 'Zapoteco', points: 17 }, { text: 'Mixteco', points: 14 }, { text: 'Otomí', points: 10 }
    ]},
    { id: 'cg-planetas', question: 'Menciona algún planeta del Sistema Solar.', category: 'Cultura general', responses: [
        { text: 'Mercurio', points: 22 }, { text: 'Venus', points: 20 }, { text: 'Tierra', points: 24 }, { text: 'Marte', points: 22 }, { text: 'Júpiter', points: 12 }
    ]},
    { id: 'cg-oceanos', question: 'Menciona algún océano de la Tierra.', category: 'Cultura general', responses: [
        { text: 'Pacífico', points: 34 }, { text: 'Atlántico', points: 28 }, { text: 'Índico', points: 18 }, { text: 'Ártico', points: 12 }, { text: 'Antártico', points: 8 }
    ]},
    { id: 'cg-paises-america', question: 'Menciona algún país del continente americano.', category: 'Cultura general', responses: [
        { text: 'México', points: 32 }, { text: 'Canadá', points: 24 }, { text: 'Brasil', points: 20 }, { text: 'Argentina', points: 14 }, { text: 'Chile', points: 10 }
    ]},
    { id: 'cg-mamiferos', question: 'Menciona algún animal mamífero.', category: 'Cultura general', responses: [
        { text: 'Perro', points: 30 }, { text: 'Gato', points: 25 }, { text: 'Delfín', points: 18 }, { text: 'Ballena', points: 15 }, { text: 'Canguro', points: 12 }
    ]},
    { id: 'cg-obras-arte', question: 'Menciona alguna obra de arte famosa.', category: 'Cultura general', responses: [
        { text: 'La Mona Lisa', points: 34 }, { text: 'La noche estrellada', points: 24 }, { text: 'Las Meninas', points: 18 }, { text: 'El Grito', points: 14 }, { text: 'La persistencia de la memoria', points: 10 }
    ]}
];

const Shared = {
    STORAGE_KEYS: {
        SURVEYS: '100abogados_surveys',
        GAMES: '100abogados_games',
        ROUNDS: '100abogados_rounds',
        SETTINGS: '100abogados_settings'
    },

    ensureDefaultSurveys() {
        // Solo precarga las encuestas cuando no existe una base guardada.
        // Así las preguntas precargadas sí se pueden editar, duplicar o eliminar
        // sin que vuelvan a aparecer automáticamente al abrir el juego.
        const data = localStorage.getItem(this.STORAGE_KEYS.SURVEYS);
        if (data) {
            try { return JSON.parse(data); } catch (_) { return []; }
        }

        const seeded = DEFAULT_SURVEYS.map(s => ({ ...s, createdAt: new Date().toISOString() }));
        this.saveSurveys(seeded);
        return seeded;
    },

    normalize(text) {
        return String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    },

    getCategories(minResponses = 0) {
        let surveys = this.getSurveys();
        if (minResponses > 0) {
            surveys = surveys.filter(s => s.responses && s.responses.length >= minResponses);
        }
        const seen = new Set();
        return surveys
            .map(s => String(s.category || 'General').trim() || 'General')
            .filter(category => {
                const key = this.normalize(category);
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            })
            .sort((a, b) => a.localeCompare(b, 'es'));
    },

    getSurveys(autoSeed = true) {
        const data = localStorage.getItem(this.STORAGE_KEYS.SURVEYS);
        if (data) {
            try { return JSON.parse(data); } catch (_) { return []; }
        }
        if (!autoSeed) return [];
        const seeded = DEFAULT_SURVEYS.map(s => ({ ...s, createdAt: new Date().toISOString() }));
        this.saveSurveys(seeded);
        return seeded;
    },

    saveSurveys(surveys) { localStorage.setItem(this.STORAGE_KEYS.SURVEYS, JSON.stringify(surveys)); },
    getGames() { const data = localStorage.getItem(this.STORAGE_KEYS.GAMES); return data ? JSON.parse(data) : []; },
    saveGames(games) { localStorage.setItem(this.STORAGE_KEYS.GAMES, JSON.stringify(games)); },
    getRounds() { const data = localStorage.getItem(this.STORAGE_KEYS.ROUNDS); return data ? JSON.parse(data) : []; },
    saveRounds(rounds) { localStorage.setItem(this.STORAGE_KEYS.ROUNDS, JSON.stringify(rounds)); },
    getSettings() { const data = localStorage.getItem(this.STORAGE_KEYS.SETTINGS); return data ? JSON.parse(data) : { theme: 'dark', soundEnabled: true }; },
    saveSettings(settings) { localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); },

    addGame(game) { const games = this.getGames(); games.push(game); this.saveGames(games); },
    addRound(round) { const rounds = this.getRounds(); rounds.push(round); this.saveRounds(rounds); },

    getRandomSurvey(excludeIds = []) {
        const exclude = Array.isArray(excludeIds) ? excludeIds : [excludeIds].filter(Boolean);
        const surveys = this.getSurveys().filter(s => s.responses && s.responses.length >= 5);
        const available = surveys.filter(s => !exclude.includes(s.id));
        if (available.length === 0) return null;
        return available[Math.floor(Math.random() * available.length)];
    },


    getRandomSurveyByCategory(category, excludeIds = []) {
        const exclude = Array.isArray(excludeIds) ? excludeIds : [excludeIds].filter(Boolean);
        const wanted = this.normalize(category);
        const surveys = this.getSurveys().filter(s =>
            s.responses &&
            s.responses.length >= 5 &&
            this.normalize(s.category) === wanted &&
            !exclude.includes(s.id)
        );
        if (surveys.length === 0) return null;
        return surveys[Math.floor(Math.random() * surveys.length)];
    },

    exportToFile(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },

    importFromFile(input) {
        return new Promise((resolve, reject) => {
            const file = input.files[0];
            if (!file) return reject(new Error('No file selected'));
            const reader = new FileReader();
            reader.onload = (e) => {
                try { resolve(JSON.parse(e.target.result)); }
                catch (_) { reject(new Error('Invalid JSON file')); }
            };
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsText(file);
        });
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    },

    generateId() { return Date.now() + Math.random(); }
};
