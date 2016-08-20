export class Serializable {
    fillFromJSON(json: string) {
        var jsonObj = JSON.parse(json);
        for (var propName in jsonObj) {

            this[propName] = jsonObj[propName];
            console.log('['+propName+']:' + JSON.stringify(this[propName]));

            console.log(this[propName].constructor.name);
            //TODO instaceof Serializable
            if (this[propName].fillFromJSON) {
                console.log('nest');
                this[propName].fillFromJSON(jsonObj[propName]);
            //} else {
                console.log('value');

            }

        }
    };

    createInstanceFromJson<T>(objType: { new(): T; }, json: any) {
    const newObj = new objType();
    const relationships = objType["relationships"] || {};

    for (const prop in json) {
        if (json.hasOwnProperty(prop)) {
            if (newObj[prop] == null) {
                if (relationships[prop] == null) {
                    newObj[prop] = json[prop];
                }
                else {
                    newObj[prop] = this.createInstanceFromJson(relationships[prop], json[prop]);
                }
            }
            else {
                console.warn(`Property ${prop} not set because it already existed on the object.`);
            }
        }
    }

    return newObj;
}
}
