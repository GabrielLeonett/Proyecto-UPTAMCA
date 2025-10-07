// services/imageProcessing.service.js
import sharp from "sharp";
import { extname, join, parse } from "path";
import { existsSync, unlinkSync } from "fs";
import { access, stat } from "fs/promises";
import fs from "fs";

class ImageProcessingService {
  constructor(storage) {
    this.storageImage = "uploads/" + storage;
  }

  static async validateImage(filePath, originalName, options = {}) {
    try {
      const fullPath = join(filePath, originalName);

      try {
        await access(fullPath);
      } catch (accessError) {
        throw new Error(`El archivo no existe o no es accesible: ${fullPath}`);
      }

      if (!originalName || typeof originalName !== "string") {
        throw new Error("El nombre del archivo es requerido");
      }

      const fileExtension = extname(originalName).toLowerCase();
      const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

      if (!allowedExtensions.includes(fileExtension)) {
        throw new Error(
          `Formato de archivo no permitido. Formatos aceptados: ${allowedExtensions.join(
            ", "
          )}`
        );
      }

      try {
        const metadata = await sharp(fullPath).metadata();
        const maxWidth = options.maxWidth || 5000;
        const maxHeight = options.maxHeight || 5000;

        if (metadata.width > maxWidth || metadata.height > maxHeight) {
          throw new Error(
            `Las dimensiones de la imagen exceden el máximo permitido (${maxWidth}x${maxHeight})`
          );
        }

        if (!metadata.format) {
          throw new Error("El formato de imagen no es soportado");
        }
      } catch (sharpError) {
        if (
          sharpError.message.includes("unsupported image format") ||
          sharpError.message.includes(
            "Input file contains unsupported image format"
          )
        ) {
          throw new Error(
            "Formato de imagen no soportado. Use JPEG, JPG, PNG, WebP."
          );
        }
        throw sharpError;
      }

      const maxSize = options.maxSize || 10 * 1024 * 1024;
      const fileStats = await stat(fullPath);

      if (fileStats.size > maxSize) {
        throw new Error(
          `El archivo es demasiado grande. Tamaño máximo permitido: ${
            maxSize / 1024 / 1024
          }MB`
        );
      }

      if (options.width && (options.width < 1 || options.width > maxWidth)) {
        throw new Error(`El ancho debe estar entre 1 y ${maxWidth} píxeles`);
      }

      if (
        options.height &&
        (options.height < 1 || options.height > maxHeight)
      ) {
        throw new Error(`El alto debe estar entre 1 y ${maxHeight} píxeles`);
      }

      if (options.quality && (options.quality < 1 || options.quality > 100)) {
        throw new Error("La calidad debe estar entre 1 y 100");
      }

      if (options.format) {
        const allowedFormats = ["jpeg", "jpg", "png", "webp"];
        const formatLower = options.format.toLowerCase();

        if (!allowedFormats.includes(formatLower)) {
          throw new Error(
            `Formato de salida no permitido. Formatos aceptados: ${allowedFormats.join(
              ", "
            )}`
          );
        }
      }

      return {
        isValid: true,
        fileExtension,
        message: "Archivo válido para procesamiento",
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message,
      };
    }
  }

  async processAndSaveImage(originalName, options = {}) {
    let tempImagePath = null;

    try {
      // 1. Validar la imagen primero
      const validation = await ImageProcessingService.validateImage(
        this.storageImage,
        originalName,
        options
      );

      if (!validation.isValid) {
        throw new Error(validation.error || "Error de validación desconocido");
      }

      const fullInputPath = join(this.storageImage, originalName);
      tempImagePath = fullInputPath; // Guardar referencia para limpieza

      // 2. Generar nombre único PARA LA IMAGEN PROCESADA
      let outputFormat = options.format ? options.format.toLowerCase() : "jpeg";
      if (outputFormat === "jpg") outputFormat = "jpeg";

      const fileExtension =
        outputFormat === "jpeg" ? ".jpg" : `.${outputFormat}`;
      const uniqueName = this.generateUniqueName(originalName);
      const fileName = uniqueName + fileExtension;
      const outputPath = join(this.storageImage, fileName);

      // 3. Configurar opciones de procesamiento
      const {
        width = 800,
        height = 600,
        quality = 80,
        fit = "inside",
        withoutEnlargement = true,
      } = options;

      let image = sharp(fullInputPath);

      // 4. Procesar la imagen
      image = image.resize(width, height, {
        fit,
        withoutEnlargement,
      });

      switch (outputFormat) {
        case "jpeg":
          image = image.jpeg({ quality, mozjpeg: true });
          break;
        case "png":
          image = image.png({ compressionLevel: Math.floor(quality / 10) });
          break;
        case "webp":
          image = image.webp({ quality, lossless: quality === 100 });
          break;
        default:
          image = image.jpeg({ quality });
          outputFormat = "jpeg";
      }

      await image.toFile(outputPath);

      // 5. ELIMINAR LA IMAGEN ORIGINAL (la temporal)
      await this.deleteImage(originalName);
      tempImagePath = null; // Ya no necesitamos limpiar

      return {
        success: true,
        fileName: fileName, // ← Este es el nombre ÚNICO de la imagen procesada
        originalName: originalName, // ← Guardar el nombre original por si acaso
        outputPath: outputPath,
        format: outputFormat === "jpeg" ? "jpg" : outputFormat,
        dimensions: { width, height },
      };
    } catch (error) {
      // 6. Limpiar en caso de error
      if (tempImagePath) {
        try {
          await fs.promises.unlink(tempImagePath);
        } catch (deleteError) {
          console.error("Error limpiando imagen temporal:", deleteError);
        }
      }

      // 7. Manejar errores específicos de formato
      if (
        error.message.includes("unsupported image format") ||
        error.message.includes("Input file contains unsupported image format")
      ) {
        return await this.convertToSupportedFormat(
          tempImagePath,
          originalName,
          options
        );
      }

      throw new Error(`Error procesando imagen: ${error.message}`);
    }
  }

