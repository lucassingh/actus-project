type LogoutCallback = () => void;

let logoutCallback: LogoutCallback | null = null;

export const authEvents = {
    /**
     * Suscribirse al evento de logout
     * @param callback Función a ejecutar cuando ocurra un logout forzado
     */
    onLogout: (callback: LogoutCallback) => {
        logoutCallback = callback;
    },

    /**
     * Emitir evento de logout
     * Debe llamarse cuando el token expira o es inválido (401)
     */
    emitLogout: () => {
        if (logoutCallback) {
            console.log('🔒 Logout forzado disparado por evento');
            logoutCallback();
        } else {
            console.warn('⚠️ Se intentó emitir logout pero no hay listener registrado');
        }
    }
};
