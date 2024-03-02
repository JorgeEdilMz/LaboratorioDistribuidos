import { defineStore } from 'pinia';
import UserService from '../services/UserService';
import LoginService from '../services/LoginService'
import ConnectionService from '../services/ConnectionService'
import router from '../router'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        showLogin: true,
        showUserRegister: false,
        onlineUser: { nick: null, rol: null, foto: null, token: null, personId: null },
        password: null,
    }),

    actions: {
        async updateOnlinePerson(nickname, token) {
            const person = await ConnectionService.fetchByUserNickname(nickname, token)
            this.onlineUser = {
                nick: person.nick_usuario,
                rol: person.roles.nombre_rol,
                foto: person.usuarios.foto_usuario,
                token: token,
                personId: person.usuarios.documento_usuario
            }
        },

        toggleForm() {
            this.showLogin = !this.showLogin;
            router.push({ name: 'information' });
        },

        async login() {
            try {

                const response = await LoginService.login({ nombre_usuario: this.onlineUser.nick, password_usuario: this.password });
                if (response) {
                    await this.updateOnlinePerson(this.onlineUser.nick, response.token)
                    router.push({ name: 'information' });
                }
            } catch (error) {
                console.error("Error", error);
            }
        },

        async existsNickname(userNickname) {
            const user = await ConnectionService.fetchValidationNickname(userNickname)
            return user.exists
        },

        async registerUser(newUser) {
            const response = await UserService.postRegisterUser(newUser)
        },
        async registerConnection(connection) {
            const response = await ConnectionService.postRegisterConnection(connection)

        },
        async registerConnectionAdmin(connection) {
            const response = await ConnectionService.postRegisterConnectionAdmin(connection, this.onlineUser.token)
        },
        logout() {
            this.onlineUser = { nick: null, rol: null, foto: null, token: null, personId: null }
            this.password = null
            this.showLogin = true
            this.showUserRegister = false
        },
        isUserAdmin() {
            console.log(this.onlineUser)
            if (!this.onlineUser.rol) {
                return false
            }
            return this.onlineUser.rol === 'admin'
        },
        isSuperAdmin() {
            console.log(this.onlineUser)
            if (!this.onlineUser.rol) {
                return false
            }
            return this.onlineUser.rol === 'superUser'
        }
    },
    persist: {
        storage: sessionStorage,
        paths: ['onlineUser']
    }

});