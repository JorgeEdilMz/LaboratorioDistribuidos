import { defineStore } from 'pinia';
import UserService from '../services/UserService';
import LoginService from '../services/LoginService'
import ConnectionService from '../services/ConnectionService'
import router from '../router'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        showLogin: true,
        onlineUser: { nick: null, rol: null, foto: null, token: null },
        password: null,
    }),

    actions: {
        async updateOnlinePerson(nickname, token) {
            const person = await ConnectionService.fetchByUserNickname(nickname, token)
            this.onlineUser = {
                nick: person.nick_usuario,
                rol: person.roles.nombre_rol,
                foto: person.usuarios.foto_usuario,
                token: token
            }
        },

        toggleForm() {
            this.showLogin = !this.showLogin;
        },

        async login() {
            try {
                const response = await LoginService.login({ nombre_usuario: this.onlineUser.nick, password_usuario: this.password });
                if (response.status) {
                    await this.updateOnlinePerson(this.onlineUser.nick, response.token)
                    router.push({ name: 'information' });
                }
            } catch (error) {
                alert('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
            }
        },

        async existsNickname(userNickname) {
            const user = await ConnectionService.fetchValidationNickname(userNickname)
            return user.exists
        },

        async registerUser(newUser) {
            console.log("nuevo ", newUser);
            const response = await UserService.postRegisterUser(newUser)
            console.log("registrado ", response)
        },
        async registerConnection(connection) {
            console.log("nuevo conn", connection);
            const response = await ConnectionService.postRegisterConnection(connection, this.onlineUser.token)
            console.log("registrado conn ", response)

        },
        logout() {
            this.onlineUser = { nick: null, rol: null, foto: null, token: null }
            this.password = null
        },
        async reloadOnlinePerson() {
            await this.updateOnlinePerson(this.onlineUser.nick, this.onlineUser.token)
        }
    },
    persist: {
        storage: sessionStorage,
        paths: ['onlineUser']
    }

});