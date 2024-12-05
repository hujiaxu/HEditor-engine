import Scene from './Scene/Scene';
export default class Viewer {
    canvas;
    scene;
    constructor({ container, canvasHeight, canvasWidth, useGPU = false }) {
        const element = document.getElementById(container);
        if (!element) {
            throw new Error(`can not find element with id ${container}`);
        }
        const canvas = document.createElement('canvas');
        element.appendChild(canvas);
        this.canvas = canvas;
        canvas.height = canvasHeight || element.clientHeight;
        canvas.width = canvasWidth || element.clientWidth;
        this.scene = new Scene({
            canvas: this.canvas,
            isUseGPU: useGPU
        });
    }
    draw() {
        this.scene.draw();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlld2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL0VuZ2luZS9WaWV3ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxLQUFLLE1BQU0sZUFBZSxDQUFBO0FBRWpDLE1BQU0sQ0FBQyxPQUFPLE9BQU8sTUFBTTtJQUN6QixNQUFNLENBQW1CO0lBRXpCLEtBQUssQ0FBTztJQUVaLFlBQVksRUFDVixTQUFTLEVBQ1QsWUFBWSxFQUNaLFdBQVcsRUFDWCxNQUFNLEdBQUcsS0FBSyxFQUNBO1FBQ2QsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUNsRCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDYixNQUFNLElBQUksS0FBSyxDQUFDLGdDQUFnQyxTQUFTLEVBQUUsQ0FBQyxDQUFBO1FBQzlELENBQUM7UUFDRCxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQy9DLE9BQU8sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDM0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7UUFFcEIsTUFBTSxDQUFDLE1BQU0sR0FBRyxZQUFZLElBQUksT0FBTyxDQUFDLFlBQVksQ0FBQTtRQUNwRCxNQUFNLENBQUMsS0FBSyxHQUFHLFdBQVcsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFBO1FBRWpELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUM7WUFDckIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO1lBQ25CLFFBQVEsRUFBRSxNQUFNO1NBQ2pCLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFFRCxJQUFJO1FBQ0YsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUNuQixDQUFDO0NBQ0YifQ==