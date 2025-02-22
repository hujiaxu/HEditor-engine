import TextureMagnificationFilter from './TextureMagnificationFilter';
import TextureMinificationFilter from './TextureMinificationFilter';
import TextureWrap from './TextureWrap';
export default class Sampler {
    _wrapS;
    _wrapT;
    _minificationFilter;
    _magnificationFilter;
    _maximumAnisotropy;
    static NEAREST;
    get wrapS() {
        return this._wrapS;
    }
    get wrapT() {
        return this._wrapT;
    }
    get minificationFilter() {
        return this._minificationFilter;
    }
    get magnificationFilter() {
        return this._magnificationFilter;
    }
    get maximumAnisotropy() {
        return this._maximumAnisotropy;
    }
    constructor(options) {
        const { wrapS = TextureWrap.CLAMP_TO_EDGE, wrapT = TextureWrap.CLAMP_TO_EDGE, minificationFilter = TextureMinificationFilter.LINEAR, magnificationFilter = TextureMagnificationFilter.LINEAR, maximumAnisotropy = 1.0 } = options || {};
        if (!TextureWrap.validate(wrapS)) {
            throw new Error('Invalid sampler.wrapS.');
        }
        if (!TextureWrap.validate(wrapT)) {
            throw new Error('Invalid sampler.wrapT.');
        }
        if (!TextureMinificationFilter.validate(minificationFilter)) {
            throw new Error('Invalid sampler.minificationFilter.');
        }
        if (!TextureMagnificationFilter.validate(magnificationFilter)) {
            throw new Error('Invalid sampler.magnificationFilter.');
        }
        this._wrapS = wrapS;
        this._wrapT = wrapT;
        this._minificationFilter = minificationFilter;
        this._magnificationFilter = magnificationFilter;
        this._maximumAnisotropy = maximumAnisotropy;
    }
}
Sampler.NEAREST = new Sampler({
    wrapS: TextureWrap.CLAMP_TO_EDGE,
    wrapT: TextureWrap.CLAMP_TO_EDGE,
    minificationFilter: TextureMinificationFilter.NEAREST,
    magnificationFilter: TextureMagnificationFilter.NEAREST
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2FtcGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvUmVuZGVyZXIvU2FtcGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLDBCQUEwQixNQUFNLDhCQUE4QixDQUFBO0FBQ3JFLE9BQU8seUJBQXlCLE1BQU0sNkJBQTZCLENBQUE7QUFDbkUsT0FBTyxXQUFXLE1BQU0sZUFBZSxDQUFBO0FBRXZDLE1BQU0sQ0FBQyxPQUFPLE9BQU8sT0FBTztJQUNsQixNQUFNLENBQVE7SUFDZCxNQUFNLENBQVE7SUFDZCxtQkFBbUIsQ0FBUTtJQUMzQixvQkFBb0IsQ0FBUTtJQUM1QixrQkFBa0IsQ0FBUTtJQUNsQyxNQUFNLENBQUMsT0FBTyxDQUFTO0lBRXZCLElBQUksS0FBSztRQUNQLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQTtJQUNwQixDQUFDO0lBRUQsSUFBSSxLQUFLO1FBQ1AsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFBO0lBQ3BCLENBQUM7SUFFRCxJQUFJLGtCQUFrQjtRQUNwQixPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQTtJQUNqQyxDQUFDO0lBRUQsSUFBSSxtQkFBbUI7UUFDckIsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUE7SUFDbEMsQ0FBQztJQUVELElBQUksaUJBQWlCO1FBQ25CLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFBO0lBQ2hDLENBQUM7SUFFRCxZQUFZLE9BQXdCO1FBQ2xDLE1BQU0sRUFDSixLQUFLLEdBQUcsV0FBVyxDQUFDLGFBQWEsRUFDakMsS0FBSyxHQUFHLFdBQVcsQ0FBQyxhQUFhLEVBQ2pDLGtCQUFrQixHQUFHLHlCQUF5QixDQUFDLE1BQU0sRUFDckQsbUJBQW1CLEdBQUcsMEJBQTBCLENBQUMsTUFBTSxFQUN2RCxpQkFBaUIsR0FBRyxHQUFHLEVBQ3hCLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQTtRQUVqQixJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ2pDLE1BQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQTtRQUMzQyxDQUFDO1FBRUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUNqQyxNQUFNLElBQUksS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUE7UUFDM0MsQ0FBQztRQUVELElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDO1lBQzVELE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQTtRQUN4RCxDQUFDO1FBRUQsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUM7WUFDOUQsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFBO1FBQ3pELENBQUM7UUFFRCxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQTtRQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQTtRQUNuQixJQUFJLENBQUMsbUJBQW1CLEdBQUcsa0JBQWtCLENBQUE7UUFDN0MsSUFBSSxDQUFDLG9CQUFvQixHQUFHLG1CQUFtQixDQUFBO1FBQy9DLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxpQkFBaUIsQ0FBQTtJQUM3QyxDQUFDO0NBQ0Y7QUFFRCxPQUFPLENBQUMsT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDO0lBQzVCLEtBQUssRUFBRSxXQUFXLENBQUMsYUFBYTtJQUNoQyxLQUFLLEVBQUUsV0FBVyxDQUFDLGFBQWE7SUFDaEMsa0JBQWtCLEVBQUUseUJBQXlCLENBQUMsT0FBTztJQUNyRCxtQkFBbUIsRUFBRSwwQkFBMEIsQ0FBQyxPQUFPO0NBQ3hELENBQUMsQ0FBQSJ9