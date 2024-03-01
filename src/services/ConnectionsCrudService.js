export default class ConnectionCrudService {

    constructor(entity) {
        this.entity = entity
        this.url = `http://159.54.140.202:3002/api/${this.entity}`;
    }

}
