import { jest } from "@jest/globals";

import UserService from "../../src/services/user.service.js";
import ValidationService from "../../src/services/validation.service.js";
import UserModel from "../../src/models/user.model.js";
import { comparePassword } from "../../src/utils/encrypted.js";
import { createSession } from "../../src/utils/auth.js";
import { asegurarStringEnMinusculas } from "../../src/utils/utilis.js";
import FormatterResponseService from "../../src/utils/FormatterResponseService.js";

// ✅ Creamos mocks de todas las dependencias externas
jest.mock("../../src/services/validation.service.js");
jest.mock("../../src/models/user.model.js");
jest.mock("../../src/utils/encrypted.js");
jest.mock("../../src/utils/auth.js");
jest.mock("../../src/utils/utilis.js");
jest.mock("../../src/utils/FormatterResponseService.js");

describe("🧩 Pruebas del servicio UserService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("🔐 login()", () => {
    test("debe retornar error si la validación falla", async () => {
      ValidationService.validateLogin.mockReturnValue({
        isValid: false,
        errors: ["Email inválido"],
      });

      FormatterResponseService.validationError.mockReturnValue({
        error: true,
        message: "Error de validación",
      });

      const result = await UserService.login({ email: "", password: "" });

      expect(ValidationService.validateLogin).toHaveBeenCalled();
      expect(FormatterResponseService.validationError).toHaveBeenCalled();
      expect(result).toEqual({ error: true, message: "Error de validación" });
    });

    test("debe retornar error si el modelo devuelve un error", async () => {
      ValidationService.validateLogin.mockReturnValue({ isValid: true });
      asegurarStringEnMinusculas.mockReturnValue("usuario@correo.com");

      const fakeError = { error: true, message: "Usuario no encontrado" };
      UserModel.loginUser.mockResolvedValue(fakeError);
      FormatterResponseService.isError.mockReturnValue(true);

      const result = await UserService.login({
        email: "usuario@correo.com",
        password: "1234",
      });

      expect(UserModel.loginUser).toHaveBeenCalledWith("usuario@correo.com");
      expect(result).toEqual(fakeError);
    });

    test("debe retornar éxito si el login es correcto", async () => {
      ValidationService.validateLogin.mockReturnValue({ isValid: true });
      asegurarStringEnMinusculas.mockReturnValue("usuario@correo.com");

      const fakeUser = {
        id: 1,
        nombres: "José",
        apellidos: "Leite",
        password: "hashed123",
        roles: ["admin"],
        primera_vez: false,
      };

      UserModel.loginUser.mockResolvedValue({ data: fakeUser });
      FormatterResponseService.isError.mockReturnValue(false);
      comparePassword.mockResolvedValue(true);
      createSession.mockReturnValue("fake-jwt-token");

      FormatterResponseService.success.mockReturnValue({
        success: true,
        message: "Inicio de sesión exitoso",
        data: {
          token: "fake-jwt-token",
          user: {
            id: 1,
            nombres: "José",
            apellidos: "Leite",
            roles: ["admin"],
            primera_vez: false,
          },
        },
      });

      const result = await UserService.login({
        email: "usuario@correo.com",
        password: "1234",
      });

      expect(result.success).toBe(true);
      expect(result.data.token).toBe("fake-jwt-token");
      expect(UserModel.loginUser).toHaveBeenCalledWith("usuario@correo.com");
      expect(comparePassword).toHaveBeenCalledWith("1234", "hashed123");
    });

    test("debe lanzar error si la contraseña es inválida", async () => {
      ValidationService.validateLogin.mockReturnValue({ isValid: true });
      asegurarStringEnMinusculas.mockReturnValue("usuario@correo.com");

      const fakeUser = {
        id: 1,
        nombres: "José",
        apellidos: "Leite",
        password: "hashed123",
      };

      UserModel.loginUser.mockResolvedValue({ data: fakeUser });
      FormatterResponseService.isError.mockReturnValue(false);
      comparePassword.mockResolvedValue(false);

      const fakeUnauthorized = new Error("Correo o contraseña inválida");
      FormatterResponseService.unauthorized.mockReturnValue(fakeUnauthorized);

      await expect(
        UserService.login({ email: "usuario@correo.com", password: "mala" })
      ).rejects.toThrow("Correo o contraseña inválida");

      expect(comparePassword).toHaveBeenCalled();
    });
  });
});
