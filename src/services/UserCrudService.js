export default class UserCrudService {

    constructor(entity) {
        this.entity = entity
        this.url = `http://159.54.140.202:3000/api/${this.entity}`;
    }

}
