import { defineStore } from 'pinia';
import { format, utcToZonedTime } from 'date-fns-tz'
import { subYears, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import DocTypeService from '../services/DocTypeService';
import RoleService from '../services/RoleService'

export const useUtilityStore = defineStore('utility', {
    state: () => ({
        userAdminRol: "Administrador",
        superAdminRol: "SuperAdministrador",
        docTypes: null,
        localeFormat: "dd MMMM, yyyy",
        dateRegion: { timeZone: 'America/Bogota', locale: es },
        defaultFormat: "yyyy-MM-dd",
        status: ['A', 'I'],
        maxAge: 90, // Edad maxima que puede tener el usuario 
        minAge: 14, // || minima ||
    }),
    actions: {
        formatDate(dateTime) {
            if (dateTime != null) {
                const date = utcToZonedTime(dateTime, 'America/Bogota');
                const actualDate = addDays(date, 1)
                return format(actualDate, this.localeFormat, this.dateRegion)
            }
            return "";
        },
        formatToDefaultDate(dateTime) {
            if (dateTime != null) {
                const date = new Date(dateTime);
                return format(date, this.defaultFormat, this.dateRegion);
            }
            return "";
        },
        formatISO(date) {
            if (date != "") {
                return new Date(date).toISOString()
            }
            return ""
        },
        formatCellphoneNumber(number) {
            return "+57 " + number.slice(0, 3) + " " + number.slice(3, 6) + " " + number.slice(6);
        },
        calculateDate(years) {//Calcula la fecha minima y maxima según la edad
            let actualDate = new Date();
            let date = subYears(actualDate, years);
            return format(date, this.defaultFormat);
        },
        validateTextField(input) {
            const regex = /^(?!\s)[a-zA-ZáéíóúÁÉÍÓÚñÑ]*(?:\s[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)*(?<!\s)$/
            return regex.test(input);
        },

        validateNumberField(input) {
            return /^\d{0}$|^\d{10}$/.test(input) && !isNaN(input)
        },
        validateCCField(input) {
            return /^\d{8}$|^\d{10}$/.test(input) && !isNaN(input)
        },
        validateOTDocument(input) {
            const regex = /^(?!\s)[\w\s]{10}(?<!\s)$/
            return regex.test(input);
        },
        validateStatus(input) {
            if (input === "") {
                return true;
            }
            return this.status.includes(input);
        },
        validateRolId(input) {
            const regex = /^\S{1,5}$/
            return regex.test(input) && !isNaN(input)
        },
        validateNickName(input) {
            const regex = /^[a-zA-Z0-9_]{1,10}$/
            return regex.test(input)

        },
        async fetchDocTypes() {
            const docs = await DocTypeService.fetchAllDocs();
            this.docTypes = docs;
        },
        async fetchRoles() {
            const roles = await RoleService.fetchAll()

        },

    }
});