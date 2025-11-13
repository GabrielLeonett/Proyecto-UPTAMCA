// src/i18n/index.js
import i18next from "i18next";
import i18nextMiddleware from "i18next-http-middleware";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const loadNamespace = (lng, ns) => {
  try {
    const filePath = join(__dirname, lng, `${ns}.json`);
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    console.warn(`No se pudo cargar ${lng}/${ns}.json:`, error.message);
    return {};
  }
};

const resources = {
  es: {
    // Asegúrate que estos nombres coincidan con lo que usas en req.t()
    aulas: loadNamespace("es", "aulas"),
    admins: loadNamespace("es", "admins"),
    formatter: loadNamespace("es", "formatter"),
  },
  en: {
    aulas: loadNamespace("en", "aulas"),
    admins: loadNamespace("en", "admins"),
    formatter: loadNamespace("en", "formatter"),
  },
  pt: {
    aulas: loadNamespace("pt", "aulas"),
    admins: loadNamespace("pt", "admins"),
    formatter: loadNamespace("pt", "formatter"),
  },
};

i18next.use(i18nextMiddleware.LanguageDetector).init({
  resources,
  fallbackLng: "es", // Cambié a 'es' para coincidir con tu default
  supportedLngs: ["es", "en", "pt"],

  detection: {
    order: ["querystring", "header", "cookie"],
    caches: ["cookie"],
    // Estos deben coincidir con tu middleware
    lookupHeader: "x-app-language",
    lookupCookie: "language",
    lookupQuerystring: "lang",
  },

  // Asegúrate que estos namespaces existen en tus archivos
  ns: ["admins", "formatter", "aulas"],
  defaultNS: "formatter", // O el namespace que uses más

  debug: process.env.NODE_ENV === "development",

  // Configuración adicional importante
  interpolation: {
    escapeValue: false,
  },
});

// Middleware wrapper para i18next
export const i18nMiddleware = i18nextMiddleware.handle(i18next);
export default i18next;
