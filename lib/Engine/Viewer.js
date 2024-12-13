import defaultValue from './Core/DefaultValue';
import Scene from './Scene/Scene';
export default class Viewer {
    canvas;
    scene;
    defaultRenderLoop;
    constructor({ container, canvasHeight, canvasWidth, useGPU = false, defaultRenderLoop }) {
        const element = document.getElementById(container);
        if (!element) {
            throw new Error(`can not find element with id ${container}`);
        }
        const canvas = document.createElement('canvas');
        element.appendChild(canvas);
        this.canvas = canvas;
        canvas.height = canvasHeight || element.clientHeight;
        canvas.width = canvasWidth || element.clientWidth;
        canvas.oncontextmenu = () => {
            return false;
        };
        canvas.onselectstart = () => {
            return false;
        };
        this.scene = new Scene({
            canvas: this.canvas,
            isUseGPU: useGPU
        });
        this.defaultRenderLoop = defaultValue(defaultRenderLoop, true);
        this.draw();
    }
    draw() {
        if (this.defaultRenderLoop) {
            requestAnimationFrame(() => {
                this.draw();
            });
        }
        this.scene.draw();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlld2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL0VuZ2luZS9WaWV3ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxZQUFZLE1BQU0scUJBQXFCLENBQUE7QUFDOUMsT0FBTyxLQUFLLE1BQU0sZUFBZSxDQUFBO0FBRWpDLE1BQU0sQ0FBQyxPQUFPLE9BQU8sTUFBTTtJQUNsQixNQUFNLENBQW1CO0lBRXpCLEtBQUssQ0FBTztJQUNaLGlCQUFpQixDQUFTO0lBRWpDLFlBQVksRUFDVixTQUFTLEVBQ1QsWUFBWSxFQUNaLFdBQVcsRUFDWCxNQUFNLEdBQUcsS0FBSyxFQUNkLGlCQUFpQixFQUNIO1FBQ2QsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUNsRCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDYixNQUFNLElBQUksS0FBSyxDQUFDLGdDQUFnQyxTQUFTLEVBQUUsQ0FBQyxDQUFBO1FBQzlELENBQUM7UUFDRCxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQy9DLE9BQU8sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDM0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7UUFFcEIsTUFBTSxDQUFDLE1BQU0sR0FBRyxZQUFZLElBQUksT0FBTyxDQUFDLFlBQVksQ0FBQTtRQUNwRCxNQUFNLENBQUMsS0FBSyxHQUFHLFdBQVcsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFBO1FBRWpELE1BQU0sQ0FBQyxhQUFhLEdBQUcsR0FBRyxFQUFFO1lBQzFCLE9BQU8sS0FBSyxDQUFBO1FBQ2QsQ0FBQyxDQUFBO1FBQ0QsTUFBTSxDQUFDLGFBQWEsR0FBRyxHQUFHLEVBQUU7WUFDMUIsT0FBTyxLQUFLLENBQUE7UUFDZCxDQUFDLENBQUE7UUFFRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDO1lBQ3JCLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtZQUNuQixRQUFRLEVBQUUsTUFBTTtTQUNqQixDQUFDLENBQUE7UUFDRixJQUFJLENBQUMsaUJBQWlCLEdBQUcsWUFBWSxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxDQUFBO1FBRTlELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUNiLENBQUM7SUFFRCxJQUFJO1FBQ0YsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUMzQixxQkFBcUIsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3pCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtZQUNiLENBQUMsQ0FBQyxDQUFBO1FBQ0osQ0FBQztRQUNELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUE7SUFDbkIsQ0FBQztDQUNGIn0=