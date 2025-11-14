// src/middleware/language.js
const supportedLanguages = ["es", "en"];
const defaultLanguage = "en";

const languageMiddleware = (req, res, next) => {
  let detectedLanguage = defaultLanguage;

  // 1. Query parameter (máxima prioridad para testing)
  if (req.query.lang && supportedLanguages.includes(req.query.lang)) {
    detectedLanguage = req.query.lang;
  }
  // 2. Header personalizado de la aplicación
  else if (
    req.headers["x-app-language"] &&
    supportedLanguages.includes(req.headers["x-app-language"])
  ) {
    detectedLanguage = req.headers["x-app-language"];
  }
  // 3. Cookie de idioma
  else if (
    req.cookies?.language &&
    supportedLanguages.includes(req.cookies.language)
  ) {
    detectedLanguage = req.cookies.language;
  }
  // 4. Accept-Language header del navegador
  else if (req.headers["accept-language"]) {
    const langs = req.headers["accept-language"]
      .split(",")
      .map((lang) => {
        const [code, quality = "q=1"] = lang.split(";");
        return {
          code: code.trim().split("-")[0],
          quality: parseFloat(quality.replace("q=", "")) || 1,
        };
      })
      .filter((lang) => supportedLanguages.includes(lang.code))
      .sort((a, b) => b.quality - a.quality);

    if (langs.length > 0) {
      detectedLanguage = langs[0].code;
    }
  }

  // Establecer el idioma en el request
  req.language = detectedLanguage;

  if (req.i18n) {
    req.i18n.changeLanguage(detectedLanguage);
  }

  // Header de respuesta
  res.setHeader("Content-Language", detectedLanguage);

  // Log para desarrollo
  if (process.env.NODE_ENV === "development") {
    console.log(`🌐 Idioma detectado: ${detectedLanguage}`);
  }

  next();
};

export default languageMiddleware;
