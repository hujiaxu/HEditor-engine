export default class PickId {
    _pickObjects;
    key;
    color;
    get pickObject() {
        return this._pickObjects[this.key];
    }
    set pickObject(pickObject) {
        this._pickObjects[this.key] = pickObject;
    }
    constructor(pickObjects, key, color) {
        this._pickObjects = pickObjects;
        this.key = key;
        this.color = color;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGlja0lkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL0VuZ2luZS9Db3JlL1BpY2tJZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxNQUFNLENBQUMsT0FBTyxPQUFPLE1BQU07SUFDakIsWUFBWSxDQUFhO0lBQ2pCLEdBQUcsQ0FBUTtJQUNYLEtBQUssQ0FBTztJQUU1QixJQUFJLFVBQVU7UUFDWixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ3BDLENBQUM7SUFFRCxJQUFJLFVBQVUsQ0FBQyxVQUFzQjtRQUNuQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUE7SUFDMUMsQ0FBQztJQUVELFlBQVksV0FBd0IsRUFBRSxHQUFXLEVBQUUsS0FBWTtRQUM3RCxJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQTtRQUMvQixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUNkLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0lBQ3BCLENBQUM7Q0FDRiJ9