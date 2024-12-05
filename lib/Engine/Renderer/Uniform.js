import { UniformType } from '../../type';
export default class Uniform {
    _location;
    _value = [];
    _type = UniformType.FLOAT;
    get location() {
        return this._location;
    }
    set location(location) {
        this._location = location;
    }
    get value() {
        return this._value;
    }
    set value(value) {
        this._value = value;
    }
    get type() {
        return this._type;
    }
    set type(type) {
        this._type = type;
    }
    gl;
    /**
     * Constructs a new Uniform instance.
     *
     * @param {UniformOptions} options - The options for initializing the uniform.
     * @param {ContextType} options.gl - The WebGL context used for rendering.
     * @param {number} options.location - The location of the uniform in the shader program.
     * @param {UniformType} options.type - The data type of the uniform.
     */
    constructor({ gl, location, type }) {
        this.gl = gl;
        this._location = location;
        this._type = type;
    }
    set(value) {
        this.value = value;
        switch (this._type) {
            case UniformType.FLOAT:
            case UniformType.INT:
                this.gl.uniform1f(this.location, this.value[0]);
                break;
            case UniformType.FLOAT_VEC2:
            case UniformType.INT_VEC2:
                this.gl.uniform2f(this.location, this.value[0], this.value[1]);
                break;
            case UniformType.FLOAT_VEC3:
            case UniformType.INT_VEC3:
                this.gl.uniform3f(this.location, this.value[0], this.value[1], this.value[2]);
                break;
            case UniformType.FLOAT_VEC4:
            case UniformType.INT_VEC4:
                this.gl.uniform4f(this.location, this.value[0], this.value[1], this.value[2], this.value[3]);
                break;
            case UniformType.FLOAT_MAT2:
                this.gl.uniformMatrix2fv(this.location, false, this.value);
                break;
            case UniformType.FLOAT_MAT3:
                this.gl.uniformMatrix3fv(this.location, false, this.value);
                break;
            case UniformType.FLOAT_MAT4:
                this.gl.uniformMatrix4fv(this.location, false, this.value);
                break;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVW5pZm9ybS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvUmVuZGVyZXIvVW5pZm9ybS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQStCLFdBQVcsRUFBRSxNQUFNLFlBQVksQ0FBQTtBQUVyRSxNQUFNLENBQUMsT0FBTyxPQUFPLE9BQU87SUFDbEIsU0FBUyxDQUFrQztJQUMzQyxNQUFNLEdBQWEsRUFBRSxDQUFBO0lBQ3JCLEtBQUssR0FBZ0IsV0FBVyxDQUFDLEtBQUssQ0FBQTtJQUU5QyxJQUFJLFFBQVE7UUFDVixPQUFPLElBQUksQ0FBQyxTQUFVLENBQUE7SUFDeEIsQ0FBQztJQUVELElBQUksUUFBUSxDQUFDLFFBQThCO1FBQ3pDLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFBO0lBQzNCLENBQUM7SUFFRCxJQUFJLEtBQUs7UUFDUCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUE7SUFDcEIsQ0FBQztJQUNELElBQUksS0FBSyxDQUFDLEtBQWU7UUFDdkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUE7SUFDckIsQ0FBQztJQUVELElBQUksSUFBSTtRQUNOLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQTtJQUNuQixDQUFDO0lBQ0QsSUFBSSxJQUFJLENBQUMsSUFBaUI7UUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUE7SUFDbkIsQ0FBQztJQUVELEVBQUUsQ0FBYTtJQUVmOzs7Ozs7O09BT0c7SUFDSCxZQUFZLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQWtCO1FBQ2hELElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ1osSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUE7UUFDekIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUE7SUFDbkIsQ0FBQztJQUVELEdBQUcsQ0FBQyxLQUFlO1FBQ2pCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO1FBQ2xCLFFBQVEsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ25CLEtBQUssV0FBVyxDQUFDLEtBQUssQ0FBQztZQUN2QixLQUFLLFdBQVcsQ0FBQyxHQUFHO2dCQUNsQixJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtnQkFDL0MsTUFBSztZQUNQLEtBQUssV0FBVyxDQUFDLFVBQVUsQ0FBQztZQUM1QixLQUFLLFdBQVcsQ0FBQyxRQUFRO2dCQUN2QixJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO2dCQUM5RCxNQUFLO1lBQ1AsS0FBSyxXQUFXLENBQUMsVUFBVSxDQUFDO1lBQzVCLEtBQUssV0FBVyxDQUFDLFFBQVE7Z0JBQ3ZCLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUNmLElBQUksQ0FBQyxRQUFRLEVBQ2IsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFDYixJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUNiLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQ2QsQ0FBQTtnQkFDRCxNQUFLO1lBQ1AsS0FBSyxXQUFXLENBQUMsVUFBVSxDQUFDO1lBQzVCLEtBQUssV0FBVyxDQUFDLFFBQVE7Z0JBQ3ZCLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUNmLElBQUksQ0FBQyxRQUFRLEVBQ2IsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFDYixJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUNiLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQ2IsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FDZCxDQUFBO2dCQUNELE1BQUs7WUFDUCxLQUFLLFdBQVcsQ0FBQyxVQUFVO2dCQUN6QixJQUFJLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtnQkFDMUQsTUFBSztZQUNQLEtBQUssV0FBVyxDQUFDLFVBQVU7Z0JBQ3pCLElBQUksQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO2dCQUMxRCxNQUFLO1lBQ1AsS0FBSyxXQUFXLENBQUMsVUFBVTtnQkFDekIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7Z0JBQzFELE1BQUs7UUFDVCxDQUFDO0lBQ0gsQ0FBQztDQUNGIn0=