import { ComponentDatatype } from '../../type';
export default class GeometryAttribute {
    componentDatatype;
    values;
    componentsPerAttribute;
    normalize;
    constructor(options) {
        const { componentsPerAttribute, componentDatatype, values, normalize } = options || {};
        this.componentDatatype = componentDatatype || ComponentDatatype.FLOAT;
        this.values = values;
        this.componentsPerAttribute = componentsPerAttribute || 1;
        this.normalize = normalize || false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2VvbWV0cnlBdHRyaWJ1dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvRW5naW5lL0NvcmUvR2VvbWV0cnlBdHRyaWJ1dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGlCQUFpQixFQUE0QixNQUFNLFlBQVksQ0FBQTtBQUV4RSxNQUFNLENBQUMsT0FBTyxPQUFPLGlCQUFpQjtJQUNwQyxpQkFBaUIsQ0FBUTtJQUN6QixNQUFNLENBUXFCO0lBQzNCLHNCQUFzQixDQUFRO0lBQzlCLFNBQVMsQ0FBUztJQUVsQixZQUFZLE9BQWlDO1FBQzNDLE1BQU0sRUFBRSxzQkFBc0IsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQ3BFLE9BQU8sSUFBSSxFQUFFLENBQUE7UUFDZixJQUFJLENBQUMsaUJBQWlCLEdBQUcsaUJBQWlCLElBQUksaUJBQWlCLENBQUMsS0FBSyxDQUFBO1FBQ3JFLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO1FBQ3BCLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxzQkFBc0IsSUFBSSxDQUFDLENBQUE7UUFDekQsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLElBQUksS0FBSyxDQUFBO0lBQ3JDLENBQUM7Q0FDRiJ9