import { ComponentDatatype, PrimitiveType } from '../../type';
import Context from '../Renderer/Context';
import Geometry from './Geometry';
import GeometryAttribute from './GeometryAttribute';
export default class Scene {
    canvas;
    isUseGPU;
    context;
    constructor(options) {
        this.canvas = options.canvas;
        this.isUseGPU = options.isUseGPU;
        this.context = new Context({
            canvas: this.canvas,
            isUseGPU: this.isUseGPU
        });
    }
    draw() {
        const geometry = new Geometry({
            attributes: {
                position: new GeometryAttribute({
                    componentsPerAttribute: 2,
                    componentDatatype: ComponentDatatype.FLOAT,
                    values: [0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5]
                }),
                color: new GeometryAttribute({
                    values: [
                        1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0,
                        0.0, 0.0, 1.0
                    ],
                    componentsPerAttribute: 4,
                    componentDatatype: ComponentDatatype.FLOAT
                })
            },
            indices: new Uint16Array([0, 1, 2, 0, 2, 3]),
            primitiveType: PrimitiveType.TRIANGLES
        });
        this.context.draw({
            context: this.context,
            geometry
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NlbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvRW5naW5lL1NjZW5lL1NjZW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxhQUFhLEVBQWdCLE1BQU0sWUFBWSxDQUFBO0FBQzNFLE9BQU8sT0FBTyxNQUFNLHFCQUFxQixDQUFBO0FBQ3pDLE9BQU8sUUFBUSxNQUFNLFlBQVksQ0FBQTtBQUNqQyxPQUFPLGlCQUFpQixNQUFNLHFCQUFxQixDQUFBO0FBRW5ELE1BQU0sQ0FBQyxPQUFPLE9BQU8sS0FBSztJQUN4QixNQUFNLENBQW1CO0lBQ3pCLFFBQVEsQ0FBUztJQUVqQixPQUFPLENBQVM7SUFFaEIsWUFBWSxPQUFxQjtRQUMvQixJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUE7UUFDNUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFBO1FBRWhDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUM7WUFDekIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO1lBQ25CLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtTQUN4QixDQUFDLENBQUE7SUFDSixDQUFDO0lBRUQsSUFBSTtRQUNGLE1BQU0sUUFBUSxHQUFHLElBQUksUUFBUSxDQUFDO1lBQzVCLFVBQVUsRUFBRTtnQkFDVixRQUFRLEVBQUUsSUFBSSxpQkFBaUIsQ0FBQztvQkFDOUIsc0JBQXNCLEVBQUUsQ0FBQztvQkFDekIsaUJBQWlCLEVBQUUsaUJBQWlCLENBQUMsS0FBSztvQkFDMUMsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO2lCQUNyRCxDQUFDO2dCQUNGLEtBQUssRUFBRSxJQUFJLGlCQUFpQixDQUFDO29CQUMzQixNQUFNLEVBQUU7d0JBQ04sR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRzt3QkFDL0QsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO3FCQUNkO29CQUNELHNCQUFzQixFQUFFLENBQUM7b0JBQ3pCLGlCQUFpQixFQUFFLGlCQUFpQixDQUFDLEtBQUs7aUJBQzNDLENBQUM7YUFDSDtZQUNELE9BQU8sRUFBRSxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUMsYUFBYSxFQUFFLGFBQWEsQ0FBQyxTQUFTO1NBQ3ZDLENBQUMsQ0FBQTtRQUNGLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1lBQ2hCLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztZQUNyQixRQUFRO1NBQ1QsQ0FBQyxDQUFBO0lBQ0osQ0FBQztDQUNGIn0=