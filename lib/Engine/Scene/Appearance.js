import defaultValue from '../Core/DefaultValue';
import Defined from '../Core/Defined';
export default class Appearance {
    pixelSize;
    material;
    translucent;
    _vertexShaderSource;
    _fragmentShaderSource;
    _renderState;
    _closed;
    get closed() {
        return this._closed;
    }
    get vertexShaderSource() {
        return this._vertexShaderSource;
    }
    get fragmentShaderSource() {
        return this._fragmentShaderSource;
    }
    get renderState() {
        return this._renderState;
    }
    constructor(options) {
        this.material = options.material;
        /**
         * When <code>true</code>, the geometry is expected to appear translucent.
         *
         * @type {boolean}
         *
         * @default true
         */
        this.translucent = defaultValue(options.translucent, true);
        this._vertexShaderSource = options.vertexShaderSource;
        this._fragmentShaderSource = options.fragmentShaderSource;
        this._renderState = options.renderState;
        this._closed = defaultValue(options.closed, false);
    }
    isTranslucent() {
        return ((Defined(this.material) && this.material.isTranslucent()) ||
            (!Defined(this.material) && this.translucent));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBwZWFyYW5jZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvU2NlbmUvQXBwZWFyYW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLFlBQVksTUFBTSxzQkFBc0IsQ0FBQTtBQUMvQyxPQUFPLE9BQU8sTUFBTSxpQkFBaUIsQ0FBQTtBQUdyQyxNQUFNLENBQUMsT0FBTyxPQUFPLFVBQVU7SUFDdEIsU0FBUyxDQUFvQjtJQUM3QixRQUFRLENBQVU7SUFDbEIsV0FBVyxDQUFTO0lBRW5CLG1CQUFtQixDQUFvQjtJQUN2QyxxQkFBcUIsQ0FBb0I7SUFDekMsWUFBWSxDQUFvQjtJQUNoQyxPQUFPLENBQVM7SUFFeEIsSUFBVyxNQUFNO1FBQ2YsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFBO0lBQ3JCLENBQUM7SUFDRCxJQUFXLGtCQUFrQjtRQUMzQixPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQTtJQUNqQyxDQUFDO0lBQ0QsSUFBVyxvQkFBb0I7UUFDN0IsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUE7SUFDbkMsQ0FBQztJQUNELElBQVcsV0FBVztRQUNwQixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUE7SUFDMUIsQ0FBQztJQUNELFlBQVksT0FBMEI7UUFDcEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFBO1FBRWhDOzs7Ozs7V0FNRztRQUNILElBQUksQ0FBQyxXQUFXLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUE7UUFFMUQsSUFBSSxDQUFDLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQTtRQUNyRCxJQUFJLENBQUMscUJBQXFCLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFBO1FBQ3pELElBQUksQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQTtRQUN2QyxJQUFJLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFBO0lBQ3BELENBQUM7SUFFRCxhQUFhO1FBQ1gsT0FBTyxDQUNMLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3pELENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FDOUMsQ0FBQTtJQUNILENBQUM7Q0FDRiJ9