  async convertToSupportedFormat(inputPath, originalName, options = {}) {
    const uniqueName = this.generateUniqueName(originalName);
    const fileName = `${uniqueName}.jpg`;
    const outputPath = join(this.storageImage, fileName);

    const {
      width = 800,
      height = 600,
      quality = 80,
      fit = "inside",
      withoutEnlargement = true,
    } = options;

    try {
      await sharp(inputPath)
        .resize(width, height, { fit, withoutEnlargement })
        .jpeg({ quality, mozjpeg: true })
        .toFile(outputPath);

      return {
        success: true,
        fileName: fileName,
        outputPath: outputPath,
        format: "jpg",
        dimensions: { width, height },
        converted: true,
        message: "Imagen convertida a JPG por formato no soportado",
      };
    } catch (error) {
      throw new Error(`Error convirtiendo imagen: ${error.message}`);
    }
  }

  generateUniqueName(originalName) {
    const nameWithoutExt = parse(originalName).name;
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, "-");
    return `${cleanName}-${timestamp}-${random}`;
  }

  async deleteImage(fileName) {
    try {
      const filePath = join(this.storageImage, fileName);
      if (existsSync(filePath)) {
        unlinkSync(filePath);
        return { success: true, message: "Imagen eliminada correctamente" };
      }
      throw { success: false, message: "La imagen no existe" };
    } catch (error) {
      throw `Error eliminando imagen: ${error.message}`;
    }
  }

  // Método para obtener/leer una imagen
  async getImage(fileName, options = {}) {
    try {
      if (!fileName || typeof fileName !== "string") {
        throw new Error("El nombre del archivo es requerido");
      }

      const filePath = join(this.storageImage, fileName);

      // Verificar que el archivo existe
      try {
        await access(filePath);
      } catch (accessError) {
        throw new Error(`La imagen no existe: ${fileName}`);
      }

      // Obtener estadísticas del archivo
      const fileStats = await stat(filePath);

      // Leer el archivo como buffer
      const imageBuffer = await fs.promises.readFile(filePath);

      // Obtener metadata de la imagen
      const metadata = await sharp(imageBuffer).metadata();

      // Si se solicitan opciones de procesamiento, procesar la imagen
      if (Object.keys(options).length > 0) {
        const {
          width,
          height,
          quality = 80,
          format,
          fit = "inside",
          withoutEnlargement = true,
        } = options;

        let processedImage = sharp(imageBuffer);

        // Aplicar resize si se especifica
        if (width || height) {
          processedImage = processedImage.resize(width, height, {
            fit,
            withoutEnlargement,
          });
        }

        // Aplicar formato si se especifica
        let outputFormat = format ? format.toLowerCase() : metadata.format;
        if (outputFormat === "jpg") outputFormat = "jpeg";

        switch (outputFormat) {
          case "jpeg":
            processedImage = processedImage.jpeg({ quality, mozjpeg: true });
            break;
          case "png":
            processedImage = processedImage.png({
              compressionLevel: Math.floor(quality / 10),
            });
            break;
          case "webp":
            processedImage = processedImage.webp({
              quality,
              lossless: quality === 100,
            });
            break;
          default:
            // Mantener formato original si no se especifica o no es soportado
            outputFormat = metadata.format;
        }

        const processedBuffer = await processedImage.toBuffer();
        const processedMetadata = await sharp(processedBuffer).metadata();

        return {
          success: true,
          buffer: processedBuffer,
          metadata: processedMetadata,
          fileName: fileName,
          fileSize: processedBuffer.length,
          format: outputFormat === "jpeg" ? "jpg" : outputFormat,
          dimensions: {
            width: processedMetadata.width,
            height: processedMetadata.height,
          },
          processed: true,
        };
      }

      // Retornar imagen original sin procesar
      return {
        success: true,
        buffer: imageBuffer,
        metadata: metadata,
        fileName: fileName,
        fileSize: fileStats.size,
        format: metadata.format,
        dimensions: {
          width: metadata.width,
          height: metadata.height,
        },
        processed: false,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        fileName: fileName,
      };
    }
  }
}

export default ImageProcessingService;
