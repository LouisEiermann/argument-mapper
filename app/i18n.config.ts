export default defineI18nConfig(() => ({
  legacy: false,
  locale: "de",
  messages: {
    en: {
      welcome: "Welcome to Appname",
      account: {
        register: "Register",
        login: "Login",
        logout: "Logout",
        email: "E-Mail Address",
        password: "Password",
        passwordConfirm: "Confirm Password",
        username: "Username",
        passwordForgotten: "Password forgotten",
        or: "Or",
        settings: "Settings",
      },
    },
    de: {
      welcome: "Willkommen bei Appname",
      account: {
        register: "Registrieren",
        login: "Einloggen",
        logout: "Ausloggen",
        email: "E-Mail Adresse",
        password: "Passwort",
        passwordConfirm: "Passwort bestätigen",
        username: "Benutzername",
        passwordForgotten: "Passwort vergessen",
        or: "Oder",
        settings: "Einstellungen",
      },
      notification: {
        loginFailed: "Login fehlgeschlagen. Bitte überprüfe deinen Benutzernamen und dein Passwort.",
        saved: "Gespeichert.",
        argumentDeleted: "Argument gelöscht."
      }
    },
  },
}));
